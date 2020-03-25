const graphs = require('./graphMap.js')

const institutionManager = (function() {
    const graphMaps = {}
    return {
        routeBetween(institutionName, latLng1, latLng2) {
            return graphMaps[institutionName].routeBetween(latLng1, latLng2)
        },
        // getBuildings(institutionName) {
        //     return graphMaps[institutionName].buildings
        // },
        // getList() {
        //     const list = []
        //     for(const key in graphMaps) {
        //         list.push({
        //             name: key,
        //             description: graphMaps[key].description
        //         })
        //     }
        //     return list
        // },
        // editInstitutionDetails(institutionName, description, newName) {

        // },
        // add(institutionName, description = '', graph, buildings) {
        //     graph = graph || graphs.create()
        //     buildings = buildings || {}
        //     graphMaps[institutionName] = { graph, buildings, description }
        // }
    }
})()
// test institutions
// institutionManager.add('test', 'this is a test')
// institutionManager.add('test2', 'this is a second test')
// institutionManager.add('test3', 'this is a third test')

module.exports = institutionManager