FROM node:20

WORKDIR /usr/webapp

COPY package.json yarn.lock ./

RUN yarn install --ignore-platform

COPY . .

#RUN yarn add esbuild

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]