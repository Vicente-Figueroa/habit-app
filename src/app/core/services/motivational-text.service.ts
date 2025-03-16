import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivationalTextService {
  private apiKey: string = environment.googleAiApiKey;
  private modelName: string = 'gemini-1.5-flash'; // Puedes cambiar el modelo según sea necesario
  private storageKey = 'motivationalText';
  private expirationTime = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async getMotivationalTextFromModel(prompt: string): Promise<string> {
    const cachedText = this.getCachedMotivationalText();
    
    if (cachedText) {
      return cachedText;
    }

    const model = this.client.getGenerativeModel({ model: this.modelName });

    try {
      const response = await model.generateContent(prompt);
      const newMessage = response.response.text() || '';

      this.storeMotivationalText(newMessage);
      return newMessage;
    } catch (error) {
      console.error("Error al obtener el mensaje motivacional:", error);
      throw error;
    }
  }

  private getCachedMotivationalText(): string | null {
    const storedData = localStorage.getItem(this.storageKey);
    
    if (storedData) {
      const { message, timestamp } = JSON.parse(storedData);
      const now = Date.now();

      if (now - timestamp < this.expirationTime) {
        return message;
      }
    }

    return null;
  }

  private storeMotivationalText(message: string): void {
    const data = {
      message,
      timestamp: Date.now()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}
