const map = L.map('map', {
    drawControl: true
}).setView([51.505, -0.09], 13)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    token: 'sk.eyJ1IjoicGV0ZXJnb2VkZWtlIiwiYSI6ImNrN3NqaXl5ODBwdTIzb3FsOHJkeWV5a28ifQ.7NMe4Jy99F1bd19L2ZFSvg'
}).addTo(map)


map.on('locationfound', onLocationFound)

map.locate({
    setView: true,
    maxZoom: 16
})

const userIcon = L.icon({
    iconUrl: '/images/icon.png',
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [7.5, 7.5],
    // shadowUrl: '/images/shadow.png',
    // shadowSize: [42, 42],
    // shadowAnchor: [20, 20]
})

let firstTime = true
let marker
function onLocationFound(e) {
    if(firstTime) {
        marker = L.marker(e.latlng, { icon: userIcon }).addTo(map)
        map.stopLocate()
        map.locate({
            maxZoom: 16,
            watch: true
        })
        firstTime = false
    }
    if(marker) marker.setLatLng(e.latlng)
}


const geoJsonPoly = {
    type: "Feature",
    properties: {
        name: "Test"
    },
    geometry: {
        type: "LineString",
        coordinates: [
        ]
    }
}

const myLayer = L.geoJSON().addTo(map)

// map.on('click', function(ev) {
//     var latlng = map.mouseEventToLatLng(ev.originalEvent);
//     geoJsonPoly.geometry.coordinates.push([latlng.lng, latlng.lat])
//     myLayer.clearLayers()

//     let one
//     let two
//     if(geoJsonPoly.geometry.coordinates.length) {
//         one = L.latLng(geoJsonPoly.geometry.coordinates[0])
//         two = L.latLng(geoJsonPoly.geometry.coordinates[geoJsonPoly.geometry.coordinates.length - 1])
//     }

//     console.log(one.equals(two))
//     if(one.equals(two, 0.00001) && geoJsonPoly.geometry.coordinates.length > 2) {
//         geoJsonPoly.geometry.coordinates[geoJsonPoly.geometry.coordinates.length - 1] = geoJsonPoly.geometry.coordinates[0]
//         geoJsonPoly.geometry.type = 'Polygon'
//         geoJsonPoly.geometry.coordinates = [geoJsonPoly.geometry.coordinates]
//     }
    
//     myLayer.addData(geoJsonPoly)
//   });

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

const polys = []
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer
    layer.on("click", function (e) {
        const popup = new L.popup()
        var bounds = layer.getBounds();
        var popupContent = "popup content here";
        popup.setLatLng(bounds.getCenter());
        popup.setContent(popupContent);
        map.openPopup(popup);
    });
    polys.push(e)
    map.addLayer(layer);
 });

 function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

document.querySelector('.search').addEventListener('keypress', event => {
    event.preventDefault()
    if(event.which == 13) {
        console.log(polys)
    }
})


var xhr = new XMLHttpRequest()
xhr.open('GET', '/map/path', true)
xhr.send()

xhr.onload = function () {
    console.log(xhr.responseText)
    const geoJSONPoly = {
        type: "Feature",
        properties: {
            name: "Test"
        },
        geometry: {
            type: "LineString",
            coordinates: [
            ]
        }
    }
    geoJSONPoly.geometry = JSON.parse(xhr.responseText)
    
    L.geoJSON(geoJSONPoly, {}).addTo(map)
}


function send(data) {
    const xml = new XMLHttpRequest()
    xml.open('POST', '/')
    xml.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xml.send(JSON.stringify(data))
}