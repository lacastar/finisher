<template>
  <v-container fill-height fluid>
    <v-alert type="error" prominent v-if="!isDrizzleInitialized">
      <v-row align="center">
        <v-col class="grow">
          You must enable MetaMask!
        </v-col>
      </v-row>
    </v-alert>

    <v-alert
      type="warning"
      prominent
      v-if="isDrizzleInitialized && (!userdata || !userdata.wallet)"
    >
      <v-row align="center">
        <v-col class="grow">
          Your MetaMask account is not saved! Please select the account you wish
          to use with Finisher and press save!
        </v-col>
        <v-col class="shrink">
          <v-btn outlined @click="saveAccount">
            Save
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <v-alert
      type="warning"
      prominent
      v-if="
        isDrizzleInitialized &&
          userdata &&
          userdata.wallet &&
          userdata.wallet !== activeAccount
      "
    >
      <v-row align="center">
        <v-col class="grow">
          Your MetaMask active account is different from your saved account!
          Please switch accounts or update the saved one!
        </v-col>
        <v-col class="shrink">
          <v-btn outlined @click="saveAccount">
            Update
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <v-alert type="warning" prominent v-if="!userdata || !userdata.domain">
      <v-row align="center">
        <v-col class="grow">
          You can choose a free Namebase domain in the form: mydomain.dfmo
        </v-col>
        <v-col class="shrink">
          <v-btn outlined @click="dialog = true">
            Request domain
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="requdomain"
              label="Claim your domain:"
            ></v-text-field>
          </v-form>
          <small class="grey--text"
            >* You can choose one free domain under dfmo like:
            supertrooper.dfmo</small
          >
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            outlined
            :disabled="!validdomain"
            text
            color="primary"
            @click.prevent="requestDomain()"
            >Request domain</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
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
          v-if="medals[item.id]"
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
      </v-col>
    </v-row>
    <v-card class="fab-container d-flex align-end flex-column justify-end">
      <v-btn
        v-if="userdata && userdata.skylink"
        color="green"
        icon
        dark
        fab
        :href="'https://siasky.net/' + userdata.skylink"
      >
        <v-avatar tile size="40">
          <v-img src="../assets/skynet.svg" alt=""></v-img>
        </v-avatar>
      </v-btn>
      <v-btn
        color="orange"
        icon
        dark
        fab
        :href="'https://' + userdata.domain + '.dfmo'"
        v-if="userdata && userdata.domain"
      >
        <v-avatar tile size="40">
          <v-img src="../assets/namebase.png" alt=""></v-img>
        </v-avatar>
      </v-btn>
      <v-btn fab color="pink" dark @click.prevent="share()">
        <v-icon>mdi-share</v-icon>
      </v-btn>
    </v-card>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import { SkynetClient } from "skynet-js";

import template_1 from "!!raw-loader!../assets/template/index_1.html";
import template_2 from "!!raw-loader!../assets/template/index_2.html";
import template_3 from "!!raw-loader!../assets/template/index_3.html";
import template_4 from "!!raw-loader!../assets/template/index_4.html";

import main_js from "!!raw-loader!../assets/template/js/main.js.txt";
import plugins_js from "!!raw-loader!../assets/template/js/plugins.js.txt";
import templatemo_style_css from "!!raw-loader!../assets/template/css/templatemo-style.css";

// !raw-loader!
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
    displayName() {
      return this.$store.state.user.displayName;
    },
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
    },
    user() {
      return this.$store.state.user;
    },
    userdata() {
      return this.$store.state.domainuser;
    },
    validdomain() {
      return this.requdomain.match(/^([a-zA-Z0-9_-]{1,20})$/);
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
      transaction: null,
      requdomain: "",
      dialog: false
    };
  },
  methods: {
    saveAccount() {
      business.setDomainuser({ wallet: this.activeAccount });
    },
    requestDomain() {
      business.setDomainuser({ domain: this.requdomain }, () => {
        if (this.userdata.domain !== this.requdomain) {
          console.log("Could not set domain");
        } else {
          this.dialog = false;
        }
      });
    },
    share() {
      let skynetClient = new SkynetClient("https://siasky.net");
      let content = template_1;
      content += "<title>Finisher - " + this.displayName + "</title>";
      content += template_2;
      content +=
        "<h1><a href='https://finisher-e976e.web.app/'><em>Finisher</em> " +
        this.displayName +
        "</a></h1><br><span>Your medals on blockchain</span>";
      content += template_3;
      this.registeredMedals.forEach(medal => {
        if (medal.result) {
          content += "<div class='post-masonry col-md-4 col-sm-6'>";
          content += "<div class='blog-thumb'>";
          content += "<img src='" + this.medals[medal.id].img + "' alt=''>";
          content += "</div>";
          content += "<div class='blog-body'>";
          content += "<div class='box-content'>";
          content +=
            "<h3 class='post-title'>" + this.medals[medal.id].name + "</h3>";
          content +=
            "<span class='blog-meta'>Organiser: " +
            this.medals[medal.id].organizer +
            "</span>";
          content +=
            "<p><b class='green'>Result: </b>" +
            this.utils.hexToAscii(medal.result) +
            "</p>";
          content += "</div>";
          content += "</div>";
          content += "</div>";

          //content += "<br><img src='" + this.medals[medal.id].img + "'>";
          //content += "<br>Result: " + this.utils.hexToAscii(medal.result);
        }
      });
      content += template_4;
      const mediaFolder = {
        "index.html": new File([content], "index.html", { type: "text/html" }),
        "templatemo-style.css": new File(
          [templatemo_style_css],
          "templatemo-style.css",
          { type: "text/css" }
        ),
        "plugins.js": new File([plugins_js], "plugins.js", {
          type: "application/javascript"
        }),
        "main.js": new File([main_js], "main.js", {
          type: "application/javascript"
        })
      };
      try {
        (async () => {
          try {
            const { skylink } = await skynetClient.uploadDirectory(
              mediaFolder,
              "mediaFolder",
              progress => {
                console.info(`Progress ${Math.round(progress * 100)}%`);
              }
            );
            console.log("skylink: " + skylink);
            this.skylink = skylink;

            business.setDomainuser({ skylink: skylink }, () => {
              if (this.userdata.domain) {
                fb.shareResults({
                  name: this.userdata.domain,
                  skylink: skylink
                })
                  .then(result => {
                    // Read result of the Cloud Function.
                    const response = result.data;

                    if (response.status === "ok") {
                      // this.namebase = response.link;
                      console.log("registered at namebase: " + response.link);
                    } else {
                      console.log("failed: " + JSON.stringify(response));
                    }
                  })
                  .catch(error => {
                    console.log("errors: " + JSON.stringify(error) + error);
                  })
                  .finally(() => {});
              }
            });
          } catch (error) {
            console.log("error: " + error);
          }
        })();
      } catch (error) {
        console.log("Error: " + error);
      }
    },
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
      /* fb.claimMedal({ medalid: item.id }).then(result => {
        if (result.data.status === "ok") {
          this.web3.eth.sendSignedTransaction(
            result.data.raw,
            (err, txHash) => {
              console.log("err:", err, "txHash:", txHash);
              // Use this txHash to find the contract on Etherscan!
            }
          );
        }
      });*/

      fb.claimMedal({ medalid: item.id }).then(result => {
        if (result.data.status === "ok") {
          const sig = result.data.sig;
          // const r = `0x${sig.slice(0, 64)}`;
          // const s = `0x${sig.slice(64, 128)}`;
          // const v = this.web3.toDecimal(sig.slice(128, 130)) + 27;

          this.drizzleInstance.contracts["Finisher"].methods[
            "claimMedal"
          ].cacheSend(
            item.id,
            this.web3.utils.fromAscii(result.data.result),
            sig.v,
            sig.r,
            sig.s,
            {
              value: this.medalCost,
              from: this.activeAccount
              // gasPrice: 400000000,
              // gas: 20000000
            }
          );
        }
      });

      /*
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
      console.log(
        "item.id: " + item.id + " - endpoint: " + endpoint + params.toString()
      );
      this.transaction = this.drizzleInstance.contracts["Finisher"].methods[
        "claimMedal"
      ].cacheSend(item.id, endpoint + params.toString(), {
        value: this.medalCost,
        from: this.activeAccount
        // gasPrice: 400000000,
        // gas: 20000000
      });
      */
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
<style>
.fab-container {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
