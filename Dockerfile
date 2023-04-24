# Use an official Node.js runtime as a parent image
FROM node:14.15.5-alpine

# set the working directory in the container
WORKDIR /server

# copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# install the dependencies
RUN npm install

# copy the content of the local src directory to the working directory
COPY . .

# command to run on container start
CMD [ "node", "lib/app.js" ]
