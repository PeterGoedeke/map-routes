const express = require('express')
const router = express.Router()
const controllers = require('../controllers/static-pages')

const databaseAPI = require('../controllers/database_api')
const auth = require('../controllers/authentication')

/* GET home page. */
router.get('/', controllers.institutionList)

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'Express' })
})
router.get('/opensource', function(req, res, next) {
    res.render('openSource', { title: 'Express' })
})
router.route('/register')
    .get(function(req, res, next) {
        res.render('registerInstitution', { title: 'Express' })
    })
    .post(auth.register)

router.route('/admin')
    .get(function(req, res, next) {
        res.render('adminLogin', { title: 'Express' })
    })
    .post(auth.login)
    
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' })
})

module.exports = router