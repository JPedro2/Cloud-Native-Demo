FROM node:12

WORKDIR /usr/src/app

COPY CWOM-Action-Integration/ ./

RUN npm install
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]