import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Profile from "./views/Profile.vue";

export default createRouter({
  mode: "history",
  history: createWebHistory(),
  // base: process.env.BASE_URL,
  routes: [
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
    }
  ],
});
