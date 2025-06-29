# Usa una imagen oficial de Node.js
FROM node:18

# Establece directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código al contenedor
COPY . .

# Compila el proyecto (usa tsconfig.json)
RUN npm run buildS

# Expone el puerto que usa tu aplicación NestJS
EXPOSE 3000

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "start:prod"]