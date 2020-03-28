const graphs = require('./graphMap.js')
const databaseAPI = require('./database_api')
const warn = require('../warn')

// temporary graph
const testGraph = graphs.create()
testGraph.addVertex([10, 0], {letter: 'A'})
testGraph.addVertex([10, 20], {letter: 'B'})
testGraph.addVertex([0, 0], {letter: 'C'})
testGraph.addVertex([0, 20], {letter: 'D'})
testGraph.addVertex([5, 10], {letter: 'E'})
testGraph.addEdge([10, 0], [10, 20])
testGraph.addEdge([10, 20], [0, 20])
testGraph.addEdge([0, 20], [0, 0])
testGraph.addEdge([10, 0], [0, 0])
testGraph.addEdge([10, 0], [5, 10])
testGraph.addEdge([0, 20], [5, 10])

// the graph manager stores current copies of the institution graphs and allows for interfacing with them. see below as to why
const graphManager = (function() {
    const graphMaps = {}

    // initialise the graphManagers graphs when the application starts. These are kept in memory so that they can be used
    // to calculate routes - it would be unnecessarily heavy to request a graph from the database and create a graphMap object
    // from it every time a route request is made by a client
    databaseAPI.readInstitutionListGraphs().then(graphData => {
        graphData.forEach(data => graphMaps[data._id] = graphs.create(data.graph))
    }).catch(warn)

    return {
        /**
         * Responds to a client request for the fastest route between two coordinates for a specific institution. Checks
         * the cache to reduce workload if the route exists and caches the route it calculates if it does not exist in the cache.
         * Returns the LineString geoJSON to the client on success, or null if anything goes wrong.
         * @param {Object} req The request object
         * @param {Object} res The response object
         */
        routeBetween: function(req, res) {
            // validate the user request
            if(!req.params.institutionid) {
                return res.status(400).json('Route could not be found; no institution id provided.')
            }
            if(!req.params.from || !req.params.to) {
                return res.status(400).json('Route could not be found; start and / or end destination not provided.')
            }
            if(!graphMaps[req.params.institutionid]) {
                return res.status(404).json('Route could not be found; incorrect institution id provided.')
            }

            // find the nearest coordinates to the user request which actually represent a point on the graph
            req.start = graphMaps[req.params.institutionid].getNearestNode(req.params.from)
            req.end = endNode = graphMaps[req.params.institutionid].getNearestNode(req.params.to)

            // check the cache...
            databaseAPI.hasCachedRoute(req, res).then(route => {
                if(route) {
                    return res.status(200).json(route)
                }
                else {
                    // ... if failed, calculate the route, cache, and return to client
                    route = graphMaps[req.params.institutionid].fastestRouteBetween(req.start, req.end)

                    // check that the route was calculated and return the appropriate errors if not
                    if(route.failed) {
                        if(route.failed == 'noConnectionIssue') return res.status(500)
                            .json('There is a problem with the institution map. Please contact your institution to resolve this issue.')
                        
                        else if(route.failed == 'duplicationIssue') return res.status(400)
                            .json('The start and the end destination entered are the same.')

                        else if(route.failed == 'coordsIssue') return res.status(400)
                            .json('Either the start of the end destination are not entered correctly.')
                    }
                    // cache and return the route to the client
                    req.fastestRoute = route
                    databaseAPI.cacheRoute(req, res).then(console.log).catch(console.log)
                    return res.status(200).json(route)
                }
            }).catch(err => {
                return res.status(500).json({message: err})
            })
        },
        // unfinished method sets the graph of the institution to the temporary testing graph
        updateGraph: function(req, res) {
            req.body = testGraph.nodes
            databaseAPI.updateGraph(req, res).then(val => console.log(val, 5)).catch(val => console.log(val))
        }
    }
})()

module.exports = graphManager