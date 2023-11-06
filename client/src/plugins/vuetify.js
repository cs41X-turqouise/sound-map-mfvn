import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';


const soundMapTheme = {
  dark: false,
  colors: {
    'blue': '#2768B7',
    'red': '#ed6c4e',
    'white': '#fcfce2',
    'pink': '#ede2d4',
    'hot-1': '#ffffb6',
    'hot-2': '#fbeb8f',
    'hot-3': '#f7cd6c',
    'hot-4': '#f3ae5f',
    'hot-5': '#e8945d',
    'grass-1': '#e6fddf',
    'grass-2': '#e0fedc',
    'grass-3': '#9ce292',
    'grass-4': '#81cea4',
    'grass-5': '#6bcba8',
    'water-1': '#d1f3f8',
    'water-2': '#99d9e2',
    'water-3': '#74c4d0',
    'water-4': '#52a9c5',
    'water-5': '#529ee4',
  },
};

export const vuetify = createVuetify({
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
    defaultTheme: 'soundMapTheme',
    themes: {
      soundMapTheme,
    },
  },
});
