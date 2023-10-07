# syntax=docker/dockerfile:1

FROM ubuntu:22.04

# install app dependencies We will need to determine all dependencies to include
# RUN apt-get update && apt-get install
#you can use the run command as many times as you like to get all dependecies installed
# RUN install python3

#this command will copy and files from the local build into the root directory of the image
# COPY README.md

#if we need to include any environment variables put them here
# ENV 

#if we need to listen to any ports (likely for database) we will need to note them here
# EXPOSE 8080

#this command will start the application 
# CMD soundmap --host 0.0.0.0  --port 8080


