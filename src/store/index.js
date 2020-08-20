import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    medals: null, // medals managed by this user
    user: null, // logged in user
    registeredMedals: null, // medals registered for user offchain
    medalcache: {}, // medals cached for display
    domainuser: null // handshake name
  },
  mutations: {
    resetState(state) {
      state.medals = null;
      state.registeredMedals = null;
      state.medalcache = {};
      state.domainuser = null;
    },
    // user
    setUser(state, user) {
      state.user = user;
    },
    // domainuser
    setDomainuser(state, doc) {
      state.domainuser = {
        domain: doc.domain
          ? doc.domain
          : state.domainuser
          ? state.domainuser.domain
          : null,
        skylink: doc.skylink
          ? doc.skylink
          : state.domainuser
          ? state.domainuser.skylink
          : null,
        wallet: doc.wallet
          ? doc.wallet
          : state.domainuser
          ? state.domainuser.wallet
          : null
      };
    },
    // managed medals
    refreshMedals(state, snapshot) {
      state.medals = [];
      snapshot.forEach(doc => {
        state.medals.push({
          id: doc.id,
          data: doc.data()
        });
      });
    },
    // registered medals
    refreshRegisteredMedals(state, doc) {
      state.registeredMedals = [];
      if (doc.exists) {
        for (const [key, value] of Object.entries(doc.data())) {
          state.registeredMedals.push({
            id: key,
            data: value
          });
        }
      }
    },
    updateResult(state, result) {
      if (state.registeredMedals) {
        const found = state.registeredMedals.find(
          element => element.id == result.itemid
        );
        if (found) {
          if (result.result) {
            Vue.set(found, "result", result.result);
          } else {
            Vue.delete(found, "result");
          }
        }
      }
    },
    // medalcache
    cacheMedal(state, doc) {
      Vue.set(state.medalcache, doc.id, doc.data());
    }
  },
  actions: {
    // user
    setUser(context, user) {
      context.commit("setUser", user);
    }
  },
  modules: {}
});
