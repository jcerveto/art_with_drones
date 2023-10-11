import * as net from 'net';

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
            setInterval(() => server.weatherStuff(), WeatherSettings.WEATHER_TIMEOUT);

            // Crear topic para publicar el mapa.
            await BrokerServices.initMapPublisher();
            console.log("Map Broker connected. ")

            // TEMPORAL: Cada cierto tiempo se publica el mapa actual.
            setInterval(() => server.sendMapToDrones(), 5_000);

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
                console.log("Current waiting pool length: ", server.getWaitingPool().getDrones().length);
                if (server.readyToStartFigure()) {
                    await server.startFigure();
                }
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
            console.log('parsed: ', jsonParsedRequest);
            const dron_id = parseInt(jsonParsedRequest.id_registry);
            const dron_token = jsonParsedRequest?.token;

            // validate token
            if (! await RegistryTable.dronIdMatchesWithToken(dron_id, dron_token)) {
                throw new Error(`ERROR: Token don't match with Drone id: ${dron_id} and token: ${dron_token}.`);
            }


            // ver si hay hueco y mapear to figure
            const newDrone = new DronEntity(dron_id, null);
            if (!MapFiguraDronTable.mapNewDrone(newDrone)) {
                throw new Error('ERROR: BAD DRONE MATCH. ')
            }

            // añadir a la waiting pool
            server.getWaitingPool().addDron(newDrone);

            // suscribirse al keep alive
            // await BrokerServices.suscribeToKeepAlive(server, newDrone);

            // enviar respuesta
            const answer = {
                ok: true,

                message: `Successful authentication. Subscribe to topics: 
                    'start',
                    '${BrokerSettings.TOPIC_TARGET_POSITION}_${dron_id}',
                    '${BrokerSettings.TOPIC_MAP}'. Publish to topic: 
                    '${BrokerSettings.TOPIC_KEEP_ALIVE}_${dron_id}
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
        console.log("Cerrar conn con el cliente. ");
    }

    public static getTargetSquareFromDronId(server: ServerEntity, dronId: number): SquareEntity | null {
        try {
            // leer fichero de la figura
            return new SquareEntity(15, 15);
        } catch (err) {
            console.error(err.message);
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

    public static sendMapToDrones(server: ServerEntity): void {
        try {
            BrokerServices.publishMap(server.getMap())
                .then(() => {
                    console.log(`New map published.`);
                })
                .catch((err) => {
                    console.log("ERROR: Publishing map. ", err);
                });
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

            server.sendDronesToBase();
        } catch (err) {
            console.error(`ERROR: While handleBadWeather: ${err}`)
        }
    }

    public static sendDronesToBase(server: ServerEntity) {
        try {
            console.log('Sending drones to base... ');
            server.getMap()
                .getDrones().forEach(async (drone: DronEntity) => {
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
            await MapFiguraDronTableImplementation.fillWithNewFigure(figureIds);
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
}