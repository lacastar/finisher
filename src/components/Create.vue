<template>
  <v-container fill-height fluid>
    <v-card>
      <v-card-title class="blue lighten-4">
        Create Medal
      </v-card-title>
      <v-form v-model="validMedal">
        <v-container>
          <v-row class="mx-2">
            <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-medal-outline"
                placeholder="2020 Budapest Super 10K"
                label="Name"
                v-model="medal.name"
                :rules="nameRules"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-checkbox-marked-outline"
                placeholder="Universal Organizer"
                label="Organizer"
                v-model="medal.organizer"
                :rules="nameRules"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-image-frame"
                placeholder="link to image"
                label="Image"
                v-model="medal.img"
              />
            </v-col>
            <!-- <v-col cols="12">
              <v-text-field
                prepend-icon="mdi-message-alert"
                label="Number of medals"
                v-model="medal.count"
                type="number"
                :min="1"
                :max="1000000"
              />
            </v-col> -->
            <v-col cols="6">
              <v-select
                prepend-icon="mdi-link-plus"
                v-model="medal.oracle"
                :items="oracles"
                item-text="name"
                item-value="id"
                label="Oracle"
                persistent-hint
                return-object
                single-line
              >
              </v-select>
            </v-col>
            <v-col cols="6">
              <v-simple-table dense>
                <template v-slot:default>
                  <tbody v-if="medal.oracle">
                    <tr
                      v-for="item in medal.oracle.medal_properties"
                      :key="item"
                    >
                      <v-text-field
                        prepend-icon="mdi-text"
                        :label="item"
                        v-model="medal.oracleProperties[item]"
                        type="text"
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
        <v-btn text @click="cancel">Cancel</v-btn>
        <v-btn
          text
          @click.prevent="addMedal"
          color="primary"
          :disabled="!validMedal"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script>
const fb = require("../scripts/firebase_config");
const business = require("../scripts/business");
import { mapGetters } from "vuex";

export default {
  name: "Create",
  computed: {
    ...mapGetters("accounts", ["activeAccount", "activeBalance"])
  },
  data() {
    return {
      validMedal: false,
      oracles: business.oracles,
      medal: {
        name: "",
        organizer: "",
        // count: 10,
        img: "",
        oracle: null,
        oracleProperties: {}
      },
      nameRules: [
        v => !!v || "Required value",
        v => v.length <= 90 || "Must be less than 90 characters"
      ]
    };
  },
  methods: {
    cancel() {
      this.medal = {
        name: "",
        organizer: "",
        // count: 10,
        img: "",
        oracle: null,
        oracleProperties: {}
      };
      this.$router.push("/manage");
    },
    addMedal() {
      const payload = {
        name: this.medal.name,
        organizer: this.medal.organizer,
        // count: this.medal.count,
        wallet: this.activeAccount,
        img: this.medal.img,
        oracle: this.medal.oracle.id,
        oracleProperties: this.medal.oracleProperties
      };

      fb.createMedal(payload)
        .then(result => {
          // Read result of the Cloud Function.
          const response = result.data;

          if (response.status === "ok") {
            business.resetMedals();
            this.$router.push("/manage");
          } else {
            console.log("failed: " + JSON.stringify(response));
          }
        })
        .catch(error => {
          console.log("errors: " + JSON.stringify(error) + error);
        })
        .finally(() => {});
    }
  }
};
</script>
