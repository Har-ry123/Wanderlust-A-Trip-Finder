mapboxgl.accessToken = mapToken;
console.log("Map Token in map.js:", mapToken);
console.log("Map coordinates:", coordinates);

if (!mapToken) {
    console.error("Mapbox token is missing!");
    document.getElementById('map').innerHTML = '<div class="alert alert-danger">Map cannot be loaded: Missing Mapbox token</div>';
} else if (!coordinates || coordinates.length !== 2) {
    console.error("Invalid coordinates:", coordinates);
    document.getElementById('map').innerHTML = '<div class="alert alert-danger">Map cannot be loaded: Invalid coordinates</div>';
} else {
    try {
        const map = new mapboxgl.Map({
            container: "map",
            style: 'mapbox://styles/mapbox/streets-v12',
            center: coordinates,
            zoom: 9,
        });

        map.on('load', () => {
            console.log("Map loaded successfully");
            const marker = new mapboxgl.Marker({ color: '#1E90FF' })
                .setLngLat(coordinates)
                .addTo(map);
        });

        map.on('error', (e) => {
            console.error("Mapbox error:", e);
            document.getElementById('map').innerHTML = '<div class="alert alert-danger">Error loading map: ' + e.message + '</div>';
        });
    } catch (error) {
        console.error("Error initializing map:", error);
        document.getElementById('map').innerHTML = '<div class="alert alert-danger">Error initializing map: ' + error.message + '</div>';
    }
}