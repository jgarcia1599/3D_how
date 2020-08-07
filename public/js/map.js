// Leaflet maps:

// http://leaflet-extras.github.io/leaflet-providers/preview/

var mymap = L.map('mapid').setView([23.4241, 53.8478], 7);


L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);


$(window).on("resize", function() {
    $("#mapid").height($(window).height()).width($(window).width());
    mymap.invalidateSize();
}).trigger("resize");

// for testing
// mymap.on('click', function(e) {
//     alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
// });

var boatIcon = L.icon({
    iconUrl: 'icons/boat.png',

    iconSize:     [50, 85], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
// boat icon on map
var boat_marker = L.marker([24.5239, 54.4346], {icon: boatIcon}).addTo(mymap);

boat_marker.bindPopup("<b>Bronze Age Boat</b><br>Reconstructed in NYU Abu Dhabi.");

console.log(materials_data);
//read materials data and create corresponding markers
for (var i=0;i<materials_data.length;i++){
    console.log(materials_data[i].name)
    var materialmarker =  L.marker([materials_data[i].lat, materials_data[i].long]).addTo(mymap);
    materialmarker.bindPopup(`<b style="text-align:center;">${materials_data[i].name}</b><br>${materials_data[i].description}`)


    var material_to_boat_line = L.polyline([[boat_marker.getLatLng().lat,boat_marker.getLatLng().lng],[materials_data[i].lat,materials_data[i].long]], {color: '#f0912b'}).addTo(mymap);
}