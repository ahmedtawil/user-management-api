/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const admin = require('firebase-admin');


var serviceAccount = require("../../user-management-api-fbb99-firebase-adminsdk-j797m-a21b886ae0.json");
const User = require('../models/User');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
const users = db.collection('users')

const validateEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const validatePassword = password => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()~¥=_+}{":;'?/>.<,`\-\|\[\]]{6,}$/
  return re.test(password)
}

const validateAge = age => {
  return (age >= 18 && age <= 50)
}



module.exports = {
  create: async (req, res) => {

    let { username, email, password, age } = req.allParams();
    username = username.trim()
    email = email.trim()
    password = password.trim()

    //check if all fields filled
    if (!(username && email && password && age)) return res.badRequest({ msg: "please fill all fields!" })


    //check if email is valid
    if (!validateEmail(email)) return res.badRequest({ msg: "please enter valid email!" })


    //check if password is valid (should be more than 6 characters contains numbers and letters)
    if (!validatePassword(password)) return res.badRequest({ msg: "please enter valid password!" })

    //check if age is valid (should be between 18 and 50)
    if (!validateAge(age)) return res.badRequest({ msg: "please enter valid age!" })


    //check if username is unique and doesn't exist on db.
    let user = await users.where('username', '==', username).get()
    if (!user.empty) return res.badRequest({ msg: "this username alredy taken!!" })

    //check if email is unique and doesn't exist on db.
    user = await users.where('email', '==', email).get()
    if (!user.empty) return res.badRequest({ msg: "this email alredy taken!!" })


    try {
      await users.add({ username, email, password, age })
      res.ok({ msg: "user created successfully!" })
    } catch (error) {
      res.serverError(error)

    }

  },


  login: async (req, res) => {
    let { username, password } = req.allParams();
    username = username.trim()
    password = password.trim()



    //check if all fields filled
    if (!(username && password)) return res.badRequest({ msg: "please fill all fields!" })


    //check if username is  exist on db.
    let user = await users.where('username', '==', username).get()
    if (user.empty) return res.notFound()





    //compare password to user
    const useId = user.docs[0].id
     user = user.docs[0].data();
    if (user.password !== password) return res.badRequest({ msg: "password incorrect!" })

    res.send({ token: jwToken.issue({ id: useId })})



  }
};
