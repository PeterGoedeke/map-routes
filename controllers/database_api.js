const mongoose = require('mongoose')
const Institution = mongoose.model('Institution')
const propertiesString = 'name description type location'

function createInstitution(req, res) {
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
        if(err) res.status(400).json(err)
        else res.status(201).json(institution)
    })
}

function readAllInstitutions(fieldsDesired = '', errorMessage) {
    return function() {
        return new Promise((resolve, reject) => {
            Institution.find({}, fieldsDesired).exec((err, institutions) => {
                if(err) {
                    return reject(errorMessage)
                }
                return resolve(institutions)
            })
        })
    }
}
const readInstitutionListProperties = readAllInstitutions(propertiesString, 'Error retrieving institutions.')
const readInstitutionListGraphs = readAllInstitutions('graph', 'Error retrieving graphs.')

function deleteInstitution(req, res) {
    if(!req.params.institutionid) {
        return res.status(404).json('Institution not found; id required.')
    }
    Institution.deleteOne({id: req.params.institutionid}, err => {
        if(err) return res.status(400).json(err)
    })
    res.end()
}

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

const readInstitutionProperties = readInstitutionAnd((req, res) => {
    return req.institution
}, propertiesString)

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


const readGraph = readInstitutionAnd((req, res) => {
    return req.institution
}, 'graph')

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


const readBuildings = readInstitutionAnd((req, res) => {
    return req.institution
}, 'buildings')

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


const hasCachedRoute = readInstitutionAnd((req, res) => {
    return req.institution.cache[req.start + '-' + req.end]
}, 'cache')
const cacheRoute = readInstitutionAnd((req, res) => {
    return new Promise(resolve => {
        req.institution.cache[req.start + '-' + req.end] = req.fastestRoute
        req.institution.markModified('cache')
        return resolve(saveInstitution(req, res))
    })
}, 'cache')
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