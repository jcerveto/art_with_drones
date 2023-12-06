import * as net from 'net';
import * as fs from 'fs';

import {ServerEntity} from "../model/ServerEntity";
import * as errorMessages from "../settings/ConnectionsMessages";
import {MapFiguraDronTable} from "../model/MapFiguraDronTable";
import {DronEntity} from "../model/DronEntity";
import {SquareEntity} from "../model/SquareEntity";
import * as BrokerServices from "./BrokerImplementation";
import * as WeatherServices from "./WeatherImplementation";
import * as WeatherSettings from "../settings/WeatherSettings";
import {RegistryTable} from "../model/RegistryTable";
import * as BrokerSettings from "../settings/BrokerSettings";
import {MapFiguraDronTableImplementation} from "./MapFiguraDronTableImplementation";
import {FigureEntity} from "../model/FigureEntity";
import { sleep } from './TimeUtils';
import * as DatabaseSettings from "../settings/databaseSettings";
import { start as startHttp } from "./HttpServer"
import {AlreadyInMap} from "../model/AlreadyInMap";
import {MaxConcurrentConnectionsExceed} from "../model/MaxConcurrentConnectionsExceed";
import * as ServerSettings from "../settings/ServerSettings";


export class ServerImplementation {
    public static createNetServer(server: ServerEntity): net.Server {
        return net.createServer(server.handleClientAuthentication.bind(server));
    }

    public static async start(server: ServerEntity) {
        try {
            // Publicar servidor en puerto
            server.getServer()
                .listen(server.getPort(), () => {
                    console.log('listening on 0.0.0.0:' + server.getPort());
                });

            // Crear seguimiento del tiempo.
            if (WeatherSettings.VALIDATE_WEATHER) {
                console.log('*'.repeat(50), "\nWeather will be validate each ", WeatherSettings.WEATHER_TIMEOUT , ". \n", '*'.repeat(50))
                setInterval(() => server.weatherStuff(), WeatherSettings.WEATHER_TIMEOUT);
            } else {
                console.log('*'.repeat(50), "\nWeather validation disabled. \n", '*'.repeat(50))
            }

            // Crear topic para publicar el mapa.
            await BrokerServices.initMapPublisher();
            console.log("Map Broker connected. ")
            await BrokerServices.publishMap(server.getMap());
            console.log("Map published. ")

            // not-solved promise: open http server
            startHttp(server);

            // not-solved promise: open current_position topic subscriber
            BrokerServices.subscribeToCurrentPosition(server);

            // not-solved promise: update alive-dead drones
            setInterval(() => server.updateAliveDrones(), ServerSettings.KEEP_ALIVE_INTERVAL);

        } catch (err) {
            console.error("ERROR while starting... ", err);
            throw err;
        }
    }

    public static handleClientAuthentication(server: ServerEntity, conn: net.Socket): void {
        console.log(`New client. `);

        conn.on('data', async data => {
            try {
                console.log('data received: ' + data);
                if (server.getCurrentConcurrentConnections() > server.MAX_CONCURRENT_CONNECTIONS) {
                    throw new MaxConcurrentConnectionsExceed(`ERROR: Max concurrent connections exceed. `)
                }

                // Normal case
                server.incrementCurrentConcurrentConnections();
                // promesa sin AWAIT!
                ServerImplementation.handleClientAuthenticationRequest(server, conn, data)
                    .then(() => {
                        server.decrementCurrentConcurrentConnections();
                    });
            } catch (err) {
                if (err instanceof MaxConcurrentConnectionsExceed) {
                    const answer = {
                        ok: false,
                        message: err.message.toString()
                    }
                    const jsonAnswer = JSON.stringify(answer);
                    const bytesResponse = Buffer.from(jsonAnswer);
                    const encodedResponse = bytesResponse.toString('utf-8');
                    conn.write(encodedResponse);
                }
                console.error(`ERROR: Trying to handle client: ${err}`);
            }
        });

        conn.on('end', () => {
            try {
                console.log('client disconnected');
            } catch (err) {
                console.error(`ERROR: Trying to handle END of the client: ${err}`);
            }
        });

        conn.on('close', () => {
            try {
                ServerImplementation.handleClientAuthenticationClose(server, conn);
            } catch (err) {
                console.error(`ERROR: Trying to close client: ${err}`);
            }
        });
    }

    private static async handleClientAuthenticationRequest(server: ServerEntity, conn: net.Socket, data: Buffer) {
        try {
            console.log(`${'*'.repeat(50)}\nCurrent concurrent connections: ${server.getCurrentConcurrentConnections()}.\n${'*'.repeat(50)}\n`);
            const cleanRequest = data.toString('utf-8');
            console.log('clean request: ', cleanRequest);
            const jsonParsedRequest = JSON.parse(cleanRequest);
            console.log('object parsed: ', jsonParsedRequest);
            const dron_id = parseInt(jsonParsedRequest.id_registry);
            const dron_token = jsonParsedRequest?.token;
            const droneEntity = new DronEntity(dron_id);


            // validate token
            if (! await RegistryTable.dronIdMatchesWithToken(dron_id, dron_token)) {
                throw new Error(`ERROR: Token don't match with Drone id: ${dron_id} and token: ${dron_token}.`);
            }

            // si es un ACK de de subscribe se cierra la conexion. 
            if (jsonParsedRequest?.ackSubscribe != null) {
                console.log(`ACK Subscribe received from id=${dron_id}. `);
                const isSubscribed: boolean = jsonParsedRequest.ackSubscribe;
                if (isSubscribed) {
                    console.log(`Drone ${dron_id} subscribed correctly. `);
                    const square = await MapFiguraDronTableImplementation.getSquareFromDrone(droneEntity);
                    await BrokerServices.publishTargetPosition(droneEntity, square)
                    console.log(`New target position published: ${droneEntity.toString()}, ${square.getHash()}`);
                }
                else {
                    console.log(`Drone ${dron_id} NOT subscribed correctly. `);
                    server.getMap().removeDrone(droneEntity);
                    console.log("FALTA BORRARLO DE LA BASE DE DATOS. OCUPA UN HUECO. Ignorar...")
                }
            }

            // valida si el dron ya está en el mapa
            if (server.getMap().isDroneInMap(droneEntity)) {
                throw new AlreadyInMap('ERROR: Drone already in map. ');
            }

            // valida si hay hueco en la figura
            if (server.getMap().getAllDrones().length >= ServerSettings.MAX_DRONES_ACCEPTED) {
                throw new Error('ERROR: No more drones allowed. map is full of drones. ');
            } 


            // ver si hay hueco y mapear to figure
            const newDrone = new DronEntity(dron_id);
            if (await MapFiguraDronTable.mapNewDrone(newDrone)) {
                console.log(`New drone added to database: ${newDrone.toString()}`);
                const square = await MapFiguraDronTableImplementation.getSquareFromDrone(droneEntity);
                newDrone.setTarget(square);
            }
            else {
                console.error("ERROR: Drone not mapped. DroneId: ", newDrone.toString());
                await MapFiguraDronTable.forceMapNewDrone(newDrone, new SquareEntity(1, 1));
                newDrone.setTarget(new SquareEntity(1, 1));
                console.log(`New drone added to database: ${newDrone.toString()} -> (1, 1)`);
            }


            // add to map (1, 1)
            const firstSquare = new SquareEntity(1, 1);
            server.getMap().addDrone(newDrone, firstSquare);
            console.log("New drone added. ");
            console.log(server.getMap().toString());
            console.log("Mapa mostrado. ");

            // enviar respuesta
            const answer = {
                ok: true,

                message: `Successful authentication. Subscribe to topics: 
                    'start',
                    '${BrokerSettings.TOPIC_TARGET_POSITION}',
                    '${BrokerSettings.TOPIC_MAP}'. Publish to topic: 
                    '${BrokerSettings.TOPIC_CURRENT_POSITION}
                     `
            }
            const answerJson : string = JSON.stringify(answer);
            const bytesResponse: Buffer = Buffer.from(answerJson);
            const encodedResponse : string = bytesResponse.toString('utf-8');

            conn.write(encodedResponse);
            console.log("RESPUESTA ENVIADA. ");
            conn.end();

        } catch (err) {
            console.error(`Error handling client request: ${JSON.stringify}`, err.message, err.name, err.stack, '<-err.stack');
            let answer = {}
            // Already in map
            if (err instanceof AlreadyInMap) {
                answer = {
                    ok: true,
                    message: err.message.toString()
                }
            }
            // generic error
            else {
                answer = {
                    ok: false,
                    message: errorMessages.AuthFailed + err.message
                };
            }


            const answerJson = JSON.stringify(answer);
            const bytesResponse = Buffer.from(answerJson);
            const encodedResponse = bytesResponse.toString('utf-8');
            conn.write(encodedResponse);
            conn.end();
        }
    }

    private static handleClientAuthenticationClose(server: ServerEntity, conn: net.Socket): void {
        console.log("Client conn closed. ");
    }


    public static async sendMapToDrones(server: ServerEntity) {
        try {
            await BrokerServices.publishMap(server.getMap());
        } catch (err) {
            console.error(err.message);
        }
    }

    public static async weatherStuff(server: ServerEntity) {
        console.log(`${'#'.repeat(50)}\nWeather task executed. \n${'#'.repeat(50)}\n`);

        try {
            const isValid : boolean = await server.isWeatherValid();
            if (!isValid) {
                await server.handleBadWeather();
            }
            else {
                await server.handleGoodWeather();
            }
        } catch (err) {
            console.error(`ERROR: While weatherStuff: ${err}`)
        }

    }

    public static async isWeatherValid(server: ServerEntity) {
        try {
            const currentTemperature = await WeatherServices.getCurrentTemperature();
            const isWeatherValid = WeatherServices.isWeatherValid(currentTemperature);
            return isWeatherValid;
        } catch (err) {
            console.error(`ERROR: While isWeatherValid: ${err}`)
            return false;
        }
    }

    public static async handleBadWeather(server: ServerEntity) {
        try {
            if (server.getIsWeatherValid()) {
                // Procesar cambio de estado (de bueno a malo)
                server.setWeatherToBad();
                await server.publishCommunicationMessage("SERVER HAS DETECT BAD WEATHER. SENDING DRONES TO BASE. ");
                await server.sendDronesToBase();

            }
            console.log('Handling bad weather... ');
            console.warn("Está comentado. Cambiarlo para release. ")
            await server.sendDronesToBase();
        } catch (err) {
            console.error(`ERROR: While handleBadWeather: ${err}`)
        }
    }

    public static async handleGoodWeather(server: ServerEntity) {
        try {
            if (!server.getIsWeatherValid()) {
                // Procesar cambio de estado (de malo a bueno)
                server.setWeatherToGood();
                await server.publishCommunicationMessage("SERVER HAS DETECT GOOD WEATHER. SENDING DRONES TO LAST FIGURE TARGET POSITION. ");

                // Vuelve a enviar las coordenadas de destino a los drones
                for (const drone of server.getMap().getAliveDrones()) {
                    const square = await MapFiguraDronTableImplementation.getSquareFromDrone(drone);
                    drone.setTarget(square);
                    await BrokerServices.publishTargetPosition(drone, square);
                    console.log(`New target position published: ${drone.toString()}, ${square.getHash()}`);
                }
                if (server.getMap().getAliveDrones().length == 0) {
                    console.error("ERROR: No drones in map. Any target_position message was published. ")
                }
            }
            console.log('Handling good weather... ');
        } catch (err) {
            console.error(`ERROR: While handleGoodWeather: ${err}`)
        }
    }

    public static async sendDronesToBase(server: ServerEntity) {
        try {
            console.log('Sending drones to base... ');
            for (const drone of server.getMap().getAliveDrones()) {
                await BrokerServices.publishTargetPosition(drone, new SquareEntity(1, 1));
            }

            // check how many drones are in the map
            if (server.getMap().getAliveDrones().length == 0) {
                console.error("ERROR: No drones in map. Any target_position message was published. ")
            }
            else {
                console.log("All drones sent to base. ")
            }
        } catch (err) {
            console.error(`ERROR: While sendDronesToBase: ${err}`)
        }
    }

    static readyToStartFigure(server: ServerEntity): boolean {
        try {
            return server.getWaitingPool().getDrones().length == 3;
        } catch (err) {
            console.error(`ERROR: While readyToStartFigure. Re-Raised: ${err}`)
            throw err;
        }
    }

    static loadFigures(server: ServerEntity) {
        try {
            console.log('Loading figures... ');
            const jsonData = fs.readFileSync(DatabaseSettings.FIGURES_FILE_PATH, 'utf8');
            const figuresData = JSON.parse(jsonData);
            for (const figure of figuresData.figuras) {
                const figureEntity = new FigureEntity(figure.Nombre);
                for (const drone of figure.Drones) {
                    const droneId = parseInt(drone.ID);
                    const posicion = drone.POS;
                    const [fila, columna] = posicion.split(',').map(Number);
                    let square: SquareEntity = null;
                    try {
                        square = new SquareEntity(fila, columna);
                    } catch (err) {
                        console.log("ERROR: Trying to create square. Out of Range. Moving to (1, 1)", err.message);
                        square = new SquareEntity(1, 1);
                    }
                    figureEntity.addSquare(square, droneId);
                }
                // guardar en memoria
                server.addFigure(figureEntity);
            }
            for (const figure of server.getFigures()) {
                console.log(figure.toString());
            }
        } catch (err) {
            console.error(`ERROR: While loadFigures. Re-Raised: ${err}`)
            throw err;
        }
    }

    static async startShow(server: ServerEntity): Promise<void> {
        try {
            console.log('Starting show... ');
            console.log('Starting from the beginning... ');
            for (const figure of server.getFigures()) {
                try {
                    await ServerImplementation.handleFigureShow(server, figure);
                    await sleep(10_000);
                } catch (err) {
                    console.error(`ERROR: While handling figure: ${figure.getName()} ${err.message}. . Executing next figure...`)
                    continue;
                }

            }

            server.clearFigures();
        } catch (err) {
            console.error(`ERROR: While startShow. Re-Raised: ${err}`)
            server.clearFigures();
            throw err;
        }

    }

    static async handleFigureShow(server: ServerEntity, figure: FigureEntity): Promise<void> {
        try {
            console.log('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓')
            server.activateShow();
            server.addCurrentFigure(figure);
            console.log(`Starting figure: ${figure.getName()}`);
            await BrokerServices.publishCommunicationMessage(`Starting figure: ${figure.getName()}`);
            console.log(`Current figure: ${server.getCurrentFigure().toString()}`);
            await MapFiguraDronTableImplementation.storeFigure(figure);


            for (const registeredDrone of server.getMap().getAllDrones()) {
                if (! await MapFiguraDronTable.mapNewDrone(registeredDrone)) {
                    // La figura no tiene hueco para el dron.
                    // Se le asigna la posición (1, 1) y se le envía a la base.
                    registeredDrone.setTarget(new SquareEntity(1, 1));
                    const status: boolean = await MapFiguraDronTable.forceMapNewDrone(registeredDrone, new SquareEntity(1, 1));
                    if (!status) {
                        console.error("ERROR: BAD DRONE MATCH. Continue...", registeredDrone.toString())
                        continue;
                    }
                    await BrokerServices.publishTargetPosition(registeredDrone, new SquareEntity(1, 1));

                    console.error("ERROR: BAD DRONE MATCH. Continue...", registeredDrone.toString())
                    continue;
                }
                const newSquare: SquareEntity = await MapFiguraDronTableImplementation.getSquareFromDrone(registeredDrone);
                registeredDrone.setTarget(newSquare);

                // vuelve a actualizar automáticamente los drones vivos:
                server.updateNewDroneTimeStamp(registeredDrone);

                console.log(`New drone added to database: ${registeredDrone.toString()} -> ${newSquare.getHash()}`);
                await BrokerServices.publishTargetPosition(registeredDrone, newSquare);
                console.log(`New target position published: ${registeredDrone.toString()}, ${newSquare.getHash()}`);
            }
            if (server.getMap().getAliveDrones().length == 0) {
                console.error("ERROR: No drones in map. Any target_position message was published. ")
            }

            // MAIN LOOP: mientras no se complete la figura, se repite
            while (! await ServerImplementation.isFigureShowCompleted(server)) {
                await sleep(1000);
                console.log(`${'@'.repeat(50)}\nWaiting for drones to reach target position... ${Date.now().toString()}\n${'@'.repeat(50)}\n`);
            }
            console.log(`FIGURE ${server.getCurrentFigure().getName()} COMPLETED!`);
            await BrokerServices.publishCommunicationMessage(`FIGURE ${server.getCurrentFigure().getName()} COMPLETED!`);
            console.log(`WAITING 10 SECONDS TO DRAW NEXT FIGURE...`);
            await sleep(10_000);
            console.log(`Figure ${figure.getName()} ended. `);
            server.clearCurrentFigure();
            server.deactivateShow();
            console.log('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑');
        } catch (err) {
            server.clearCurrentFigure();
            server.deactivateShow();
            console.error(`ERROR: While handleFigureShow. Re-Raised: ${err.message}`)
            throw err;
        }
    }

    static async isFigureShowCompleted(server: ServerEntity): Promise<boolean> {
        try {
            return await server.getMap().matchesWithFigure(server.getCurrentFigure());
        } catch (err) {
            console.error(`ERROR: While isFigureShowCompleted. Returning false: ${err}`)
            return false;
        }
    }


    static async publishCommunicationMessage(server: ServerEntity, message: string) {
        try {
            await BrokerServices.publishCommunicationMessage(message);
        } catch (err) {
            console.error("ERROR: Trying to publishCommunicationMessage. ", err);
        }
    }

    static async recover(server: ServerEntity) {
        try {
            console.log('Recovering... ');

            console.log('Recovering the last figure... ');
            const recoveredDrones: Array<DronEntity> = await MapFiguraDronTableImplementation.getRecoveredDrones();
            for (const recoveredDrone of recoveredDrones) {
                server.getMap().addDrone(recoveredDrone, new SquareEntity(1, 1));
                console.log('Recovered drone: ', recoveredDrone.toString());
                server.updateNewDroneTimeStamp(recoveredDrone);
            }

            const recoveredFigure: FigureEntity = await MapFiguraDronTableImplementation.getRecoveredFigure();
            server.getFigures().unshift(recoveredFigure); // add to the beginning
            console.log('Recovered. ');
        } catch (err) {
            console.error("ERROR: Trying to recover. ", err);
        }
    }
}