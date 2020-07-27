<template>
  <v-container fill-height fluid>
    <v-row v-if="registeredMedals.length > 0" justify="center" align="center">
      <v-col
        cols="11"
        md="6"
        lg="3"
        v-for="item in registeredMedals"
        :key="'reg' + item.id"
      >
        <v-card
          raised
          class="mx-auto"
          max-width="400"
          :color="item.result ? 'green lighten-3' : 'amber lighten-3'"
        >
          <v-img
            class="white--text align-end"
            height="200px"
            :src="medals[item.id].img"
          >
          </v-img>
          <v-card-title>{{ medals[item.id].name }}</v-card-title>
          <v-card-subtitle class="pb-0">{{
            medals[item.id].organizer
          }}</v-card-subtitle>

          <v-card-text class="text--primary">
            <div v-if="item.result">
              Result: {{ utils.hexToAscii(item.result) }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn outlined @click.prevent="claim(item)" v-if="!item.result"
              >Claim</v-btn
            >
          </v-card-actions>
        </v-card>
        <!-- <v-card
          raised
          :color="item.result ? 'green lighten-3' : 'amber lighten-3'"
          v-if="medals[item.id]"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">{{ medals[item.id].organizer }}</div>
              <v-list-item-title class="headline mb-1">{{
                medals[item.id].name
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Result: {{ item.result }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-avatar class="ma-3" size="125" tile>
              <v-img :src="medals[item.id].img"></v-img>
            </v-avatar>
          </v-list-item>
          <v-card-actions>
            <v-btn outlined @click.prevent="claim(item)" v-if="!item.result"
              >Claim</v-btn
            >
          </v-card-actions>
        </v-card>-->
      </v-col>
    </v-row>
    <!--<v-row v-if="validatedMedals.length > 0" justify="center" align="center">
      <v-col
        cols="11"
        md="6"
        lg="3"
        v-for="item in validatedMedals"
        :key="'val' + item.id"
      >
        <v-card raised color="green" v-if="medals[item.id]">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">{{ medals[item.id].organizer }}</div>
              <v-list-item-title class="headline mb-1">{{
                medals[item.id].name
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Result: {{ item.result }}</v-list-item-subtitle
              >
            </v-list-item-content>
            <v-list-item-icon>
              --><!-- <v-icon v-text="mdi - text" x-large></v-icon> -->
    <!--</v-list-item-icon>
          </v-list-item>
          --><!-- <v-card-actions>
            <v-btn outlined @click.prevent="claim(item)">Claim</v-btn>
            <v-btn outlined @click.prevent="check(item)">Check</v-btn>
          </v-card-actions> -->
    <!--</v-card>
      </v-col>
    </v-row>-->
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
const business = require("../scripts/business");
const fb = require("../scripts/firebase_config");

const getMedalCostArgs = {
  contractName: "Finisher",
  method: "getMedalCost",
  methodArgs: ""
};

/*const getResultForMedalArgs = {
  contractName: "Finisher",
  method: "getResultForMedal",
  methodArgs: ""
};*/

export default {
  name: "Home",
  computed: {
    medals() {
      return this.$store.state.medalcache;
    },
    registeredMedals() {
      if (!this.$store.state.registeredMedals) {
        business.refreshRegisteredMedals(this.activeAccount);
        return [];
      }
      return this.$store.state.registeredMedals.filter(item => {
        this.check(item);
        //return !item.result;
        return item;
      });
    },
    /*validatedMedals() {
      if (!this.$store.state.registeredMedals) {
        return [];
      }
      return this.$store.state.registeredMedals.filter(item => item.result);
    },*/
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    utils() {
      return this.drizzleInstance.web3.utils;
    },
    web3() {
      return this.drizzleInstance.web3;
    },
    medalCost() {
      return this.getContractData({
        contract: getMedalCostArgs.contractName,
        method: getMedalCostArgs.method
      });
      //if (cost == "loading") {
      //  return -1;
      //}
      //return cost;
    } /*,
    checkMedal() {
      const medalChecks = this.getContractData({
        contract: getResultForMedalArgs.contractName,
        method: getResultForMedalArgs.method,
        methodArgs: []
      });
      if (medalChecks == "loading") {
        return [];
      }
      return medalChecks;
    }*/
  },
  data() {
    return {
      transaction: null
    };
  },
  methods: {
    check(item) {
      this.drizzleInstance.contracts.Finisher.methods
        //.getResultForMedal(item.id)
        .getResultForMedal(item.id)
        .call()
        .then(res => {
          console.log(item.id + " result : " + JSON.stringify(res));
          if (res[1] && !item.result) {
            fb.updateResult(
              this.activeAccount,
              {
                [item.id + ".result"]: res[0]
              },
              () => {
                this.$store.commit("updateResult", {
                  itemid: item.id,
                  result: res[0]
                });
              }
            );
          } else {
            if (!res[1] && item.result) {
              fb.updateResult(
                this.activeAccount,
                {
                  [item.id + ".result"]: fb.removeField()
                },
                () => {
                  this.$store.commit("updateResult", {
                    itemid: item.id,
                    result: null
                  });
                }
              );
            }
          }
        });
    },
    claim(item) {
      console.log(
        "contract: " + this.drizzleInstance.contracts.Finisher.address
      );
      console.log("cost: " + this.medalCost);
      const oracle = business.oraclemap[this.medals[item.id].oracle];
      const endpoint = oracle.endpoint + "?";
      const params = new URLSearchParams({
        ...this.medals[item.id].oracleProperties,
        ...item.data.attributes
      });
      console.log("item: " + JSON.stringify(item));
      //console.log("medal: " + JSON.stringify(this.medals[item.id]));
      console.log(
        "item.id: " + item.id + " - endpoint: " + endpoint + params.toString()
      );
      //console.log(
      //  "value: " + this.medalCost + " - from: " + this.activeAccount
      //);
      this.transaction = this.drizzleInstance.contracts["Finisher"].methods[
        "claimMedal"
      ].cacheSend(item.id, endpoint + params.toString(), {
        value: this.medalCost,
        from: this.activeAccount
        // gasPrice: 400000000,
        // gas: 20000000
      });
    }
  },
  created() {
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", getMedalCostArgs);
    //if (!this.$store.state.registeredMedals) {
    //  business.refreshRegisteredMedals(this.activeAccount);
    //}
  }
};
</script>
