const institutionManager = require('./institutionManager.js')

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
    if(!req.params.institution) return null
    const {institution} = req.params

    const buildings = institutionManager.getBuildings(institution)
    return res.json(buildings)
}
/**
 * Asks the institution manager for the fastest route between two coordinates for a specific institution.
 * Returns the LineString geoJSON to the client on success, or null if anything goes wrong.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function routeBetween(req, res) {
    const q = req.query
    if(!q.lat1 || !q.lat2 || !q.lng1 || !q.lng2 || !q.institution) return null

    const {lat1, lat2, lng1, lng2, institution} = req.query

    const path = institutionManager.routeBetween([lat1, lng1], [lat2, lng2], institution)
    return res.json(path)
}

module.exports = {
    getMap,
    getBuildings,
    routeBetween,
}