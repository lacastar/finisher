<template>
  <v-app v-if="!user" id="inspire">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Finisher - Sign in</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="font-weight-black">
                  Welcome to Finisher, tracking your achievements on blockchain!
                </p>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" v-on:click="signIn()">
                  Continue with Google Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
  <DashBrd v-else v-on:signOut="signOut" />
</template>

<script>
import firebase from "firebase";
import DashBrd from "./components/Dashbrd.vue";
import { mapGetters } from "vuex";

const fb = require("./scripts/firebase_config");
const business = require("./scripts/business");

export default {
  name: "App",

  components: {
    DashBrd
  },
  methods: {
    signIn() {
      // Sign into Firebase using popup auth & Google as the identity provider.
      const provider = new firebase.auth.GoogleAuthProvider();
      fb.auth
        .signInWithPopup(provider)
        .then(() => {
          // result
        })
        .catch(error => {
          this.msg = JSON.stringify(error);
        });
    },
    signOut() {
      // Sign out of Firebase.
      fb.auth
        .signOut()
        .then(() => {
          this.$store.commit("setUser", null);
        })
        .catch(error => {
          this.msg = JSON.stringify(error);
        });
    }
  },
  computed: {
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    utils() {
      return this.drizzleInstance.web3.utils;
    },
    user() {
      return this.$store.state.user;
    }
  },
  data: () => ({
    //
  }),
  created() {
    firebase.auth().onAuthStateChanged(user => {
      this.$store.commit("setUser", user);
      console.log(`User changed: ${JSON.stringify(this.$store.state.user)}`);
      business.resetMedals();
    });
  }
};
</script>
