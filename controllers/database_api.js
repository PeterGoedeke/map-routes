const mongoose = require('mongoose')
const Institution = mongoose.model('Institution')
const propertiesString = 'name description type location'

/**
 * Create an institution on the database with the specified properties and return a promise tracking whether the operation was successful
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function createInstitution(req, res) {
    return new Promise((resolve, reject) => {
        Institution.create({
            name: req.body.name || 'temp',
            description: req.body.description,
            type: req.body.type,
            location: {
                type: 'Point',
                coordinates: [
                    req.body.lng && parseFloat(req.body.lng) || 0,
                    req.body.lat && parseFloat(req.body.lat) || 0
                ]
            }
        }, (err, institution) => {
            if(err) return reject(err)
            else return resolve(institution)
        })
    })
}

/**
 * Curried function allows for the specification of which Mongoose fields are desired in the query. Each call to this function
 * returns a function which can be used as a controller to make a query to the database on all institutions for the specified properties.
 * @param {String} fieldsDesired The Mongoose fields to include when the institutions are returned
 * @param {String} errorMessage The error message to display if an error occurs
 */
function readAllInstitutions(fieldsDesired = '', errorMessage) {
    return function() {
        return new Promise((resolve, reject) => {
            Institution.find({}, fieldsDesired).exec((err, institutions) => {
                if(err) {
                    return reject(errorMessage) // maybe just reject the error message
                }
                return resolve(institutions)
            })
        })
    }
}

/**
 * Read all institutions on the database and return their basic properties.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const readInstitutionListProperties = readAllInstitutions(propertiesString, 'Error retrieving institutions.')
/**
 * Read all institutions on the database and return their graphs
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const readInstitutionListGraphs = readAllInstitutions('graph', 'Error retrieving graphs.')

/**
 * Delete the institution specified by the institution id req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function deleteInstitution(req, res) {
    return new Promise((resolve, reject) => {
        if(!req.params.institutionid) {
            return reject('Institution not found; id required.')
        }
        Institution.deleteOne({id: req.params.institutionid}, err => {
            if(err) return reject(err)
            else resolve(true)
        })
    })
}

/**
 * Curried function returns a function which returns a promise which finds one institution from the database by id and then
 * either resolves the promise with the return value of parameter f, or rejects the promise if an error occurs. This function is used
 * to abstract the error handling associated with making requests to the database; the actual functionality should occur in f.
 * @param {Function} f The function to be resolved with
 * @param {String} fieldsDesired The Mongoose fields to include when the institution is returned
 */
function readInstitutionAnd(f, fieldsDesired = '') {
    return function(req, res) {
        return new Promise((resolve, reject) => {
            if(!req.params.institutionid) {
                return reject('Institution not found; id required.')
            }
            Institution.findById(req.params.institutionid, fieldsDesired).exec((err, institution) => {
                if(err) {
                    // this probably means that the id was invalid; e.g. wrong length to be an id
                    return reject(err)
                }
                else if(!institution) {
                    return reject('Institution not found; invalid id.')
                }
                req.institution = institution
                return resolve(f(req, res))
            })
        })
    }
}
/**
 * Save the institution attached to the request object to the database.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
function saveInstitution(req, res) {
    return new Promise((resolve, reject) => {
        req.institution.save((err, inst) => {
            if(err) {
                return reject(err)
            } else {
                return resolve(inst)
            }
        })
    })
}
/**
 * Read the properties of the institution specified by req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const readInstitutionProperties = readInstitutionAnd((req, res) => {
    return req.institution
}, propertiesString)

/**
 * Update the properties of the institution specified by req.params.institutionid. Returns a promise which resolves if the
 * saving completes and rejects if the saving fails.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const updateInstitutionProperties = readInstitutionAnd((req, res) => {
    return new Promise(resolve => {
        req.institution.name = req.body.name
        req.institution.description = req.body.description
        req.institution.type = req.body.type
        req.institution.location =  {
            type: 'Point',
            coordinates: [
                parseFloat(req.body.lng),
                parseFloat(req.body.lat)
            ]
        }
        return resolve(saveInstitution(req, res))
    })
}, propertiesString)

/**
 * Read the graph of the institution specified by req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const readGraph = readInstitutionAnd((req, res) => {
    return req.institution
}, 'graph')

/**
 * Update the properties of the institution specified by req.params.institutionid. Returns a promise which is rejected
 * if the new graph properties are invalid or the saving fails and resolved if the saving successfully completes.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const updateGraph = readInstitutionAnd((req, res) => {
    // validate that the graph is correct; cannot be done in Mongo as the type must be Mixed to support the graph,
    // so no validation is available
    return new Promise((resolve, reject) => {
        for(const key in req.body) {
            if(!req.body[key].properties || !req.body[key].connections) {
                return reject('Invalid graph.')
            }
        }
        req.institution.graph = req.body
        return resolve(saveInstitution(req, res))
    })
}, 'graph')

/**
 * Read the buildings of the institution specified by req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const readBuildings = readInstitutionAnd((req, res) => {
    return req.institution
}, 'buildings')

/**
 * Update the properties of the institution specified by req.params.institutionid. Unfinished.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const updateBuildings = readInstitutionAnd((req, res) => {
    // validate that the buildings are correct; cannot be done in Mongo as the type must be Mixed to support the buildings,
    // so no validation is available
    return new Promise((resolve, reject) => {
        for(const key in req.body) {
            // validate that buildings match the required data
        }
        req.institution.buildings = req.body
        return resolve(saveInstitution(req, res))
    })
}, 'buildings')


const updateInstitutionImage = readInstitutionAnd((req, res) => {

})

/**
 * Check if a cached route between req.start and req.end exists for the institution specified by req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const hasCachedRoute = readInstitutionAnd((req, res) => {
    return req.institution.cache[req.start + '-' + req.end]
}, 'cache')
/**
 * Cache the route 'req.fastestRoute' between req.start and req.end for the institution specified by req.params.institutionid.
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const cacheRoute = readInstitutionAnd((req, res) => {
    return new Promise(resolve => {
        req.institution.cache[req.start + '-' + req.end] = req.fastestRoute
        req.institution.markModified('cache')
        return resolve(saveInstitution(req, res))
    })
}, 'cache')
/**
 * Reset the cache for the institution specified by req.params.institutionid
 * @param {Object} req The request object
 * @param {Object} res The response object
 */
const clearCache = readInstitutionAnd((req, res) => {
    return new Promise(resolve => {
        req.institution.cache = {}
        return resolve(saveInstitution(req, res))
    })
})

module.exports = {
    createInstitution,
    deleteInstitution,
    readInstitutionListProperties,
    
    readInstitutionProperties,
    updateInstitutionProperties,
    
    readBuildings,
    updateBuildings,
    
    readGraph,
    updateGraph,
    readInstitutionListGraphs,

    hasCachedRoute,
    cacheRoute,
    clearCache
}