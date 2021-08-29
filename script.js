let map, infoWindow, service;
let popUp = document.querySelector(".popup")
let input = document.querySelector("#searchterm")
let plazas = document.querySelector("#plazas")
let rest = document.querySelector("#restaurantes")
let crowd = document.querySelector("#concurrido")
let db = (localStorage.getItem("db")) ? JSON.parse(localStorage.getItem("db")) : new Object()
let topCrowded = []
input.addEventListener("input", () => {
    predictInput(input)
})

function predictInput(inp) {
    auto = new google.maps.places.AutocompleteService()
    str = inp.value
    request = { input: str, location: map.getCenter(), radius: 20000, type: "shopping_mall" }

    predictions = auto.getPlacePredictions(request, (pre) => {
        getToPrediction(pre[0])
    })
}

function getToPrediction(pre) {
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
    load();
    crowded()
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function checkDB(id){
    if (id in db) return

    to = Math.floor(Math.random() * 500) + 100
    db[id.toString()] = {total: to, actual: Math.floor(Math.random() * to) + 50}

    localStorage.setItem("db", JSON.stringify(db));
}

function compare(a, b){
    if (b["actual"]/b["total"] >= a["actual"]/a["total"]) return 1
    return -1
}

function crowded(){
    top3 = []
    for (place in db){
        if (top3.length < 3) {
            top3.push(place)
            continue
        }

        top3 = top3.sort(compare)
        for (i = 0; i < top3.length; i++){
            if(place["actual"] > top3[i]["actual"]) top3[i] = place
        }
    }

    top3.sort(compare)
    
    for (top in top3){
        service.getDetails({placeId: top3[top]}, (details) => {
            plazadiv = crowd.children[top]
            img = plazadiv.querySelector("img")
            namediv = plazadiv.querySelector(".nombres")
            addressdiv = plazadiv.querySelector(".direccion")

            if (details.photos) img.setAttribute("src", details.photos[0].getUrl())
            else img.setAttribute("src", "nodisponible.jpg")
            plazadiv.dataset.id = details.place_id
            namediv.innerText = details.name;
            addressdiv.innerText = details.vicinity
        })
    }    
}

function handleClick(event) {
    if (isIconMouseEvent(event)) {
        event.stop()
        if (event.placeId) {
            service.getDetails({ placeId: event.placeId }, (details) => {
                map.panTo(event.latLng)
                checkDB(event.placeId)
                popUpInfo(details);
            })
        }
    }
}

function popUpInfo(details) {
    date = new Date()
    day = date.getDay()
    day = (day == 0) ? 6 : day - 1

    placeName = details.name;
    photoUrl = (details.photos) ? details.photos[0].getUrl() : "nodisponible.jpg";
    address = details.formatted_address;
    open = (details.opening_hours) ? details.opening_hours.weekday_text[day] : "No disponible"
}

function loadItems(pre, type) {
    for (i = 0; i < type.childElementCount; i++) {
        plazadiv = type.children[i]
        img = plazadiv.querySelector("img")
        namediv = plazadiv.querySelector(".nombres")
        addressdiv = plazadiv.querySelector(".direccion")
        details = pre[pre.length - i - 1];

        if (details.photos) img.setAttribute("src", details.photos[0].getUrl())
        else img.setAttribute("src", "nodisponible.jpg")
        plazadiv.dataset.id = details.place_id
        namediv.innerText = details.name;
        addressdiv.innerText = details.vicinity
    }
}

function load() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                request = { location: pos, rankby: google.maps.places.RankBy.DISTANCE, radius: 10000, type: "shopping_mall" }
                predictionsPlaza = service.nearbySearch(request, (pre) => {
                    loadItems(pre, plazas)
                })
                
                request = { location: pos, rankby: google.maps.places.RankBy.DISTANCE, radius: 1000, type: "restaurant" }
                predictionsRest = service.nearbySearch(request, (pre) => {
                    loadItems(pre, rest)
                })
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

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );

    infoWindow.open(map);
}