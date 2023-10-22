# Who are we?

We are a team of 8 in ODU's CS411W class, our names are:

- Patrick M.

- Kori F.

- Prestin B.

- Brandon B.

- Thomas R.

- Christian W.

- Benjamin J.

- Evan G. (`Lead Dev`)

# What are we working on? 
    The effects of global climate change are well known, one being rising sea levels. This project for a sound map is to create a site where sounds and sights are to be recorded by users to show the effects over time of the rising water levels of the Virginia Beach-Norfolk-Chesapeake region (or basically the 757 area code)

## Our intructor(s):

- Professor Thomas Kennedy

- Professor Brenden Baylor

## Designer:
Timothy Delrosario


## Table of Contents

Sound Map Board

The Sound Map Board is a web application that allows users to create and share sound maps. Explore the local area of the Hampton Roads and listen to the sounds they offer and the sights users uploaded. This project is built using JavaScript, HTML, and integrates Docker for containerization. Google OAuth is used for secure user authentication, and MongoDB is used as the database for storing sound markers.

What can be found below are:

[Getting Started](#getting-started)

[Features](#features)

[Requirements](#requirements)

[Node.js](#nodejs)

[Google OAuth](#about-oauth)

[MongoDB](#mongodb)

[How-To](#how-to)

[Licenses](#licenses)

## Getting started 

First, clone the repository. 

For example: git clone https://github.com/your-username/sound-map-mfvn.git

Then use the command `cd` into the client server
use `npm install`
then use `npm run dev`

Repeat those steps but also in the server directory (using a split/dual terminal)

The Sound Map allows you to sign into the website,
the following link will then give you access to the sound map (and all its glory)
## Features
- Some of the features in this project can be found as:

- Interactive Map: Explore different locations on the map.

- Sound Markers: Add sound markers to specific locations on the map.

- Audio Playback: Listen to the sounds recorded in different locations.

- Google OAuth: Secure login and authentication using Google accounts.

- MongoDB: Store sound markers and related data in a MongoDB database.
## Requirements

Node.js installed on your local machine (specifically node 18)

Docker installed (if you want to use Docker for containerization)

Google OAuth 2.0 credentials for authentication setup

MongoDB 
### Node.js
This project features using node.js, which is a popular high-level project building ability on top of javascript. 

### OAuth
Along with that, we will be using Google and its client to allow one to connect to the server. 
The credentials for OAuth can be (for example): 
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### MongoDB

MongoDB is used for applications to store sound markers on a map and other related data (such as images)

To ensure you have MongoDB running, make sure you have this type of url in your '.env' file

This is an example: MONGODB_URI=mongodb://localhost:27017/sound-map-board

## How-To

How would one use a sound map? Its as easy as:

Click on the map to add a sound/image marker.

Provide details about the sound/image, such as an image and/or an audio recording.

Save the marker to the map and listen to the recorded sound or view the placed image.
## Licenses

This project is licensed under the MIT License

The MIT license info can be found here: https://pitt.libguides.com/openlicensing/MIT#:~:text=Like%20the%20Apache%202.0%2C%20and,sell%20copies%20of%20the%20software.