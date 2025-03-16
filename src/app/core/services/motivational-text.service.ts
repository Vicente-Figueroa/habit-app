import { Injectable } from '@angular/core';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivationalTextService {
  private token: string = environment.githubToken;
  private endpoint: string = 'https://models.inference.ai.azure.com';
  private modelName: string = 'DeepSeek-V3';
  private storageKey = 'motivationalText';
  private expirationTime = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

  constructor() {}

  async getMotivationalTextFromModel(prompt: string): Promise<string> {
    const cachedText = this.getCachedMotivationalText();
    
    if (cachedText) {
      return cachedText;
    }

    const client = ModelClient(this.endpoint, new AzureKeyCredential(this.token));
    const body = {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      model: this.modelName,
      temperature: 1
    };

    try {
      const response = await client.path("/chat/completions").post({ body });

      if (isUnexpected(response)) {
        throw new Error();
      }

      const newMessage = response.body.choices[0].message.content || '';
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
