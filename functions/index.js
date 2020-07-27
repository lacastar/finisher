const functions = require("firebase-functions");
const admin = require("firebase-admin");
const keccak256 = require("js-sha3").keccak256;
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const superagent = require("superagent");

admin.initializeApp();

const db = admin.firestore();

/*
const web3 = new Web3("ws://localhost:9545");
const account1 = "0x262453740FF4a35c93cA1eBf64a2b1d4DB2D1d92";
const privateKey1 = Buffer.from(
  "a5a7af175f2c29f351455d8b70b1b9390133c899cb25443ff5117a879702b712",
  "hex"
);

const contractAddress = "0x182c0eE5096F8133b3674186baF45BDa063b814F";
const contractABI = require("../build/contracts/Finisher.json").abi;
//[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const contract = new web3.eth.Contract(contractABI, contractAddress);

exports.claimMedal = functions.https.onCall(async (data, context) => {
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
      data: contract.methods.claimMedal(0, "lalalla", "ooooooo").encodeABI()
    };

    const tx = new Tx(txObject);
    tx.sign(privateKey1);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    return raw;
    // web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    //  console.log("err:", err, "txHash:", txHash);
    // Use this txHash to find the contract on Etherscan!
    // });
  });
});

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
});
