const express = require('express')
const passport = require('passport')
const router = express.Router()
const controllers = require('../controllers/static-pages')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const databaseAPI = require('../controllers/database_api')
const authCtrl = require('../controllers/authentication')

/* GET home page. */
router.get('/', controllers.institutionList)

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'Express' })
})
// 366
router.route('/opensource')
    .get(passport.authenticate('jwt', { session: false }), function(req, res, next) {
        res.render('openSource', { title: 'Express' })
    })
// router.route('/register')
//     .get(function(req, res, next) {
//         res.render('registerInstitution', { title: 'Express' })
//     })
//     .post(authCtrl.register)
    
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' })
})

router.post('/test', function(req, res) {
    console.log(req.body)
    // console.log(req)
})

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    // authentication will take approximately 13 seconds
    // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
    const hashCost = 10;
  
    try {
      const passwordHash = await bcrypt.hash(password, hashCost);
      const userDocument = new User({ username, passwordHash });
      await userDocument.save();
      
      res.status(200).send({ username });
      
    } catch (error) {
        console.log('fucker', error)
    //   res.status(400).send({
    //     error: 'req body should take the form { username, password }',
    //   });
    }
  });

router.route('/admin')
    .get(function(req, res, next) {
        res.render('adminLogin', { title: 'Express' })
    })
    .post((req, res) => {
        passport.authenticate(
          'local',
          { session: false },
          (error, user) => {
      
            console.log('fuck ', user)
            if (error || !user) {
              return res.status(400).json({ error });
            }
      
            /** This is what ends up in our JWT */
            const payload = {
              username: user.username,
              expires: Date.now() + parseInt(1000000000000000000),
            };
      
            /** assigns payload to req.user */
            req.login(payload, {session: false}, (error) => {
              if (error) {
                res.status(400).send({ error });
              }
      
              /** generate a signed json web token and return it in the response */
              const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);
      
              /** assign our jwt to the cookie */
              res.cookie('jwt', token, { httpsOnly: true, secure: true });
              res.status(200).send({ username: payload.username });
            });
          },
        )(req, res);
      })

module.exports = router