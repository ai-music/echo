FROM node:14 as base

FROM base as development
WORKDIR /service

FROM base as builder
WORKDIR /service
COPY . .
RUN ["yarn", "tsc" , "--skipLibCheck"]

FROM base as tests
WORKDIR /service
COPY --from=builder /service/integration ./integration
COPY --from=builder /service/src ./src
COPY --from=builder /service/package.json ./
COPY --from=builder /service/node_modules ./node_modules
COPY --from=builder /service/tsconfig.json ./
COPY --from=builder /service/jest_integration.json ./
ENTRYPOINT ["yarn", "integration"]