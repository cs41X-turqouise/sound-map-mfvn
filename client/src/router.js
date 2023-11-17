import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import ProfilePage from './views/ProfilePage.vue';
import AboutPage from './views/AboutPage.vue';
import { useStore } from 'vuex';

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
      beforeEnter: (to, from, next) => {
        const store = useStore();
        if (store.state.user) {
          next();
        } else {
          next(false);
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
