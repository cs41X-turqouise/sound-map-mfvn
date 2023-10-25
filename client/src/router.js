import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import ProfilePage from './views/ProfilePage.vue';
import AboutPage from './views/AboutPage.vue';

export default createRouter({
  mode: 'history',
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'AboutPage',
      component: AboutPage,
    },
    {
      path: '/profile',
      name: 'ProfilePage',
      component: ProfilePage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
