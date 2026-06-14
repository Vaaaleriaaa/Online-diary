# Этап 1: Сборка React приложения
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm instal
COPY . .
RUN npm run build

# Этап 2: Сервер Nginx для раздачи статики
FROM nginx:alpine

# Копируем собранные файлы из этапа build
COPY --from=build /app/build /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Обработка статических файлов (кеширование на 1 год) \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Главное: все запросы, кроме статических файлов, отдаем index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]