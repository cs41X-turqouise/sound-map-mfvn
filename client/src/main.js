import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from "./router";
import store from './store';
import Panel from './components/Panel.vue';
import About from './components/About.vue';
import VueRouter from 'vue-router';


import 'vuetify/styles'
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

createApp(App)
  .use(store)
  .use(vuetify)
  .use(router)
  .component('panel', Panel)
  .mount('#app');

  Vue.use(VueRouter)

const routes = [
  // ... other routes
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = new VueRouter({
  routes
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
  
