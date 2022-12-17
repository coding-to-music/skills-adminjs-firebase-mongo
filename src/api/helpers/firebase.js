const admin = require("firebase-admin");
const config = require("../../config/config");

// const serviceAccount = require("../../../firebase-credentials.json");

console.log("firebase.js BEGIN ");

// console.log("firebase config ", config);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.firebase.project_id,
    clientEmail: config.firebase.client_email,
    privateKey: config.firebase.private_key.replace(/\\n/g, "\n"),
  }),
  // credential: admin.credential.cert(serviceAccount),
});

// console.log("firebase admin ", admin);

console.log("firebase.js END ");

module.exports = admin;
