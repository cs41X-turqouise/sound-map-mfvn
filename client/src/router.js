import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import ProfilePage from './views/ProfilePage.vue';
import AboutPage from './views/AboutPage.vue';
import AdminPage from './views/AdminPage.vue';
import InboxPage from './views/InboxPage.vue';
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
      path: '/inbox',
      name: 'InboxPage',
      component: InboxPage,
      beforeEnter: (to, from, next) => {
        const store = useStore();
        store.state.user
          ? next()
          : next('/');
      },
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
          next('/');
        }
      },
    },
    {
      path: '/admin',
      name: 'AdminPage',
      component: AdminPage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
