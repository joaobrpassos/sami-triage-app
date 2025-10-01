# Use Node 18 LTS
FROM node:18

# Set workdir
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Expõe porta
EXPOSE 3000

# Comando para rodar
CMD ["npm", "run", "dev"]
