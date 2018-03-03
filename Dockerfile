FROM node:carbon
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

COPY . .
RUN npm run webpack-compile

# Expose the needed port
# EXPOSE 80

CMD [ "npm", "run", "start-server" ]
