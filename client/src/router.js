import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Profile from "./views/Profile.vue";
import Register from "./views/Register.vue";

export default createRouter({
  mode: "history",
  history: createWebHistory(),
  routes: [
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("./views/About.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
