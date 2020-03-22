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
test.addVertex([1, 1], {letter: 'A'})
test.addVertex('1,2', {letter: 'B'})
test.addVertex([1, 3], {letter: 'C'})
test.addVertex([1, 4], {letter: 'D'})
test.addVertex([1, 5], {letter: 'E'})
test.addEdge([1, 1], [1, 4])
test.updateVertexProperties([1, 1], {letter: 'J'})
// test.deleteVertex([1, 4])
console.log(JSON.stringify(test, null, 4))

console.log(test.getNearestNode([1, 5]))

module.exports = createGraphMap()