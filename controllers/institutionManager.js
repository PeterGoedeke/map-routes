const graphs = require('./graph.js')

// temporary graph code
const map = graphs.create()
const nodeA = graphs.node(Math.random(), Math.random(), {l: 'A'})
const nodeB = graphs.node(Math.random(), Math.random(), {l: 'B'})
const nodeC = graphs.node(Math.random(), Math.random(), {l: 'C'})
const nodeD = graphs.node(Math.random(), Math.random(), {l: 'D'})

map.addVertex(nodeA)
map.addVertex(nodeB)
map.addVertex(nodeC)
map.addVertex(nodeD)
map.connectVertices(nodeA, nodeB)
map.connectVertices(nodeB, nodeD)
map.connectVertices(nodeA, nodeC)
map.connectVertices(nodeD, nodeB)

const institutionManager = (function() {
    const institutions = {}
    return {
        routeBetween(latLng1, latLng2, institutionName) {
            return institutions[institutionName].graph.routeBetween(latLng1, latLng2)
        },
        getBuildings(institutionName) {
            return institutions[institutionName].buildings
        },
        getList() {
            const list = []
            for(const key in institutions) {
                list.push({
                    name: key,
                    description: institutions[key].description
                })
            }
            return list
        },
        editInstitutionDetails(institutionName, description, newName) {

        },
        add(institutionName, description = '', graph, buildings) {
            graph = graph || graphs.create()
            buildings = buildings || {}
            institutions[institutionName] = { graph, buildings, description }
        }
    }
})()
// test institutions
institutionManager.add('test', 'this is a test')
institutionManager.add('test2', 'this is a second test')
institutionManager.add('test3', 'this is a third test')

module.exports = institutionManager