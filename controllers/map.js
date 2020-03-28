const databaseAPI = require('./database_api')

/**
 * Renders the 'map.pug' file
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function getMap(req, res) {
    res.render('map')
}
/**
 * Asks the institution manager for the set of geoJSON buildings for a specific institution.
 * Returns the objects to the client on success, or null if anything goes wrong.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function getBuildings(req, res) {
    // if(!req.params.institution) return null
    // const {institution} = req.params

    // const buildings = institutionManager.getBuildings(institution)
    // return res.json(buildings)
}

module.exports = {
    getMap,
    getBuildings
}