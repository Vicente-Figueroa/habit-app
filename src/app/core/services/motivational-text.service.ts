import { Injectable } from '@angular/core';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivationalTextService {
  // Obtenemos el token de GitHub desde una variable de entorno
  // Nota: en Angular, lo ideal es configurar el token de forma segura (por ejemplo, usando environment.ts)
  private token: string = environment.githubToken;
  
  private endpoint: string = 'https://models.inference.ai.azure.com';
  private modelName: string = 'DeepSeek-V3';
  
  constructor() { }

  /**
   * Llama a la API de DeepSeek para obtener un mensaje motivacional.
   * @param prompt Texto que se envía como prompt para generar el mensaje.
   * @returns Una promesa que resuelve en el mensaje generado.
   */
  async getMotivationalTextFromModel(prompt: string): Promise<string> {
    console.log( this.token)
    // Creamos el cliente usando el token y el endpoint
    const client = ModelClient(
      this.endpoint,
      new AzureKeyCredential(this.token)
    );

    // Configuramos el cuerpo de la petición
    const body = {
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      model: this.modelName,
      temperature : 1
    };

    try {
      const response = await client.path("/chat/completions").post({ body });

      if (isUnexpected(response)) {
        throw new Error();
      }

      // Extraemos y retornamos el mensaje de la respuesta
      return response.body.choices[0].message.content || '' ;
    } catch (error) {
      console.error("Error al obtener el mensaje motivacional:", error);
      throw error;
    }
  }
}
