FROM nginx:alpine

WORKDIR /usr/share/nginx/html/

# Clean the default public folder
RUN rm -rf * .??*

# Include expires.inc file in nginx configuration
RUN sed -i '9i\        include /etc/nginx/conf.d/expires.inc;\n' /etc/nginx/conf.d/default.conf
COPY ./expires.inc /etc/nginx/conf.d/expires.inc
RUN chmod 0644 /etc/nginx/conf.d/expires.inc

# Copy the public folder
COPY ./dist /usr/share/nginx/html

# Set up environment variables
ENV NGINX_HOST=log.consulting

# Open port
EXPOSE 80