let map, infoWindow, service;
let popUp = document.querySelector(".popup")
function getUserPos() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent("You are here :D");
                infoWindow.open(map);
                map.panTo(pos);
                map.setZoom(15);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            },
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 6,
    });
    
    service = new google.maps.places.PlacesService(map)
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    map.addListener("click", handleClick)
    getUserPos();
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function handleClick(event) {
    console.log("You clicked on: " + event.latLng);

    // If the event has a placeId, use it.
    if (isIconMouseEvent(event)) {
        console.log("You clicked on place:" + event.placeId);
        // Calling e.stop() on the event prevents the default info window from
        // showing.
        // If you call stop here when there is no placeId you will prevent some
        // other map click event handlers from receiving the event.
        //event.stop();

        if (event.placeId) {
            service.getDetails({placeId: event.placeId}, (details) => {
                popUpInfo(details);
            })
        }
    }
}

function popUpInfo (details) {

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}