FROM node:20
WORKDIR /usr/src/app

RUN mkdir /cs571

ENV ENV_NAME=prod
ENV CS571_PUBLIC_CONFIG_PATH=/cs571/config.prod.public
ENV CS571_PRIVATE_CONFIG_PATH=/cs571/config.prod.secret
ENV PORT=37199

COPY LICENSE LICENSE
COPY tsconfig.json tsconfig.json
COPY .eslintrc.json .eslintrc.json
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY src/. src/.
COPY includes/. includes/.
RUN npm run build

EXPOSE 37199
CMD [ "npm", "start" ]