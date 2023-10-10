#!/bin/bash

# Start from server directory
cd server

# Copy the local.env.temp file to local.env
cp local.env.template local.env

# Check if running in WSL
if grep -q Microsoft /proc/version; then
  # Running in WSL, use sudo
  sudo npm install

  # Install dependencies for the client directory
  cd ../client
  sudo npm install
else
  # Not running in WSL, don't use sudo
  npm install

  # Install dependencies for the client directory
  cd ../client
  npm install
fi