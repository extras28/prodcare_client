# Step 1: Build the React app
FROM node:14 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy the build files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY /nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3001 

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
