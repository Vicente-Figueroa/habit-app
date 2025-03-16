const fs = require('fs');

function setEnv() {
    // Obtén las variables de entorno de Vercel
    const githubToken = process.env.NG_APP_GITHUB_TOKEN || 'nada';

    // Define el contenido del archivo de entorno
    const envConfigFile = `
    export const environment = {
      githubToken: "${githubToken}"
      console.log(githubToken);
    };`;

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

setEnv();
