const functions = require("firebase-functions");
const admin = require("firebase-admin");
const keccak256 = require("js-sha3").keccak256;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const superagent = require("superagent");

const oracles = require("./config/oracles.json")["oracles"];

const oraclemap = {};
oracles.forEach(oracle => {
  oraclemap[oracle["id"]] = oracle;
});
admin.initializeApp();

const db = admin.firestore();

const namebaseAuth =
  "Basic " +
  Buffer.from(
    `${functions.config().namebase.key}:${functions.config().namebase.secret}`
  ).toString("base64");

const namebaseDomain = functions.config().namebase.domain;

const web3 = new Web3(functions.config().owneraccount.endpoint);
// const account1 = "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
/* const privateKey1 = Buffer.from(
  "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "hex"
); */
// const privatekey =
//   "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const privatekey = functions.config().owneraccount.privatekey;

// const contractAddress = "0xe79b3Ad7c2dc6991FCB19770C82E633bC8643780";
// const contractABI = require("../src/contracts/Finisher.json").abi;
// const contract = new web3.eth.Contract(contractABI, contractAddress);

exports.claimMedal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  // get wallet
  const _userdata = await db
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!_userdata.exists || !_userdata.data().wallet) {
    return { status: "error", reason: "user account not set" };
  }
  const userdata = _userdata.data();
  // get medal
  const _medaldata = await db
    .collection("medals")
    .doc(data.medalid)
    .get();
  if (!_medaldata.exists) {
    return { status: "error", reason: "medal data not found" };
  }
  const medaldata = _medaldata.data();

  // get registration
  const _registration = await db
    .collection("medals-registered-to-wallets")
    .doc(userdata.wallet)
    .get();
  if (!_registration.exists || !_registration.data()[data.medalid]) {
    return { status: "error", reasion: "registration data not found" };
  }
  const registration = _registration.data();
  if (registration[data.medalid].result) {
    return { status: "error", reason: "result already set" };
  }

  // get oracle
  const oracle = oraclemap[medaldata.oracle];

  // assemble params
  const params = {
    ...medaldata.oracleProperties,
    ...registration[data.medalid].attributes
  };

  // get result
  const result = await global[oracle.method](params);
  if (!result.result) {
    return { status: "error", reason: "result error" };
  }
  const msg = web3.utils.soliditySha3(
    { t: "string", v: data.medalid },
    { t: "address", v: userdata.wallet },
    {
      t: "bytes32",
      v: web3.utils.padRight(web3.utils.fromAscii(result.result), 64)
    }
  );
  /*const msg = web3.eth.abi.encodeParameters(
    ["string", "address", "bytes32"],
    [
      data.medalid,
      userdata.wallet,
      web3.utils.padRight(web3.utils.fromAscii(result.result), 64)
    ]
  );*/

  /*const h = web3.utils.sha3(msg);*/
  var sig = web3.eth.accounts.sign(msg, privatekey);

  return {
    status: "ok",
    result: result.result,
    sig: sig
  };
  /*
  const cost = await contract.methods.getMedalCost().call();

  return web3.eth
    .getTransactionCount(account1)
    .then(txCount => {
      const txObject = {
        value: web3.utils.numberToHex(cost),
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(800000), // Raise the gas limit to a much higher amount
        gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
        to: contractAddress,
        data: contract.methods
          .claimMedal(
            data.medalid,
            userdata.wallet,
            web3.utils.fromAscii(result.result)
          )
          .encodeABI()
      };

      const tx = new Tx(txObject);
      tx.sign(privateKey1);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");

      return { status: "ok", raw: raw };
      // web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      //  console.log("err:", err, "txHash:", txHash);
      // Use this txHash to find the contract on Etherscan!
      // });
    })
    .catch(err => {
      return { status: "error", reason: err };
    });
    */
});
/*
exports.checkMedal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  web3.eth.getTransactionCount(account1, (err, txCount) => {
    if (err) {
      console.log("Err: " + err);
      return err;
    }
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(800000), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      to: contractAddress,
      data: contract.methods.setMedalCost(3).encodeABI()
    };

    const tx = new Tx(txObject);
    tx.sign(privateKey1);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      console.log("err:", err, "txHash:", txHash);
      // Use this txHash to find the contract on Etherscan!
    });
  });
});
*/

exports.shareResults = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const name = data.name;
  const skylink = data.skylink;

  const ret = await superagent
    .put(
      "https://www.namebase.io/api/v0/dns/domains/" +
        namebaseDomain +
        "/nameserver"
    )
    .set("Authorization", namebaseAuth)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      records: [
        { type: "CNAME", host: name, value: "redirect.dns.live", ttl: 5 },
        {
          type: "TXT",
          host: "_redirect." + name,
          value: "v=txtv0;type=host;to=https://siasky.net/" + skylink,
          ttl: 5
        }
      ],
      deleteRecords: []
    });
  if (ret.status === 200) {
    let jret = JSON.parse(ret.text);
    return {
      status: jret.success ? "ok" : "error",
      link: name + "." + namebaseDomain,
      msg: jret.message
    };
  } else {
    return {
      status: ret.status,
      msg: ret.text
    };
  }
});

exports.createMedal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const created = new Date();
  const hash = keccak256(data.name + data.organizer);
  // create medal
  // registrations should be separated later...

  const medal = await db.collection("medals").add({
    name: data.name,
    organizer: data.organizer,
    wallet: data.wallet,
    img: data.img,
    distributed: 0,
    registered_count: 0,
    // registered: {},
    // count: data.count,
    status: "Draft",
    // finisherid: null,
    hash: hash,
    created: created,
    user: context.auth.uid,
    oracle: data.oracle,
    oracleProperties: data.oracleProperties
  });

  return { status: "ok", id: medal._path.segments[1], hash: hash };
});

global.bsioracle = async params => {
  const ret = await superagent
    .post(
      "http://www.futanet.hu/versenyeredmeny.php?versenyeredmeny[method]=keres"
    )
    .type("form")
    .send({ "versenyeredmeny[start]": "0" })
    .send({ "versenyeredmeny[versenystatus]": "eredmeny" })
    .send({ "versenyeredmeny[keres]": "1" })
    .send({ "versenyeredmeny[verseny]": params.verseny })
    .send({ "versenyeredmeny[rajtszam]": params.rajtszam })
    .send({ "versenyeredmeny[oldal]": "10" });

  const start = ret.text.lastIndexOf("<td>") + 4;
  const end = ret.text.lastIndexOf("</td>");
  const result = ret.text.substr(start, end - start);

  if (result.lastIndexOf(":") > 0 && result.indexOf(":") > 0) {
    return { result: result };
  } else {
    return { result: "" };
  }
};

global.testoracle = async () => {
  return { result: "01:01:01" };
};
/*
exports.bsioracle = functions.https.onRequest(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.verseny || !req.query.rajtszam) {
    res.end(JSON.stringify({ result: "" }));
  }

  const ret = await superagent
    .post(
      "http://www.futanet.hu/versenyeredmeny.php?versenyeredmeny[method]=keres"
    )
    .type("form")
    .send({ "versenyeredmeny[start]": "0" })
    .send({ "versenyeredmeny[versenystatus]": "eredmeny" })
    .send({ "versenyeredmeny[keres]": "1" })
    .send({ "versenyeredmeny[verseny]": req.query.verseny })
    .send({ "versenyeredmeny[rajtszam]": req.query.rajtszam })
    .send({ "versenyeredmeny[oldal]": "10" });

  const start = ret.text.lastIndexOf("<td>") + 4;
  const end = ret.text.lastIndexOf("</td>");
  const result = ret.text.substr(start, end - start);

  if (result.lastIndexOf(":") > 0 && result.indexOf(":") > 0) {
    res.end(JSON.stringify({ result: result }));
  } else {
    res.end(JSON.stringify({ result: "" }));
  }
}); */
