# syntax=docker/dockerfile:1

############################
# Stage 1 – Build frontend and install deps
############################
FROM node:20-alpine AS builder
WORKDIR /workspace

# Copy package manifests
COPY app/backend/package*.json app/backend/
COPY app/frontend/package*.json app/frontend/

# Install dependencies
RUN npm install --prefix app/backend && npm install --prefix app/frontend

# Copy source code
COPY app/backend app/backend
COPY app/frontend app/frontend

# Build frontend (outputs to app/frontend/dist)
RUN npm run build --prefix app/frontend

############################
# Stage 2 – Runtime
############################
FROM node:20-alpine AS runtime
WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=8080

# Copy backend source and frontend build artifacts
COPY --from=builder /workspace/app/backend /workspace/app/backend
COPY --from=builder /workspace/app/frontend/dist /workspace/app/frontend/dist

# Install production dependencies for backend only
RUN npm install --omit=dev --prefix app/backend

EXPOSE 8080

CMD ["npm", "run", "start", "--prefix", "app/backend"]
