<template>
  <v-container fill-height fluid v-if="medals">
    <v-card v-if="medal">
      <v-card-title class="blue lighten-4">
        Register competitor for: {{ medal.data.name }}
      </v-card-title>
      <v-form v-model="valid" ref="form">
        <v-container>
          <v-row class="mx-2">
            <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-wallet"
                placeholder="Wallet address: "
                label="Wallet"
                v-model="wallet"
                :rules="walletRules"
                required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                prepend-icon="mdi-link-plus"
                label="Oracle"
                v-model="oracle.name"
                :disabled="true"
              />
            </v-col>
            <v-col cols="6">
              <v-simple-table dense>
                <template v-slot:default>
                  <tbody>
                    <tr
                      v-for="item in oracle.competitor_properties"
                      :key="item"
                    >
                      <v-text-field
                        prepend-icon="mdi-text"
                        :label="item"
                        v-model="oracle_properties[item]"
                        type="text"
                        :rules="propertyRules"
                      />
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions>
        <v-spacer />
        <v-btn text to="/manage">Cancel</v-btn>
        <v-btn text @click.prevent="register" color="primary" :disabled="!valid"
          >Register</v-btn
        >
      </v-card-actions>
    </v-card>

    <v-simple-table :dense="true">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Wallet</th>
            <th class="text-left">Status</th>
            <th class="text-left">Properties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in registeredWallets" :key="key">
            <td>{{ key }}</td>
            <td>{{ value.status }}</td>
            <td>{{ JSON.stringify(value.attributes) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>
<script>
import Vue from "vue";
const business = require("../scripts/business");
const fb = require("../scripts/firebase_config");

export default {
  name: "Register",
  props: ["index"],
  computed: {
    medals() {
      if (this.$store.state.medals) {
        return this.$store.state.medals;
      }
      business.refreshMedals();
      return [];
    },
    medal() {
      if (this.$store.state.medals) {
        return this.$store.state.medals[this.index];
      }
      return null;
    },
    registeredWallets() {
      if (this.registeredWallets_) {
        return this.registeredWallets_;
      }
      if (this.medal) {
        fb.getRegisteredWallets(this.medal.id, doc => {
          this.registeredWallets_ = {};
          if (doc.exists) {
            for (const [key, value] of Object.entries(doc.data())) {
              this.registeredWallets_[key] = value;
            }
          }
        });
      }
      return [];
    },
    oracle() {
      if (this.medal) {
        return business.oraclemap[this.medal.data.oracle];
      }
      return null;
    }
  },
  data() {
    return {
      valid: false,
      wallet: "",
      oracle_properties: {},
      walletRules: [
        v => !!v || "Required value",
        v => v.length <= 90 || "Must be less than 90 characters"
      ],
      propertyRules: [v => !!v || "Required value"],
      registeredWallets_: null
    };
  },
  methods: {
    register() {
      fb.registerCompetitor(
        this.medal.id,
        this.wallet,
        this.oracle_properties,
        () => {
          if (!this.registeredWallets_) this.registeredWallets_ = {};
          Vue.set(this.registeredWallets_, this.wallet, {
            attributes: this.oracle_properties,
            status: "new"
          });
          this.$refs.form.resetValidation();
          this.wallet = "";
          this.oracle_properties = {};
          console.log("registration successful");
        }
      );
    }
  },
  mounted() {
    //if (!this.medals) {
    //  business.refreshMedals();
    //}
  }
};
</script>
