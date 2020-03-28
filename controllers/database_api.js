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

function getInstitutionAnd(f, fieldsDesired = '') {
    return function(req, res) {
        if(!req.params.institutionid) {
            return res.status(404).json({message: 'Institution not found; id required.'})
        }
        Institution.findById(req.params.institutionid, fieldsDesired).exec((err, institution) => {
            if(!institution) {
                return res.status(404).json({message: 'Institution not found; invalid id.'})
            }
            else if(err) {
                return res.status(400).json(err)
            }
            req.institution = institution
            f(req, res)
        })
    }
}
function saveInstitution(req, res) {
    req.institution.save((err, inst) => {
        if(err) {
            res.status(404).json(err)
        } else {
            res.status(200).json(inst)
        }
    })
}

const readInstitutionProperties = getInstitutionAnd((req, res) => {
    return res.status(200).json(req.institution)
}, propertiesString)

const readInstitutionListProperties = (req, res) => {
    Institution.find({}, propertiesString).exec((err, institutions) => {
        if(err) {
            return res.status(404).json({message: 'Error retrieving institutions.'})
        }
        return res.status(200).json(req.institutions)
    })
}

const updateInstitutionProperties = getInstitutionAnd((req, res) => {
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
    saveInstitution(req, res)
}, propertiesString)


const readGraph = getInstitutionAnd((req, res) => {
    return res.status(200).json(req.institution)
}, 'graph')

const updateGraph = getInstitutionAnd((req, res) => {
    // validate that the graph is correct; cannot be done in Mongo as the type must be Mixed to support the graph,
    // so no validation is available
    for(const key in req.body) {
        if(!req.body[key].properties || !req.body[key].connections) {
            return res.status(400).json({message: 'Invalid graph.'})
        }
    }
    req.institution.graph = req.body
    saveInstitution(req, res)
}, 'graph')


const readBuildings = getInstitutionAnd((req, res) => {
    return res.status(200).json(req.institution)
}, 'buildings')

const updateBuildings = getInstitutionAnd((req, res) => {

})


const updateInstitutionImage = getInstitutionAnd((req, res) => {

})

function cacheRoute() {

}

module.exports = {
    createInstitution,

    readInstitutionProperties,
    readInstitutionListProperties,
    updateInstitutionProperties,

    readBuildings,
    updateBuildings,

    readGraph,
    updateGraph
}