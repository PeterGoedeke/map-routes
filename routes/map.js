const express = require('express')
const router = express.Router()
const controller = require('../controllers/map.js')
const databaseAPI = require('../controllers/database_api')
const graphManager = require('../controllers/graphManager')

router.get('/', controller.getMap)

// temporary routes to allow for the editing of the graph and cache
router.get('/:institutionid/settest', graphManager.updateGraph)
router.get('/:institutionid/clear', databaseAPI.clearCache)

router.get('/:institutionid/:from-:to', graphManager.routeBetween)

router.get('/:institutionid', function(req, res) {
    // temporary placeholder
    databaseAPI.readInstitutionProperties(req, res).then(val => res.json(val)).catch(console.log)
})


module.exports = router