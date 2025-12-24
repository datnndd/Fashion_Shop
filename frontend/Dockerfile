# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose port 5173
EXPOSE 5173

# Start the application using vite preview
# --host 0.0.0.0 is needed to expose the server to outside the container
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
