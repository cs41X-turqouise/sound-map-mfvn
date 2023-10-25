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
