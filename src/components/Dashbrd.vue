<template>
  <v-app id="inspireapp">
    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      dense
      color="blue darken-3"
      dark
      hide-on-scroll
    >
      <v-toolbar-title style="width: 300px; cursor: pointer;" class="ml-0 pl-4"
        ><v-btn to="/" :text="true"><span>Finisher</span></v-btn>
      </v-toolbar-title>
      <!-- </router-link> -->
      <v-spacer />

      <v-menu offset-y open-on-hover>
        <template v-slot:activator="{ on }">
          <v-btn icon large v-on="on">
            <v-avatar>
              <v-icon dark>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :key="'user'">
            <v-list-item-title>{{ user.displayName }}</v-list-item-title>
            <!--   <div>
              <v-list-item-subtitle> ({{ user.email }})</v-list-item-subtitle>
            </div> -->
          </v-list-item>
          <v-list-item :key="'manage'" to="/manage">
            <v-list-item-title>Manage</v-list-item-title>
          </v-list-item>
          <v-list-item :key="'logout'" v-on:click="signOut()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view v-if="isDrizzleInitialized" />
    </v-main> </v-app
></template>

<script>
import { mapGetters } from "vuex";
const fb = require("../scripts/firebase_config");
const business = require("../scripts/business");

export default {
  name: "DashBoard",
  computed: {
    user() {
      return this.$store.state.user;
    },
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"])
  },
  data() {
    return {
      drawer: true
    };
  },
  methods: {
    signOut() {
      this.$emit("signOut");
    }
  },
  mounted() {
    const contractEventHandler = ({ contractName, eventName, data }) => {
      if (contractName === "Finisher" && data.owner === this.activeAccount) {
        if (eventName === "MedalCreated") {
          fb.updateMedal(
            data.offchainid,
            {
              status: "Ready"
            },
            () => business.refreshMedals()
          );
        } else if (eventName === "MedalVerified") {
          fb.updateResult(
            this.activeAccount,
            {
              [data.offchainid + ".result"]: data.result
            },
            () => business.refreshRegisteredMedals(this.activeAccount)
          );
        }
      }
    };
    this.$drizzleEvents.$on("drizzle/contractEvent", payload => {
      contractEventHandler(payload);
    });
  }
};
</script>
<style scoped></style>
