
//import { consumer } from "./node_modules/kafkajs";

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


document.addEventListener("DOMContentLoaded", function() {
    generateEmptyMap();
});


async function connectToKafka() {
    console.log("Connecting to Kafka...");
    generateEmptyMap();

    const mapTopic = process.env.MAP_TOPIC;
    const mapGroupId = 12345;

    if (!mapTopic) {
        console.error("MAP_TOPIC not set");
        
        window.alert("MAP_TOPIC not set");
        return;
    }

    const mapConsumer = consumer({
        groupId: mapGroupId
    });
    
    await mapConsumer.connect();
    await mapConsumer.subscribe({
        topic: mapTopic,
        fromBeginning: false
    });
    console.log("Connected to Kafka");

    await mapConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Received message");
            console.log({
                value: message.value.toString()
            });

            var data = JSON.parse(message.value.toString());
            console.log(data);

            // Update map
            //droneMap[data.x][data.y] = data.status;
            //generateMap();
        }
    });
}

function generateEmptyMap() {
    for (let i = 0; i < 20; i++) {
        droneMap[i] = [];
        for (let j = 0; j < 20; j++) {
            droneMap[i][j] = cellStatus["empty"];
        }
    }

    generateMap();
}

function generateRandomMap() {
    for (let i = 0; i < 20; i++) {
        droneMap[i] = [];
        for (let j = 0; j < 20; j++) {
            droneMap[i][j] = cellStatus[Math.floor(Math.random() * cellStatus.length)];
        }
    }

    generateMap();
}

function generateMap() {
    var mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = "";

    for (let i = 0; i < droneMap.length; i++) {
        for (let j = 0; j < droneMap[i].length; j++) {
            var cell = document.createElement("div");
            cell.classList.add("cell");

            // Set background color based on cell status
            if (droneMap[i][j] == "bad") {
                cell.classList.add("red");
            }
            else if (droneMap[i][j] == "good") {
                cell.classList.add("green");
            }

            mapContainer.appendChild(cell);
        }
    }
}