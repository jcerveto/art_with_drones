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
import {FigureImplementation} from "./FigureImplementation";
import {MapFiguraDronTableImplementation} from "./MapFiguraDronTableImplementation";
import {FigureEntity} from "../model/FigureEntity";
import { sleep } from './TimeUtils';

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
            // setInterval(() => server.weatherStuff(), WeatherSettings.WEATHER_TIMEOUT);

            // Crear topic para publicar el mapa.
            await BrokerServices.initMapPublisher();
            console.log("Map Broker connected. ")
            await BrokerServices.publishMap(server.getMap());

            // TODO: Añadir productor de target_position
            // TODO: Añadir consumidor de current_position

            // TEMPORAL: Cada cierto tiempo se publica el mapa actual.
            // setInterval(() => server.sendMapToDrones(), 5_000);

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
                await ServerImplementation.handleClientAuthenticationRequest(server, conn, data);
            } catch (err) {
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
                const status: boolean = jsonParsedRequest.ackSubscribe;
                if (status) {
                    console.log(`Drone ${dron_id} subscribed correctly. `);
                    const square = await MapFiguraDronTableImplementation.getSquareFromDrone(droneEntity);
                    await BrokerServices.publishTargetPosition(droneEntity, square)
                }
                else {
                    console.log(`Drone ${dron_id} NOT subscribed correctly. `);
                }
            }

            // valida si hay hueco en la figura
            if (server.getMap().getAllDrones().length >= server.getCurrentFigure().getFigure().size) {
                throw new Error('ERROR: No more drones allowed. Figure is full of drones. ');
            } 



            // ver si hay hueco y mapear to figure
            const newDrone = new DronEntity(dron_id);
            if (! await MapFiguraDronTable.mapNewDrone(newDrone)) {         // TODO: Añadir row y column dede FigureEntity
                throw new Error('ERROR: BAD DRONE MATCH. ')
            }

            // add to map (1, 1)
            const firstSquare = new SquareEntity(1, 1);
            server.getMap().addDrone(newDrone, firstSquare);
            console.log("New drone added. ");
            console.log(server.getMap().toString());

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
            const answerJson = JSON.stringify(answer, null, 2);
            const bytesResponse = Buffer.from(answerJson);
            const encodedResponse = bytesResponse.toString('utf-8');

            conn.write(encodedResponse);
            console.log("RESPUESTA ENVIADA. ");
            conn.end();

        } catch (err) {
            console.error('Error handling client request:', err.message, err.error);
            const answer = {
                ok: false,
                message: errorMessages.AuthFailed
            };
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

    public static async getTargetSquareFromDronId(server: ServerEntity, dronId: number): Promise<SquareEntity> {
        try {
            // leer fichero de la figura
            const droneEntity = new DronEntity(dronId);
            return await MapFiguraDronTableImplementation.getSquareFromDrone(droneEntity);
        } catch (err) {
            console.error("ERROR: during getTargetSquareFromDronId: ", err.message);
            return null;
        }
    }

    public static subscribeToDrones(server: ServerEntity): void {
        try {
            console.log("subscribed to drones. ")
        } catch (err) {
            console.error(err.message);
        }
    }

    public static async sendMapToDrones(server: ServerEntity) {
        try {
            await BrokerServices.publishMap(server.getMap());
        } catch (err) {
            console.error(err.message);
        }
    }

    public static async weatherStuff(server: ServerEntity) {
        console.log('Weather task executed. ');

        try {
            const isValid : boolean = await server.isWeatherValid();
            if (!isValid) {
                await server.handleBadWeather();
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
            console.log('Handling bad weather... ');
            console.warn("Está comentado. Cambiarlo para release. ")
            server.sendDronesToBase();
        } catch (err) {
            console.error(`ERROR: While handleBadWeather: ${err}`)
        }
    }

    public static sendDronesToBase(server: ServerEntity) {
        try {
            console.log('Sending drones to base... ');
            server.getMap()
                .getAliveDrones().forEach(async (drone: DronEntity) => {
                await BrokerServices.publishTargetPosition(drone, new SquareEntity(1, 1));
                console.log(`Drone ${drone.getId()} sent to base. `);
            });


        } catch (err) {
            console.error(`ERROR: While sendDronesToBase: ${err}`)
        }
    }

    public static async startFigure(server: ServerEntity) {
        try {
            console.log('Emptying waiting pool... ');
            server.getWaitingPool().emptyPool();
            console.log('Starting figure... ');
            const figureIds: Array<number> = await FigureImplementation.loadFigureIds();
            //await MapFiguraDronTableImplementation.fillWithNewFigure(figureIds);
            console.error("Está comentado. Cambiarlo para release.startFigure ")
            console.log("Figure ids stores correctly. ")
            server.start();
        } catch (err) {
            console.error(`ERROR: While startFigure. Re-Raised: ${err}`)
            throw err;
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
            const jsonData = fs.readFileSync("data/AwD_figuras.json", 'utf8');
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

            for (const figure of server.getFigures()) {
                try {
                    await ServerImplementation.handleFigureShow(server, figure);
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
            server.activateShow();
            server.addCurrentFigure(figure);
            console.log(`Starting figure: ${figure.getName()}`);
            await MapFiguraDronTableImplementation.storeFigure(figure);
            for (let [squareHash, droneId] of figure.getFigure()) {
                const drone = new DronEntity(droneId);
                const [row, column] = squareHash.split('-').map(Number);
                const square = new SquareEntity(row, column);
                await BrokerServices.publishTargetPosition(drone, square);
                console.log(`New target position published: ${drone.toString()}, ${square.getHash()}`);
            }

            await BrokerServices.subscribeToCurrentPosition(server);
            server.clearCurrentFigure();
            server.deactivateShow();
        } catch (err) {
            server.clearCurrentFigure();
            server.deactivateShow();
            console.error(`ERROR: While handleFigureShow. Re-Raised: ${err.message}`)
            throw err;
        }
    }


}