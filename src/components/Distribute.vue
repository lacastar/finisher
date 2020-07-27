<template>
  <v-container fill-height fluid v-if="medals">
    <v-card>
      <v-card-title class="blue lighten-4">
        Distribute medals for: {{ medal.data.name }} - {{ medal.data.organizer }}
      </v-card-title>
      <v-form>
        <v-container>
          <v-row class="mx-2">
            <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-bell"
                placeholder="Wallet address: "
                label="Wallet"
                v-model="medal.data.wallet"
                :disabled="true"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                prepend-icon="mdi-text"
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
                      v-for="(value,key) in medal.data.oracleProperties"
                      :key="key"
                    >
                      <v-text-field
                        prepend-icon="mdi-text"
                        :label="key"
                        v-model="medal.data.oracleProperties[key]"
                        type="text"
                        :disabled="true"
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
        <v-btn
          text
          @click.prevent="distribute()"
          color="primary"
          :disabled="!valid"
          >Distribute</v-btn
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
          <tr v-for="(value, key) in medal.data.registered" :key="key">
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
const business = require("../scripts/business");
//const fb = require("../scripts/firebase_config");

export default {
  name: "Distribute",
  props: ["index"],
  computed: {
    medals() {
      return this.$store.state.medals;
    },
    medal() {
      if (this.$store.state.medals) {
        return this.$store.state.medals[this.index];
      }
      return null;
    },
    oracle() {
      if (this.medal) {
        return business.oraclemap[this.medal.data.oracle];
      }
      return null;
    },
    valid() {
      if (this.medal) {
        this.medal.status === "funded"
      }
      return false;
    }
  },
  methods: {
    distribute() {}
  },
  mounted() {
    if (!this.medals) {
      business.refreshMedals();
    }
  }
};
</script>
