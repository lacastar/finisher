import store from "../store/index";
// import { doc } from "prettier";

const fb = require("./firebase_config");
const oracles = require("../../functions/config/oracles.json")["oracles"];

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
  store.commit("resetState");
}

function getDomainuser() {
  fb.getDomainuser(store.state.user.uid, doc => {
    if (doc.exists) {
      store.commit("setDomainuser", doc.data());
    }
  });
}

function setDomainuser(userdata, process) {
  fb.setDomainuser(store.state.user.uid, userdata, () => {
    store.commit("setDomainuser", userdata);
    if (process) process();
  });
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
  getDomainuser,
  setDomainuser,
  oracles,
  oraclemap
};
