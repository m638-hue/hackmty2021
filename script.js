let map, infoWindow, service;
let popUp = document.querySelector(".popup")
let input = document.querySelector("#searchterm")
let plazas = document.querySelector("#plazas")
let rest = document.querySelector("#restaurantes")
let crowd = document.querySelector("#concurrido")
let db = (localStorage.getItem("db")) ? JSON.parse(localStorage.getItem("db")) : new Object()
let button = document.querySelector("#search")
let predictionsInput = []
predContainer = document.querySelector(".extras")

input.addEventListener("input", () => {
    predictInput(input)
})

document.querySelector('body').addEventListener("click", (e) => {
    if(e.target.classList.contains('extras')) return
    else predContainer.style.display = 'none'
})

button.addEventListener('click', (e) => {
    if (input.dataset.id == ""){
        if (predictionsInput.length == 0) return
        predContainer.style.display = "none"
        service.getDetails({placeId: predictionsInput[0].place_id}, (details) => {
            map.panTo({lat: details.geometry.location.lat(), lng: details.geometry.location.lng()})
        })
    }
    else{
        predContainer.style.display = "none"
        service.getDetails({placeId: input.dataset.id}, (details) => {
            map.panTo({lat: details.geometry.location.lat(), lng: details.geometry.location.lng()})
        })
    }
})

document.querySelector(".contenedor").addEventListener("click", (e) => {e.stopPropagation()})
document.querySelector(".popupbc").addEventListener("click", (e) => {
    e.target.style.display = "none"
})

function predictInput(inp) {
    auto = new google.maps.places.AutocompleteService()
    str = inp.value
    request = { input: str, location: map.getCenter(), radius: 20000, type: "shopping_mall" }

    auto.getPlacePredictions(request, (pre) => {
        showPredictions(pre)
    })

    if (input.value == "") {
        input.dataset.id = ""
        predContainer.innerHTML = ""
        predContainer.style.display = "none"
        return
    }
}

function showPredictions(pre) {
    predictionsInput = pre
    predContainer = document.querySelector(".extras")
    if (input.value == "" || pre == null) {
        predContainer.innerHTML = ""
        predContainer.style.display = "none"
        return
    }
    predContainer.style.display = 'block'
    predContainer.innerHTML = ''
    predContainer.style.height = "8vh"

    for(i = 0; i < pre.length; i++){
        extraopt = document.createElement('div')
        extraopt.classList.add('extraopcion')
        extraopt.innerHTML = pre[i].description
        extraopt.dataset.id = pre[i].place_id
        extraopt.onclick = (e) =>{
            predContainer.style.display = "none"
            input.dataset.id = e.target.dataset.id
            input.value = e.target.innerHTML
        }
        predContainer.appendChild(extraopt)
    }

    predContainer.style.height = `${pre.length * 8}vh`
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
}

function isIconMouseEvent(e) {
    return "placeId" in e;
}

function checkDB(id){
    if (id in db) return db[id]

    to = Math.floor(Math.random() * 500) + 100
    db[id.toString()] = {total: to, actual: Math.floor(Math.random() * to) + 50}

    localStorage.setItem("db", JSON.stringify(db));
    return db[id]
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

    console.log(details)
    placeName = details.name;
    photoUrl = (details.photos) ? details.photos[0].getUrl() : "nodisponible.jpg";
    address = details.formatted_address;
    open = (details.opening_hours) ? details.opening_hours.weekday_text[day] : "No disponible"
    aforo = checkDB(details.place_id)
    total = aforo["total"]
    actual = aforo["actual"]
    percent = Math.floor(actual / total * 100) 

    pop = document.querySelector(".contenedor")
    title = pop.querySelector(".titulo")
    img = pop.querySelector(".fotito")
    bar = pop.querySelector(".actual")
    barnum = bar.querySelector(".capa")
    add = pop.querySelector(".dire")
    hor = pop.querySelector(".horario").querySelector(".dire")
    text = pop.querySelector(".parrafo")

    img.setAttribute("src", photoUrl);
    title.innerHTML = placeName
    bar.style.width = `${percent}%`
    barnum.innerHTML = `${percent}%`
    add.innerHTML = address
    hor.innerHTML = open
    text.innerHTML = `Aforo de ${actual} / ${total}`

    pop.parentElement.style.display = "flex"
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