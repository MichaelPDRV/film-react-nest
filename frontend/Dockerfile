# Стадия сборки (build stage)
FROM node:22-alpine AS build
WORKDIR /app
# Копируем файлы зависимостей
COPY package*.json ./
# Устанавливаем зависимости
RUN npm install
# Копируем исходный код
COPY . .
# Выполняем сборку проекта
RUN npm run build
