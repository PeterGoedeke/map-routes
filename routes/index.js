const express = require('express')
const router = express.Router()
const controllers = require('../controllers/static-pages')

/* GET home page. */
router.get('/', controllers.institutionList)

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'Express' })
})
router.get('/opensource', function(req, res, next) {
    res.render('openSource', { title: 'Express' })
})
router.get('/register', function(req, res, next) {
    res.render('registerInstitution', { title: 'Express' })
})
router.get('/admin', function(req, res, next) {
    res.render('adminLogin', { title: 'Express' })
})
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' })
})

module.exports = router
