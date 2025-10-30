# Frontend Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY frontend/package.json /app/package.json
COPY frontend/tsconfig.json /app/tsconfig.json
COPY frontend/next.config.mjs /app/next.config.mjs
RUN npm install --force --legacy-peer-deps
COPY frontend /app
EXPOSE 3000
CMD ["npm", "run", "dev"]
