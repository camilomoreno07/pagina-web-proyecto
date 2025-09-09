# Use the latest Node.js LTS image
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Install missing TypeScript types if needed
RUN npm install --save-dev @types/js-cookie

# Copy all source files
COPY . .

# Build the project (uses your package.json build script)
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]
