const graphMapProto = (function () {
    /**
     * Prints a message to the node.js console with a red background. Should be used for errors.
     * @param {String} message The message to print to the console
     */
    function warn(message) {
        console.log('\x1b[41m%s\x1b[0m', message)
    }
    /**
     * If the coordinate pair provided is an array, convert to a string for the purposes of map indexing.
     * @param {any} latLng The coordinate pair
     */
    function toKey(latLng) {
        if(Array.isArray(latLng)) return latLng.join(',')
        return latLng
    }
    /**
     * If the coordinate pair provided is a string, convert to an array for distance calculations.
     * @param {any} latLng The coordinate pair
     */
    function toCoords(latLng) {
        if(Array.isArray(latLng)) return latLng
        return latLng.split(',')
    }
    /**
     * Finds the d^2 distance between two coordinate pairs.
     * @param {any} latLng1 First coordinate pair
     * @param {any} latLng2 Second coordinate pair
     */
    function distanceBetween(latLng1, latLng2) {
        latLng1 = toCoords(latLng1)
        latLng2 = toCoords(latLng2)

        return Math.pow(latLng1[0] - latLng2[0], 2) + Math.pow(latLng1[1] - latLng2[1], 2)
    }
    /**
     * Finds the nearest node within the list to the coordinate pair provided. Assumes that the coordinate pair
     * is not contained within the map; if there is a chance that it could be within the map, then test this before calling this method.
     * @param {any} latLng The coordinate pair
     * @param {Object} list The map to search
     */
    function getNearestNodeFromList(latLng, list) {
        latLng = toCoords(latLng)
        let smallestSoFar = {
            distance: Infinity,
            coordinates: null
        }
        for(const key in list) {
            const coordinates = toCoords(key)
            const distance = distanceBetween(latLng, coordinates)

            if(distance < smallestSoFar.distance) {
                smallestSoFar = {
                    distance,
                    coordinates: key
                }
            }
        }
        return smallestSoFar.coordinates
    }

    const graphMapProto = {
        /**
         * Add a node to the map at the specified coordinate pair with the specified properties.
         * @param {any} latLng The coordinate pair
         * @param {Object} properties The properties of the new node
         */
        addVertex(latLng, properties) {
            latLng = toKey(latLng)
            if(this.nodes[latLng]) warn(`Node at ${latLng} overwritten.`)
            this.nodes[latLng] = {
                properties,
                connections: {}
            }
        },
        /**
         * Replace the properties of an existing node at a specific location with the parameter properties. If the node does
         * not exist, then warn and do nothing.
         * @param {any} latLng The coordinate pair
         * @param {Object} properties The properties to set
         */
        updateVertexProperties(latLng, properties) {
            latLng = toKey(latLng)
            if(!this.nodes[latLng]) {
                warn(`Node at ${latLng} does not exist; properties could not be changed.`)
                return
            }
            this.nodes[latLng].properties = properties
        },
        /**
         * Remove the node at the specific location and any connections it has with neighbours from the map. If the node does
         * not exist, then warn and do nothing.
         * @param {any} latLng The coordinate pair
         */
        deleteVertex(latLng) {
            latLng = toKey(latLng)
            if(!this.nodes[latLng]) {
                warn(`Node at ${latLng} does not exist; could not be deleted`)
                return
            }
            for(const key in this.nodes[latLng].connections) {
                delete this.nodes[key].connections[latLng]
            }
            delete this.nodes[latLng]
        },
        /**
         * Add a connection between the two nodes represented by the given coordinate pairs. If either of the nodes does not exist,
         * then warn and do nothing.
         * @param {any} latLng1 The first coordinate pair
         * @param {any} latLng2 The second coordinate pair
         */
        addEdge(latLng1, latLng2) {
            latLng1 = toKey(latLng1)
            latLng2 = toKey(latLng2)

            if(!this.nodes[latLng1] || !this.nodes[latLng2]) {
                warn(`Node at ${latLng1} or ${latLng2} does not exist; edge could not be added.`)
                return
            }

            const distance = distanceBetween(latLng1, latLng2)
            this.nodes[latLng1].connections[latLng2] = distance
            this.nodes[latLng2].connections[latLng1] = distance
        },
        /**
         * Get the nearest node to the given coordinate pair. If an exact match node is contained withn the map then it is
         * returned in O(1) time, otherwise the map is searched in O(n) time for the nearest node.
         * @param {any} latLng The coordinate pair
         */
        getNearestNode(latLng) {
            latLng = toKey(latLng)
            if(this.nodes[latLng]) {
                return latLng
            }
            return getNearestNodeFromList(latLng, this.nodes)
        },
        /**
         * Returns an array of latLng keys representing the fastest path between the two coordinate pairs provided.
         * Uses the A* algorithm to calculate the fastest path.
         * If the starting and ending coordinates do not exist in the graphMap, then find the nearest existing node to use instead.
         * If the starting and edning coordinates represent the same node then warn and do nothing.
         * If only one coordinate pair is given then warn and do nothing.
         * If no connection exist between the two coordinate pairs then warn; if this happens it is the fault of the user's graphMap design.
         * @param {any} startCoords The starting coordinate pair
         * @param {any} endCoords The ending coordinate pair
         * @returns {String[]} The fastest path between the starting and ending pairs
         */
        fastestRouteBetween(startCoords, endCoords) {
            if(!startCoords || !endCoords) {
                warn(`Pathfinding could not be undertaken as ${startCoords} or ${endCoords} does not exist.`)
                return
            }
            // if the coordinates given are not node coordinates, then find the nearest nodes to the coordinates to use instead
            startCoords = toKey(startCoords)
            endCoords = toKey(endCoords)
            if(!this.nodes[startCoords]) startCoords = this.getNearestNode(startCoords)
            if(!this.nodes[endCoords]) startCoords = this.getNearestNode(endCoords)

            if(startCoords == endCoords) {
                warn(`Pathfinding could not be undertaken as the start and end location are the same: ${startCoords}.`)
                return
            }
            // open and closed lists (implemented as "maps") for the A* algorithm
            let openLength = 0 // more efficient to keep tabs than run Object.keys
            const open = {
                [startCoords]: createPath(0, distanceBetween(startCoords, endCoords))
            }
            const closed = {}
            
            while(openLength > 0) {
                // remove the lowest f cost node from open and add it to closed
                const current = retrieveLowestFCostNode(open)
                closed[current.coords] = current.path
                // if the current node is the end node, the algorithm has finished
                if(current.coords === endCoords) {
                    return current.path.parent.concat(endCoords)
                }
                // for each neighbour of the current node
                for(const neighbourCoords in this.nodes[current.coords].connections) {
                    if(closed[neighbourCoords]) continue // skip the neighbour if it is in the closed list
                    // if the new path to the neighbour is shorter or the neighbour is not in open...
                    const gCostToNeighbour = current.path.gCost + distanceBetween(current.coords, neighbourCoords)
                    if(!open[neighbourCoords] || gCostToNeighbour < open[neighbourCoords].path.gCost) {
                        // make sure the neighbour is in the open list
                        const neighbourPath = open[neighbourCoords] ||
                            createPath(gCostToNeighbour, distanceBetween(neighbourCoords, endCoords))
                        // ...then set the f_cost of the neighbour and the parent of the neighbour to the current node
                        neighbourPath.parent = current.path.parent && current.path.parent.concat(current.coords) || [current.coords]
                        open[neighbourCoords] = neighbourPath
                    }
                }
            }
            // if there is no possible connection between nodes, return null. If this happens then the flaw is with the user's design
            // of the graphMap, not the algorithm
            warn(`No connection exists between ${startCoords} and ${endCoords}.`)
            return null

            // helper function used to extract (e.g. remove from the list and return) the lowest F cost node
            function retrieveLowestFCostNode(map) {
                let lowestSoFar = null
                for(const coords in map) {
                    const newFCostLower = lowestSoFar && map[coords].fCost < lowestSoFar.path.fCost
                    const hCostBreaksTie = lowestSoFar && map[coords].fCost == lowestSoFar.path.fCost && map[coords].hCost < lowestSoFar.path.hCost

                    if(!lowestSoFar || newFCostLower || hCostBreaksTie) lowestSoFar = {
                        coords: coords,
                        path: map[coords]
                    }
                }
                delete map[lowestSoFar.coords]
                openLength --
                return lowestSoFar
            }
            // helper function to create the path data object used to store the costs of the route
            function createPath(gCost, hCost) {
                openLength++
                return {
                    gCost, hCost,
                    get fCost() { return this.gCost + this.hCost }
                }
            }
        }
    }
    return graphMapProto
})()

/**
 * Create a new graphMap. Used to represent the map of an institution's pathfinding and destination nodes
 * @returns {Object} The new graphMap
 */
function createGraphMap() {
    const graphMap = Object.create(graphMapProto)
    graphMap.nodes = {}
    return graphMap
}

const test = createGraphMap()
test.addVertex([10, 0], {letter: 'A'})
test.addVertex([10, 20], {letter: 'B'})
test.addVertex([0, 0], {letter: 'C'})
test.addVertex([0, 20], {letter: 'D'})
test.addVertex([5, 10], {letter: 'E'})
// test.addVertex([1, 5], {letter: 'E'})
test.addEdge([10, 0], [10, 20])
test.addEdge([10, 20], [0, 20])
test.addEdge([0, 20], [0, 0])
test.addEdge([10, 0], [0, 0])
test.addEdge([10, 0], [5, 10])
test.addEdge([0, 20], [5, 10])
// test.updateVertexProperties([1, 1], {letter: 'J'})
// test.deleteVertex([1, 4])
console.log(JSON.stringify(test, null, 4))

console.log(test.fastestRouteBetween([0, 0], [5, 10]))

module.exports = createGraphMap()