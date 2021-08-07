const admin = require('firebase-admin');


var serviceAccount = require("../../user-management-api-fbb99-firebase-adminsdk-j797m-a21b886ae0.json");
const User = require('../models/User');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();

module.exports = {
    Users : db.collection('users')
};
