const express = require('express')
const router = express.Router()
const controller = require('../controllers/map.js')

router.get('/', controller.getMap)
router.get('/path', controller.getPath)

module.exports = router
