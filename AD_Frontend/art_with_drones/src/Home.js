import { useState, useEffect } from "react"
import * as Settings from "./setEnv"

const cellStatus = [
    "bad",
    "good",
    "uknown",
    "empty",
]


function getRandomMap() {
    const randomMap = [];
    for (let i = 0; i < 20; i++) {
        randomMap[i] = [];
        for (let j = 0; j < 20; j++) {
            randomMap[i][j] = cellStatus[Math.floor(Math.random() * cellStatus.length)];
        }
    }
    return randomMap;
}

function getEmptyMap() {
    const emptyMap = [];
    for (let i = 0; i < 20; i++) {
        emptyMap[i] = [];
        for (let j = 0; j < 20; j++) {
            emptyMap[i][j] = cellStatus[3];
        }
    }
    return emptyMap;
}


function renderMap(mapArray) { 
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 20px)" }}>
            {mapArray.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: cell === "bad"
                                ? "red"
                                : cell === "good"
                                    ? "green"
                                    : "white",
                            border: "1px solid black",
                        }}
                    ></div>
                ))
            ))}
        </div>
    );
}

function parseCsvToMapArray(csv) {
    // Procesar el CSV y convertirlo en un nuevo mapArray
    // ... Implementa tu lógica para convertir el CSV en un mapArray ...
    // Por ejemplo, puedes dividir el CSV en líneas y luego en celdas.
    // Asumiendo que el CSV es una cadena de texto con líneas y celdas separadas por comas.
    console.log(JSON.stringify(csv));
    const lines = csv.split("\n");
    const newMapArray = lines.map((line) => line.split(","));

    return newMapArray;
}


export function Home() {
    const [counter, setCounter] = useState(0)
    const [mapArray, setMapArray] = useState(getEmptyMap())
    const [kafkaConnected, setKafkaConnected] = useState(false)
    const [intervalId, setIntervalId] = useState(null)


    function connectToKafka() {
        return setInterval(() => {
            fetch(`${Settings.HTTP_SERVER_HOST}:${Settings.HTTP_SERVER_PORT}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    setMapArray(parseCsvToMapArray(data.map));
                })
                .catch((error) => {
                    console.error("Error al obtener datos del servidor:", error);
                });
    
            setCounter(prevCounter => prevCounter + 1);
        }, 2000); // Delay de 2000 milisegundos entre las solicitudes
    }
    


    return (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>            <h1>Home</h1>
            <div style={{ display: "flex", justifyContent: "center" }}>
                {renderMap(mapArray)}

            </div>
            <p>Map iteration: {counter}</p>

            <div style={{ display: "flex", justifyContent: "center" }}>

                <button
                    style={{ width: "100px", height: "50px", alignSelf: "center" }}
                    onClick={() => {
                    setCounter(0)
                    if (kafkaConnected) {
                        //setMapArray(getEmptyMap())
                        clearInterval(intervalId)
                    }
                    else {
                        setIntervalId(connectToKafka())
                    }
                    setKafkaConnected(!kafkaConnected)
                }}>
                    {kafkaConnected ? "Disconnect from Kafka" : "Connect to Kafka"}
                
                </button>
                


                <button
                    style={{ width: "100px", height: "50px", alignSelf: "center" }}
                    onClick={() => {
                    setCounter(counter + 1)
                    setMapArray(getRandomMap())
                }}>Random map</button>
                
                <button
                    style={{ width: "100px", height: "50px", alignSelf: "center" }}
                    onClick={() => {
                    setCounter(counter + 1)
                    setMapArray(getEmptyMap())
                }}>Empty map</button>

                    
                <button
                    style={{ width: "100px", height: "50px", alignSelf: "center" }}
                    onClick={() => {
                    setCounter(0)
                }}>Clear counter</button>

            </div>
            
        </div>
    )
}