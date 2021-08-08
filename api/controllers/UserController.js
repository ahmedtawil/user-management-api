/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const DB = require("../services/DB");

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
  register: async (req, res) => {

    let { username, email, password, age } = req.allParams();
    username = typeof username == 'undefined' ? null : username.trim()
    email = typeof email == 'undefined' ? null : email.trim()
    password = typeof password == 'undefined' ? null : password.trim()
    age = typeof age == 'number' ? age : null


    //check if all fields filled
    if (!(username && email && password && age)) return res.badRequest({ msg: "please fill all fields!" })


    //check if email is valid
    if (!validateEmail(email)) return res.badRequest({ msg: "please enter valid email!" })


    //check if password is valid (should be more than 6 characters contains numbers and letters)
    if (!validatePassword(password)) return res.badRequest({ msg: "please enter valid password!" })

    //check if age is valid (should be between 18 and 50)
    if (!validateAge(age)) return res.badRequest({ msg: "please enter valid age!" })


    //check if username is unique and doesn't exist on db.
    let user
    try {
      user = await DB.Users.where('username', '==', username).get()
    } catch (error) {
      return res.serverError(error)
    }
    if (!user.empty) return res.badRequest({ msg: "this username alredy taken!!" })

    //check if email is unique and doesn't exist on db.
    
    try {
      user = await DB.Users.where('email', '==', email).get()
    } catch (error) {
      return res.serverError(error)
    }
    if (!user.empty) return res.badRequest({ msg: "this email alredy taken!!" })

    //hash password to save in db
    try {
      password = await bcrypt.hash(password)
    } catch (error) {
      return res.serverError(error)
    }


    try {
      await DB.Users.add({ username, email, password, age, role: "user" })
      res.ok({ msg: "user created successfully!" })
    } catch (error) {
      res.serverError(error)

    }

  },


  userLogin: async (req, res) => {
    let { username, password } = req.allParams();
    username = typeof username == 'undefined' ? null : username.trim()
    password = typeof password == 'undefined' ? null : password.trim()

    

    //check if all fields filled
    if (!(username && password)) return res.badRequest({ msg: "please fill all fields!" })

    //check if username is  exist on db.
    let user
    try {
      user = await DB.Users.where('username', '==', username).get()
    } catch (error) {
      return res.serverError(error)
    }
    if (user.empty) return res.notFound()

    //compare password that user enter to existing password on 
    const useId = user.docs[0].id
    user = user.docs[0].data();

    try {
      const isCorrect = await bcrypt.compare(password , user.password)
      if (!isCorrect) return res.badRequest({ msg: "password incorrect!" })
    } catch (error) {
      return res.serverError(error)
    }

    res.send({ token: jwToken.issue({ id: useId, role: user.role }) })
  },

  getUserProfile: async (req, res) => {
    let user
    try {
      user = (await DB.Users.doc(req.user.id).get()).data()
      if (user.empty) return res.notFound()
      delete user.password
      res.ok(user)
  
    } catch (error) {
      return res.serverError()
    }

  },

  updateUserProfile: async (req, res) => {

    let { username, email, age } = req.allParams();
    username = typeof username == 'undefined' ? null : username.trim()
    email = typeof email == 'undefined' ? null : email.trim()
    age = typeof age == 'number' ? age : null

    //check if all fields filled
    if (!(username && email && age)) return res.badRequest({ msg: "please fill all fields!" })

    //check if email is valid
    if (!validateEmail(email)) return res.badRequest({ msg: "please enter valid email!" })

    //check if age is valid (should be between 18 and 50)
    if (!validateAge(age)) return res.badRequest({ msg: "please enter valid age!" })

    //check if username is unique and doesn't exist on db.
    let user
    try {
      user = await DB.Users.where('username', '==', username).get()
    } catch (error) {
      return res.serverError(error)
    }
    if (!user.empty && (user.docs[0].id !== req.user.id)) return res.badRequest({ msg: "this username alredy taken!!" })
    
    try {
      user = await DB.Users.doc(req.user.id).update({ username, email, age })
      res.ok({ username, email, age })
    } catch (error) {
      res.badRequest({ msg: "fail updating user profile!" })
    }
  },

  adminLogin: async (req, res) => {
    let { username, password } = req.allParams();
    username = typeof username == 'undefined' ? null : username.trim()
    password = typeof password == 'undefined' ? null : password.trim()

    //check if all fields filled
    if (!(username && password)) return res.badRequest({ msg: "please fill all fields!" })

    //check if username is  exist on db.
    let user 
    try {
      user = await DB.Users.where('username', '==', username).get()
    } catch (error) {
      return res.serverError(error)
    }
    if (user.empty || user.docs[0].data().role === 'user') return res.notFound()

    //compare password to user
    const useId = user.docs[0].id
    user = user.docs[0].data();
    try {
      const isCorrect = await bcrypt.compare(password , user.password)
      if (!isCorrect) return res.badRequest({ msg: "password incorrect!" })
    } catch (error) {
      return res.serverError(error)
    }

    res.send({ token: jwToken.issue({ id: useId, role: user.role }) })
  },

  getUsers: async (req, res) => {
    const query = req.query.limit
    const limit = (typeof query === 'undefined') ? 1 : (Number.isNaN(parseInt(query))) ? 1 : (query <= 0) ? 1 : parseInt(query)
    
    let snapshot
    try {
      snapshot = await DB.Users.where('role', '!=', 'admin').limit(limit).get()
    } catch (error) {
      return res.serverError(error)
    }

    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data()
      users.push({
        id:doc.id,
        username : userData.username,
        email:userData.email,
        age:userData.age
      })
    })

    res.ok(users)
  }

};

