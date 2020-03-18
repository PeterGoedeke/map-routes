const distanceEpsilon = 1.4e-10
function dSquareDistance(x1, x2, y1, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
}

const nodeProto = {
    distanceFrom(node) {
        return dSquareDistance(
            this.geometry.coordinates[0], node.geometry.coordinates[0], this.geometry.coordinates[1], node.geometry.coordinates[1]
            )
    },
    isOnTopOf(node) {
        return this.distanceFrom(node) < distanceEpsilon
    }
}
/**
 * 
 * @param {Number} lat Latitude of the point
 * @param {Number} long Longitude of the point
 * @param {Object} properties Additional properties. To be elaborated on later.
 */
function createNode(lat, long, properties) {
    const node = Object.assign(Object.create(nodeProto), {
        geometry: {
            type: 'Point',
            coordinates: [lat, long]
        },
        connections: [],
        properties
    })
    return node
}

// nodeList list
const graphProto = {
    addVertex(node) {
        this.nodeList.push(node)
    },
    connectVertices(nodeA, nodeB) {
        const distance = nodeA.distanceFrom(nodeB)
        nodeA.connections.push({distance: distance, node: nodeB})
        nodeB.connections.push({distance: distance, node: nodeA})
    },
    /**
     * This function is extremely inefficient for removing the connections in nodes neighbouring the node to be removed
     * @param {Node} node The node to be removed
     */
    removeVertex(node) {
        for(let i = 0; i < this.nodeList.length; i++) {
            if(node.isOnTopOf(this.nodeList[i])) {
                this.nodeList.splice(i, 1)
                // this process here is very inefficient
                node.connections.forEach(connection => {
                    const c = connection.node.connections
                    c.splice(c.indexOf({distance: connection.distance, node}), 1)
                })
                node.connections = []
                return true
            }
        }
        return false
    },
    /**
     * This function is extremely inefficient in the case that the application has a reference to the node object as the graph
     * cannot simply use this reference as the key, but instead must search the graph in linear time for the nearest node
     * @param {Node} node The node to find the nearest node to
     */
    findNearest(node) {
        let currentBestNode = this.nodeList[0]
        let currentBestDistance = node.distanceFrom(this.nodeList[0])

        for(const nodeToCompare of this.nodeList) {
            const distanceToCompare = nodeToCompare.distanceFrom(node)
            if(distanceToCompare < currentBestDistance) {
                currentBestNode = nodeToCompare
                currentBestDistance = distanceToCompare
            }
        }
        return currentBestNode
    }
}
function createGraph() {
    const graph = Object.create(graphProto)
    graph.nodeList = []
    return graph
}

// example usage
const graph = createGraph()
const nodeA = createNode('A')
const nodeB = createNode('B')
const nodeC = createNode('C')
const nodeD = createNode('D')
graph.addVertex(nodeA)
graph.addVertex(nodeB)
graph.addVertex(nodeC)
graph.addVertex(nodeD)
graph.connectVertices(nodeA, nodeB)
graph.connectVertices(nodeB, nodeD)
graph.connectVertices(nodeA, nodeC)
graph.connectVertices(nodeD, nodeB)
graph.removeVerex(nodeA)

graph.findNearest(nodeA)

console.log(graph)