import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import drizzleVuePlugin from "@drizzle/vue-plugin";
import drizzleOptions from "./drizzleOptions";

Vue.config.productionTip = false;

Vue.use(drizzleVuePlugin, { store, drizzleOptions });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
