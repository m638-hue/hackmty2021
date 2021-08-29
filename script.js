let map, infoWindow, service;
let popUp = document.querySelector(".popup")
let input = document.querySelector("#searchterm")

input.addEventListener("input", () =>{
    predictInput(input)
})

function predictInput(inp){
    console.log(inp.value)
    auto = new google.maps.places.AutocompleteService()
    str = inp.value
    request = {input: str, location: map.getCenter(), radius: 5000, type: "locality"}
    
    predictions = auto.getPlacePredictions(request, (pre) => {
        getToPrediction(pre[0])
    })
}

function getToPrediction(pre) {
    console.log
}

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
    locationButton.addEventListener('click', getUserPos)
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    map.addListener("click", handleClick)
    getUserPos();
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function handleClick(event) {
    if (isIconMouseEvent(event)) {
        event.stop()
        if (event.placeId) {
            service.getDetails({placeId: event.placeId}, (details) => {               
                map.panTo(event.latLng)
                popUpInfo(details);
            })
        }
    }
}

function popUpInfo (details) {
    date = new Date()
    day = date.getDay()
    day = (day == 0) ? 6 : day - 1

    placeName = details.name;
    photoUrl = details.photos[0].getUrl()
    address = details.formatted_address;
    open = (details.opening_hours) ? details.opening_hours.weekday_text[day] : "No disponible"
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