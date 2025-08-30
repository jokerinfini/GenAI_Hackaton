FROM node:18-alpine

WORKDIR /app

# Install React Native CLI
RUN npm install -g @react-native-community/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port for development server
EXPOSE 8081

# Start the development server
CMD ["npm", "start"]
