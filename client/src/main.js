import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import store from './store';

import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import { io } from 'socket.io-client';
const socket = io('http://localhost:3000/');

socket.on('connect', () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  theme: {
    defaultTheme: 'light',
  },
});

createApp(App)
  .use(store)
  .use(vuetify)
  .use(router)
  .mount('#app');
