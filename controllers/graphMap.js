const graphMapProto = (function () {
    function warn(message) {
        console.log('\x1b[41m%s\x1b[0m', message)
    }
    function toKey(latLng) {
        if(Array.isArray(latLng)) return latLng.join(',')
        return latLng
    }
    function toCoords(latLng) {
        if(Array.isArray(latLng)) return latLng
        return latLng.split(',')
    }
    function distanceBetween(latLng1, latLng2) {
        latLng1 = toCoords(latLng1)
        latLng2 = toCoords(latLng2)

        return Math.pow(latLng1[0] - latLng2[0], 2) + Math.pow(latLng1[1] - latLng2[1], 2)
    }
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
        addVertex(latLng, properties) {
            latLng = toKey(latLng)
            if(this.nodes[latLng]) warn(`Node at ${latLng} overwritten.`)
            this.nodes[latLng] = {
                properties,
                connections: {}
            }
        },
        updateVertexProperties(latLng, properties) {
            latLng = toKey(latLng)
            if(!this.nodes[latLng]) {
                warn(`Node at ${latLng} does not exist; properties could not be changed.`)
                return
            }
            this.nodes[latLng].properties = properties
        },
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