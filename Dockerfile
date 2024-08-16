# Use an official Node.js runtime as a parent image for building the Vue project
FROM node:18-alpine AS build-stage

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Add build argument for API URL
ARG BACK_API_1_URL
ENV VUE_APP_API_1_URL=${BACK_API_1_URL}
ARG BACK_API_2_URL
ENV VUE_APP_API_2_URL=${BACK_API_2_URL}

# Build the Vue.js project
RUN npm run build

# Use the official Nginx image as the base for serving the built files
FROM nginx:latest AS production-stage

# Copy custom Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy the built files from the build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R www-data:www-data /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
