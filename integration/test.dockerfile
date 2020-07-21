FROM node:14 as Base

FROM Base as Development
WORKDIR /service

FROM Base as Builder
WORKDIR /service
COPY . .
RUN ["yarn", "--cwd", "/service", "install"]
RUN ["yarn", "--cwd", "/service", "tsc" , "--skipLibCheck"]

FROM Base as Tests
WORKDIR /service
COPY --from=Builder /service/integration ./integration
COPY --from=Builder /service/src ./src
COPY --from=Builder /service/package.json ./
COPY --from=Builder /service/node_modules ./node_modules
COPY --from=Builder /service/tsconfig.json ./
COPY --from=Builder /service/jest_integration.json ./
ENTRYPOINT ["yarn", "--cwd", "/service", "integration"]