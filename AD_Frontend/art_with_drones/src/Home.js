import { useState, useEffect, useMemo } from "react"
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




export function Home() {
    const [counter, setCounter] = useState(0)
    const [mapArray, setMapArray] = useState(getEmptyMap())
    const [kafkaConnected, setKafkaConnected] = useState(false)
    const [intervalId, setIntervalId] = useState(null)

    const [figureName, setFigureName] = useState(null)
    const [authDronesIds, setAuthDronesIds] = useState([])
    const [error, setError] = useState(null);
    

    function requestMap() {
        fetch(`http://${Settings.HTTP_SERVER_HOST}:${Settings.HTTP_SERVER_PORT}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error en la solicitud al servidor");
            }
            return response.json(); // Parsea la respuesta como JSON
        })
        .then((data) => {
            /* Fill map array */
            const mapData = data.map; // Obtener el array de mapas del JSON
            const matrixSize = 20; // Tamaño de la matriz 20x20
            const emptyWord = "empty"; // Palabra para los elementos vacíos

            // Crear una matriz 20x20 con palabras en cada elemento
            const wordMatrix = Array.from({ length: matrixSize }, () =>
                Array.from({ length: matrixSize }, () => emptyWord)
            );

            // Llenar la matriz con las palabras del JSON
            for (let i = 0; i < matrixSize; i++) {
                for (let j = 0; j < matrixSize; j++) {
                    wordMatrix[i][j] = mapData[i][j] || emptyWord;
                }
            }

            // Aquí puedes hacer lo que quieras con wordMatrix, por ejemplo, imprimirlo en la consola
            setMapArray(wordMatrix); // Actualiza el estado con la nueva matriz


            /* Figure Name */
            const figureName = data.figureName;
            if (figureName) {
                setFigureName(figureName);
            } else {
                setFigureName("No figure name detected");
            }

            /* Auth Drones Ids */
            const authDronesIds = data.authDronesIds;
            if (authDronesIds) {
                setAuthDronesIds(authDronesIds);
            } else {
                setAuthDronesIds([]);
            }
            


            if (error) setError(null);
        })
        .catch((error) => {
            setError(`Se ha producido un error leyendo el mapa de API_Engine: ${error.message}`);
            setAuthDronesIds([]);
            //console.error("Error al obtener datos del servidor:", error);
            setMapArray(getEmptyMap());
        });
    }


    function connectToKafka() {
        return setInterval(() => {

            requestMap();

            setCounter((prevCounter) => prevCounter + 1);
        }, Settings.FREQUENCY); // Delay entre las solicitudes
    }

    function sortedDrones() {
        return authDronesIds.slice().sort((d1, d2) => d1.id - d2.id);
      }
    

    return (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>            
            <h1>Home</h1>
            <div style={{ display: "flex", justifyContent: "center" }}>
                {renderMap(mapArray)}

            </div>
            <p>
                <span>Map iteration: {counter}</span>
                <br />
                <span>Periodo de llamadas HTTP: {Settings.FREQUENCY}ms</span>
                <br />
                <span>
                    {error ?
                        <span style={{ color: "red" }}>Error: {error} </span>
                        : "Petición procesada correctamente. "
                    }
                </span>
                <br />

                <span style={{ color: "blue" }}>
                    Figure name: {figureName ?? "No figure name detected"}
                </span>
                <br />

                <span>
                    Drones authorized: {authDronesIds.length ?? "N/D"}
                </span>
                <br />
                <span>
                    Drones alive: {authDronesIds.filter((drone) => drone.isAlive).length ?? "N/D"}
                </span>

            </p>

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

                <br />

            </div>


            {authDronesIds.length <= 0 ? (
                <span style={{ color: "red" }}>No drones authorized</span>
            ) : (   
                <table style={{ color: "green" }}>
                <thead>
                    <tr>
                    <td>Drone id</td>
                    <td>Status</td>
                    <td>Target square</td>
                    </tr>
                </thead>
                <tbody>
                    {sortedDrones().map((drone) => (
                    <tr key={drone.id}>
                        <td>{drone.id ?? "No id detected"}</td>
                        <td>{drone.isAlive ? "Alive" : "Dead"}</td>
                        <td>{drone.targetSquare ?? "N/D"}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            
        </div>
    )
}