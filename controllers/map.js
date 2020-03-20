const graph = require('./graph.js')

const map = graph.create()
const nodeA = graph.node(Math.random(), Math.random(), {l: 'A'})
const nodeB = graph.node(Math.random(), Math.random(), {l: 'B'})
const nodeC = graph.node(Math.random(), Math.random(), {l: 'C'})
const nodeD = graph.node(Math.random(), Math.random(), {l: 'D'})

map.addVertex(nodeA)
map.addVertex(nodeB)
map.addVertex(nodeC)
map.addVertex(nodeD)
map.connectVertices(nodeA, nodeB)
map.connectVertices(nodeB, nodeD)
map.connectVertices(nodeA, nodeC)
map.connectVertices(nodeD, nodeB)

function getPath(req, res) {
    const path = map.routeBetween(nodeA, nodeD)
    return res.json(path)
}

function getMap(req, res) {
    res.render('map')
}

module.exports = {
    getPath,
    getMap
}