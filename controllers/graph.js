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
    },
    getGCost(start) {
        return this.distanceFrom(start)
    },
    getHCost(end) {
        return this.distanceFrom(end)
    },
    getFCost() {
        return this.getGCost() + this.getHCost()
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
    },
    /**
     * Extremely inefficient implementation of the A* algorithm. Redesign will be needed; this implementation is suitable only for 
     * development. The main drawback currently is that arrays are being used due to the JavaScript Map's inability to convert to JSON.
     * A workaround to this will need to be found at a later stage.
     * @param {Node} startCoords The node to start at
     * @param {Node} endCoords The node to end at
     */
    routeBetween(startCoords, endCoords) {
        const startNode = this.findNearest(startCoords)
        const endNode = this.findNearest(endCoords)

        if(!startNode || !endNode) return false

        const gCost = startNode.getGCost(startNode)
        const hCost = startNode.getHCost(endNode) 
        // this data structure can be impoved by using a heap
        const open = [{
            node: startNode,
            gCost,
            hCost,
            fCost: gCost + hCost
        }]
        // this should be a map
        const closed = []
        while(open.length > 0) {
            let current = open[0]
            for(let i = open.length - 1; i >= 0; i--) {
                if(open[i].fCost < current.fCost) {
                    current = open[i]
                    closed.push(open.splice(i, 1))
                }
            }
            if(current.node === endNode) {
                return current
            }
            
            neighbours:
            for(const connection of current.node.connections) {
                const neighbour = connection.node
                // if closed was a map then this would be more efficient
                for(const elem of closed) {
                    if(elem === neighbour) continue neighbours
                }
                // if open was a map then this would be more efficient
                for(const elem of open) {
                    if(elem.node === neighbour) {
                        const gCost = neighbour.distanceFrom(current.node) + current.gCost
                        const hCost = neighbour.getHCost(endNode)
                        if(elem.fCost < gCost + hCost) {
                            elem.fCost = gCost + hCost
                            elem.parent = current
                        }
                        continue neighbours
                    }
                }
                const gCost = neighbour.distanceFrom(current.node) + current.gCost
                const hCost = neighbour.getHCost(endNode)
                open.push({
                    node: neighbour,
                    parent: current,
                    gCost,
                    hCost,
                    fCost: gCost + hCost
                })
            }
        }
        return null
    }

}
function createGraph() {
    const graph = Object.create(graphProto)
    graph.nodeList = []
    return graph
}

// example usage
const graph = createGraph()
const nodeA = createNode(Math.random(), Math.random(), {l: 'A'})
const nodeB = createNode(Math.random(), Math.random(), {l: 'B'})
const nodeC = createNode(Math.random(), Math.random(), {l: 'C'})
const nodeD = createNode(Math.random(), Math.random(), {l: 'D'})

graph.addVertex(nodeA)
graph.addVertex(nodeB)
graph.addVertex(nodeC)
graph.addVertex(nodeD)
graph.connectVertices(nodeA, nodeB)
graph.connectVertices(nodeB, nodeD)
graph.connectVertices(nodeA, nodeC)
graph.connectVertices(nodeD, nodeB)
// graph.removeVerex(nodeA)

// graph.findNearest(nodeA)

const current = graph.routeBetween(nodeA, nodeD)
console.log(current)
console.log('---------')
console.log(current.parent)
console.log('---------')
console.log(current.parent.parent)

// console.log(graph)