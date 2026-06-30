FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root monorepo files
COPY package*.json tsconfig.base.json ./

# Copy backend workspaces packages
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies including workspaces
RUN npm ci --include=dev

# Copy backend application source code
COPY apps/backend/ ./apps/backend/

EXPOSE 3000

# Run in dev workspace mode
CMD ["npm", "run", "dev:backend"]
