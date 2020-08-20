import firebase from "firebase";
import "firebase/firestore";
import "firebase/functions";

const config = {
  apiKey: "AIzaSyCEX8clkrgj1jqz1tFL9NDBESFGtVo3mhU",
  authDomain: "finisher-e976e.firebaseapp.com",
  databaseURL: "https://finisher-e976e.firebaseio.com",
  projectId: "finisher-e976e",
  storageBucket: "finisher-e976e.appspot.com",
  messagingSenderId: "759447498485",
  appId: "1:759447498485:web:68059881d022f18ff91fbc",
  measurementId: "G-YR5BMZT4C7"
};

firebase.initializeApp(config);

// firebase utils
const db = firebase.firestore();
const functions = firebase.functions();
const auth = firebase.auth();

if (location.hostname === "localhost") {
  db.settings({
    host: "localhost:8888",
    ssl: false
  });
  firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

const { currentUser } = auth;

const createMedal = functions.httpsCallable("createMedal");
const shareResults = functions.httpsCallable("shareResults");
const checkMedal = functions.httpsCallable("checkMedal");
const claimMedal = functions.httpsCallable("claimMedal");

//function serverTimestamp() {
//  return firebase.firestore.FieldValue.serverTimestamp();
//}

function removeField() {
  return firebase.firestore.FieldValue.delete();
}

function getMedals(user, process) {
  db.collection("medals")
    .where("user", "==", user)
    .get()
    .then(snapshot => {
      process(snapshot);
    })
    .catch(error => {
      console.log("Error getting managed medals: ", error);
    });
}

function updateMedal(id, attributes, process) {
  db.collection("medals")
    .doc(id)
    .update(attributes)
    .then(() => process())
    .catch(error => {
      console.log("Error updating medal: ", error);
    });
}

function updateResult(id, attributes, process) {
  db.collection("medals-registered-to-wallets")
    .doc(id)
    .update(attributes)
    .then(() => process())
    .catch(error => {
      console.log("Error updating result: ", error);
    });
}

function registerCompetitor(medalid, wallet, attributes, process) {
  // Get a new write batch
  var batch = db.batch();

  // update registered counter
  var medalref = db.collection("medals").doc(medalid);
  batch.update(medalref, {
    registered_count: firebase.firestore.FieldValue.increment(1)
  });

  // add to medals->wallet map: medals-registered-to-wallets
  /*var medalMapRef = db.collection("wallets-registered-to-medals").doc(medalid);
  batch.set(
    medalMapRef,
    {
      [wallet]: {
        status: "new"
        //        attributes: attributes
      }
    },
    { merge: true }
  );*/

  // Delete the city 'LA'
  var walletMapRef = db.collection("medals-registered-to-wallets").doc(wallet);
  batch.set(
    walletMapRef,
    {
      [medalid]: {
        // status: "new",
        attributes: attributes
      }
    },
    { merge: true }
  );

  // Commit the batch
  batch
    .commit()
    .then(function(ret) {
      process(ret);
    })
    .catch(error => {
      console.log("Error registering competitor: ", error);
    });

  /*  db.collection("medals")
    .doc(medalid)
    .update({
      registered_count: firebase.firestore.FieldValue.increment(1),
      ["registered." + wallet]: {
        attributes: attributes,
        status: "new"
      }
    })
    .then(docref => process(docref))
    .catch(error => {
      console.log("Error registering competitor: ", error);
    });
    */
}

function getRegisteredMedals(wallet, process) {
  db.collection("medals-registered-to-wallets")
    .doc(wallet)
    .get()
    .then(doc => {
      if (doc.exists) {
        process(doc);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch(error => {
      console.log("Error getting registered medals: ", error);
    });
}

function getMedal(medalid, process) {
  db.collection("medals")
    .doc(medalid)
    .get()
    .then(doc => {
      if (doc.exists) process(doc);
    });
}

function getDomainuser(userid, process) {
  db.collection("users")
    .doc(userid)
    .get()
    .then(doc => {
      if (doc.exists) process(doc);
    });
}

function setDomainuser(userid, userdata, process) {
  db.collection("users")
    .doc(userid)
    .set(userdata, { merge: true })
    .then(() => process())
    .catch(error => {
      console.log("Error updating result: ", error);
    });
}

export {
  db,
  auth,
  functions,
  currentUser,
  removeField,
  //  serverTimestamp,
  createMedal,
  shareResults,
  getMedals,
  getMedal,
  claimMedal,
  updateMedal,
  updateResult,
  registerCompetitor,
  checkMedal,
  getRegisteredMedals,
  getDomainuser,
  setDomainuser
};
