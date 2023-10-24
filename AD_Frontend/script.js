
cellStatus = [
    "bad",
    "good",
    "unknown",
    "empty"
]

// variable global
let droneMap = [];
for (let i = 0; i < 20; i++) {
    droneMap[i] = [];
    for (let j = 0; j < 20; j++) {
        droneMap[i][j] = cellStatus[Math.floor(Math.random() * cellStatus.length)];
    }
}
console.log(JSON.stringify(droneMap));


document.addEventListener("DOMContentLoaded", function() {
    generateEmptyMap();
});

function generateEmptyMap() {
    var mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = "";

    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            var cell = document.createElement("div");
            cell.classList.add("cell");
            mapContainer.appendChild(cell);
        }
        // Añadir un salto de línea después de cada fila para asegurar que sea 20x20
        mapContainer.appendChild(document.createElement("br"));
    }
}

function generateMap() {
    var mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = "";

    // update droneMap
    for (let i = 0; i < 20; i++) {
        droneMap[i] = [];
        for (let j = 0; j < 20; j++) {
            droneMap[i][j] = cellStatus[Math.floor(Math.random() * cellStatus.length)];
        }
    }

    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            var cell = document.createElement("div");
            cell.classList.add("cell");

            if (droneMap[i][j] == "bad") {
                cell.classList.add("red");
            }
            else if (droneMap[i][j] == "good") {
                cell.classList.add("green");
            }
            

            mapContainer.appendChild(cell);

            // console.log(droneMap[i][j]);
        }
        // Añadir un salto de línea después de cada fila para asegurar que sea 20x20
        mapContainer.appendChild(document.createElement("br"));
    }
}

