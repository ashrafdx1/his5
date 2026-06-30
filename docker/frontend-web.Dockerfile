FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root monorepo files
COPY package*.json tsconfig.base.json ./

# Copy frontend workspace packages
COPY apps/frontend-web/package*.json ./apps/frontend-web/

# Install all dependencies including workspaces
RUN npm ci --include=dev

# Copy frontend application source code
COPY apps/frontend-web/ ./apps/frontend-web/

EXPOSE 5173

# Run in dev workspace mode (Vite uses 5173 by default)
CMD ["npm", "run", "dev:frontend"]
