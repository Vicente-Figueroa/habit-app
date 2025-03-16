const fs = require('fs');

function setEnv() {
    // Obtén la clave de API desde las variables de entorno (por ejemplo, en Vercel o en otro servicio de hosting)
    const googleAiApiKey = process.env.NG_APP_GOOGLE_AI_API_KEY || 'nada';

    // Define el contenido del archivo de entorno
    const envConfigFile = `
    export const environment = {
      googleAiApiKey: "${googleAiApiKey}"
    };`;

    console.log(`Google AI API Key: ${googleAiApiKey}`);

    // Ruta del archivo de entorno
    const targetPath = './src/environments/environment.ts';

    // Escribe el archivo environment.ts
    fs.writeFile(targetPath, envConfigFile, (err) => {
        if (err) {
            console.error("Error al escribir el archivo de entorno:", err);
            throw err;
        }
        console.log(`Archivo ${targetPath} generado correctamente.`);
    });
}

// Ejecuta la función para crear el archivo de entorno
setEnv();
