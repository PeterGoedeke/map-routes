const express = require('express')
const router = express.Router()
const controller = require('../controllers/map.js')

router.get('/', controller.getMap)
router.get('/route', controller.routeBetween)
router.get('/:institution', controller.getBuildings)

module.exports = router