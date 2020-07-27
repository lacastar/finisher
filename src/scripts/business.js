import store from "../store/index";

const fb = require("./firebase_config");
const oracles = require("../config/oracles.json")["oracles"];

const oraclemap = {};
oracles.forEach(oracle => {
  oraclemap[oracle["id"]] = oracle;
});

function refreshMedals() {
  fb.getMedals(store.state.user.uid, snapshot =>
    store.commit("refreshMedals", snapshot)
  );
}

function resetMedals() {
  store.commit("resetMedals");
}

function refreshRegisteredMedals(wallet) {
  fb.getRegisteredMedals(wallet, doc => {
    store.commit("refreshRegisteredMedals", doc);
    if (doc.exists) {
      for (const key of Object.keys(doc.data())) {
        if (!store.state.medalcache[key]) {
          fb.getMedal(key, doc => store.commit("cacheMedal", doc));
        }
      }
    }
  });
}

function refreshRegisteredWallets(medalid, process) {
  fb.getRegisteredWallets(medalid, snapshot =>
    //store.commit("refreshRegisteredWallets", snapshot)
    process ? process(snapshot) : null
  );
}

export {
  refreshMedals,
  resetMedals,
  refreshRegisteredMedals,
  refreshRegisteredWallets,
  oracles,
  oraclemap
};
