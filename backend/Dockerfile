# Стадия сборки (build stage)
FROM node:20 AS builder
WORKDIR /app
# Копируем файлы зависимостей
COPY package*.json ./
# Устанавливаем зависимости
RUN npm ci
# Копируем исходный код
COPY . .
# Компилируем TypeScript в JavaScript
RUN npm run build


# Production stage
FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
