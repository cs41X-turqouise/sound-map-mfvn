# Sound Map for a Changing Landscape
Built off of **M**ongoDB, **F**astify, **V**ue, and **N**ode, otherwise known as *MFVN* stack. Sound Map for a Changing Landscape is, as the name suggests, an interactive soundscape. It utilizes [LeafletJS](https://leafletjs.com/) to allow users to pan around a world map and view user uploaded markers at specifc locations that contain audio recordings.

## Table of Contents

[Getting Started](#getting-started)

[Features](#features)

[Technical](#technical)

[Requirements](#requirements)

[Contribute](#contribute)

[Contributors](#contributors)

[Licenses](#licenses)

## Getting started 

1) Always start simple, clone this repo https://github.com/cs41X-turqouise/sound-map-mfvn.git
2) Open a terminal and navigate to the root folder of the repo
3) Install the node packages via npm in both the client & server folders
```
cd .\client\ && npm install && cd ..\server\ && npm install
```
4) This project requires MongoDB connection. Learn more here https://www.mongodb.com/docs/guides/atlas/cluster/
5) This project requires an API key from https://www.geoapify.com/reverse-geocoding-api
6) This project requires an access token from https://www.mapbox.com/maps
7) This project requires Google OAuth token from https://console.cloud.google.com/
8) Create a copy of [local.env.template](./server/local.env.template) and name it `local.env`
9) Fill out the enviroment variables
10) Finally you are ready to run. Open two terminals, in one cd into the server directory and in the other cd into the client directory.
In both run
```
npm run dev
```
11) By default vite will startup the frontend server on port 5173. Open http://localhost:5173/ in your web browser to view the page.

## Features
- Interactive Map: Pan, zoom, and navigate around a world map populated with markers.
  - Map Markers: User uploaded audio recordings corresponding to specific lat/lng coordinates
  - Audio Player: Listen to the sounds recorded in different locations.
- Secure Login via OAuth2 using Google account.
- Search Modal: Look for uploads corresponding to specific parameters.
- Profile Page: View and manage all your own personal uploads from a private profile page.

## Technical
- [Vite](https://vitejs.dev/) + [Vue3](https://vuejs.org/) powers the front-end
- [Vuetify](https://vuetifyjs.com/en/#sass-card-title-flex) handles the styling
- [Vuex](https://vuex.vuejs.org/) handles the global state management
- [Fastify](https://fastify.dev/) is our back-end web framework
- [MongoDB](https://www.mongodb.com/) is the database with [Mongoose](https://mongoosejs.com/) as the driver
- File uploads are handled using MongoDB's [GridFS](https://www.mongodb.com/docs/manual/core/gridfs/) and utilizing [Multer](https://github.com/fox1t/fastify-multer) to parse the formdata
- [Sessions](https://github.com/fastify/session) handle persisting user data between requests
- Documentation provided by [Swagger](https://github.com/fastify/fastify-swagger), view in browser at http://localhost:3000/docs/static/index.html#/

## Requirements
- Minimum Node.js v20.9.0 LTS
- Docker installed (if you want to use Docker for containerization)

## Contribute
If you find a bug please open a issue first and for major changes please open a discussion. Otherwise Feel free to send pull request with new features, and/or documentation improvements!

## Contributors
| | | |
| --- | --- | --- |
| <img src="https://avatars.githubusercontent.com/u/60308670?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [theBGuy](https://github.com/theBGuy) | egold001@odu.edu
| <img src="https://avatars.githubusercontent.com/u/87440608?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [MeagherPatrick](https://github.com/MeagherPatrick) | pmeag001@odu.edu
| <img src="https://avatars.githubusercontent.com/u/104028649?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [PrestinB12](https://github.com/PrestinB12) | pbell003@odu.edu
| <img src="https://avatars.githubusercontent.com/u/109049594?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [zeroday-zaddy](https://github.com/zeroday-zaddy) | kfogl001@odu.edu
| <img src="https://avatars.githubusercontent.com/u/84207119?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [tr29038](https://github.com/tr29038) | treyn008@odu.edu
| <img src="https://avatars.githubusercontent.com/u/98424636?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [Cwoody240](https://github.com/Cwoody240) | cwood012@odu.edu
| <img src="https://avatars.githubusercontent.com/u/123480563?s=64&v=4" alt="github-avatar" width="50" height="50" /> | [bjohn108-ODU](https://github.com/bjohn108-ODU) | bjohn108@odu.edu

## What is the purpose  

The purpose of this project is to foster a deeper understanding and awareness of climate change through an interactive, user-driven experience. By allowing users to upload audio recordings at specific locations on a world map, we aim to create a dynamic and evolving soundscape that reflects the changing landscape of our planet.

This interactive map serves as a platform for individuals around the world to share their local experiences of climate change. Whether it's the sound of a dwindling bird species in a particular region, the noise of construction as sea levels force communities to relocate, or the changing soundscapes of urban environments as they become greener, every user contribution helps to paint a more comprehensive picture of our changing world.

By engaging with this project, users are not just passive observers of climate change, but active participants in documenting its effects. We believe that this active participation can lead to increased climate change awareness and inspire action towards environmental sustainability.

## Licenses

This project is licensed under the MIT License

The MIT license info can be found here: https://pitt.libguides.com/openlicensing/MIT#:~:text=Like%20the%20Apache%202.0%2C%20and,sell%20copies%20of%20the%20software.
