const express = require('express')
const router = express.Router()
const controllers = require('../controllers/static-pages')

const databaseAPI = require('../controllers/database_api')
const authCtrl = require('../controllers/authentication')

const jwt = require('express-jwt')
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
})

/* GET home page. */
router.get('/', controllers.institutionList)

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'Express' })
})
// 366
router.route('/opensource')
    .get(auth, function(req, res, next) {
        res.render('openSource', { title: 'Express' })
    })
router.route('/register')
    .get(function(req, res, next) {
        res.render('registerInstitution', { title: 'Express' })
    })
    .post(authCtrl.register)

router.route('/admin')
    .get(function(req, res, next) {
        res.render('adminLogin', { title: 'Express' })
    })
    .post(authCtrl.login)
    
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' })
})
router.get('/login', authCtrl.login)

module.exports = router