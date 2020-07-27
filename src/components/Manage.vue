<template>
  <v-container fill-height fluid>
    <v-row v-if="medals" justify="center" align="start">
      <v-col cols="12" md="6">
        <v-expansion-panels v-if="medals.length > 0" popout>
          <v-expansion-panel v-for="(item, index) in medals" :key="item.id">
            <v-expansion-panel-header color="blue lighten-4" class="text-h6"
              >{{ item.data.name }} - {{ item.data.organizer }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <span class="text-overline">Status:</span> {{ item.data.status }}
              <v-simple-table dense style="max-width:20em;">
                <template v-slot:default>
                  <tbody>
                    <tr>
                      <td>Registered:</td>
                      <td>{{ item.data.registered_count }}</td>
                    </tr>
                    <tr>
                      <td>Claimed:</td>
                      <td>{{ item.data.distributed }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <br />
              <v-card-actions>
                <v-btn color="primary" outlined @click="commit(item)"
                  >Commit</v-btn
                >
                <v-btn color="primary" outlined :to="'/register/' + index"
                  >Register</v-btn
                >
                <v-spacer />
                <!-- <v-btn color="error" outlined @click="disable(item)"
                  >Disable</v-btn
                >--><!-- :loading="deleting[item.id]" -->
              </v-card-actions>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-btn bottom color="pink" dark fab fixed right to="/create">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
//const fb = require("../scripts/firebase_config");
const business = require("../scripts/business");

/* const getMedalCostArgs = {
  contractName: "Finisher",
  method: "getMedalCost",
  methodArgs: ""
}; */

export default {
  name: "Manage",
  computed: {
    medals() {
      return this.$store.state.medals;
    },
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    utils() {
      return this.drizzleInstance.web3.utils;
    },
    web3() {
      return this.drizzleInstance.web3;
    }
    /* medalCost() {
      const cost = this.getContractData({
        contract: getMedalCostArgs.contractName,
        method: getMedalCostArgs.method
      });
      if (cost == "loading") {
        return -1;
      }
      return cost;
    } */
  },
  data() {
    return {};
  },
  methods: {
    commit(item) {
      this.transaction = this.drizzleInstance.contracts["Finisher"].methods[
        "createMedal"
      ].cacheSend(item.id, "0x" + item.data.hash);
      // {
      // value: this.medalCost * item.data.count,
      // from: this.activeAccount
      // gasPrice: 400000000,
      // gas: 20000000
      // });
    }
    //disable() {}
  },
  mounted() {
    /* const contractEventHandler = ({ contractName, eventName, data }) => {
      if (
        contractName === "Finisher" &&
        eventName === "MedalCreated" &&
        data.owner === this.activeAccount
      ) {
        fb.updateMedal(
          data.offchainid,
          {
            finisherid: data.medalid,
            status: "Ready"
          },
          () => business.refreshMedals()
        );
      }
    };
    this.$drizzleEvents.$on("drizzle/contractEvent", payload => {
      contractEventHandler(payload);
    }); */
    // this.$store.dispatch("drizzle/REGISTER_CONTRACT", getMedalCostArgs);
    if (!this.medals) {
      business.refreshMedals();
    }
  }
};
</script>
