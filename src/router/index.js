import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../components/Home.vue";
import Manage from "../components/Manage.vue";
import Create from "../components/Create.vue";
import Register from "../components/Register.vue";
// import Distribute from "../components/Distribute.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/manage",
    name: "Manage",
    component: Manage
  },
  {
    path: "/create",
    name: "Create",
    component: Create
  },
  {
    path: "/register/:index",
    name: "Register",
    component: Register,
    props: true
  }
  /* {
    path: "/distribute/:index",
    name: "Distribute",
    component: Distribute,
    props: true
  } */
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
