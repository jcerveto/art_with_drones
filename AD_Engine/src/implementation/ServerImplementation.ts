import * as net from 'net';

import { ServerEntity } from '../model/ServerEntity';
import { SquareEntity } from '../model/SquareEntity';
import { EStatus } from '../model/EStatus';
import { DronEntity } from '../model/DronEntity';

export class ServerImplementation {

    public static start(server: ServerEntity): boolean {
        try {
            server.getServer().listen(server.getPort(), () => {
                console.log('listening on 0.0.0.0:' + server.getPort());
            });

            // Call the async function every 10 seconds
            setInterval(() => ServerImplementation.weatherStuff(server), 10000);

            return true;
        } catch (err) {
            console.error("ERROR: Trying to start: ", err);
            return false;
        }
    }

    public static async weatherStuff(server: ServerEntity) {
        // Async function to be called every 10 seconds
        console.log('Async task executed at ', new Date());
        // Your asynchronous logic here
        
        try {
            ServerImplementation.isWeatherValid()
                .then((isValid) => {
                    if (isValid) {
                        console.log('Weather is valid!');
                    }
                    else {
                        console.log('Weather is not valid!');
                        ServerImplementation.handleBadWeather();
                    }
                })
                .catch((err) => {
                    console.log("Unexpected error in weatherStuff: ", err)
                    ServerImplementation.handleBadWeather();
                })
                .finally(() => {
                    console.log("End of async task")
                });

        } catch (err) {
            console.error(`ERROR: ${err}`);
            console.log('Weather validation failed');
        }
    }

    public static handleClient(server: ServerEntity, conn: net.Socket) {
        console.log('new client');

        conn.on('data', data => {
            console.log('data received: ' + data);
            ServerImplementation.handleClientRequest(server, conn, data);
        });

        conn.on('end', () => {
            console.log('client left');
        });

        conn.on('close', () => {
            console.log('client closed connection');
        });
    }

    public static async isWeatherValid(): Promise<boolean> {
        try {
            const currentTemperature = await ServerImplementation.getCurrentTemperature();
            const isValid = await ServerImplementation.isTemperatureValid(currentTemperature);
            return isValid;
        } catch (err) {
            console.error(`ERROR: Trying to validate weather data: ${err}`);
            return false;
        }
    }
    

    private static async getCurrentTemperature(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const HOST = 'ad_weather';
            const PORT = 5555;
            const city = 'alacant';
            const client = new net.Socket();
            //console.log('Trying to connect to: ' + HOST + ':' + PORT);

            client.connect(PORT, HOST, () => {
                console.log('Connected to: ' + HOST + ':' + PORT);
                client.write(city);
            });

            client.on('data', (data) => {
                const response = data.toString('utf-8');
                const responseJson = JSON.parse(response);
                const temperature: number = parseInt(responseJson?.temperature);
                if (!isNaN(temperature)) {
                    client.destroy();
                    resolve(temperature); // Resuelve la promesa con la temperatura recibida
                } else {
                    client.destroy();
                    reject(new Error('Invalid temperature format')); // Rechaza la promesa con un error
                }
            });

            client.on('close', () => {
                console.log('Connection closed');
            });

            client.on('error', (err) => {
                console.error('Error trying to get current temperature: ' + err);
                client.destroy();
                reject(-1); // Rechaza la promesa con un valor negativo
            });
        });
    }


    private static isTemperatureValid(temperature: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                if (temperature >= ServerEntity.MIN_VALID_TEMPERATURE) {
                    resolve(true);
                } else {
                    reject(false);
                }
            } catch (err) {
                console.error(`ERROR: Trying to validate temperature: ${err}`);
                reject(false);
            }

        });
    }

    private static handleBadWeather() {
        console.log('Bad weather...');
    }

    public static handleClientRequest(server: ServerEntity, conn: net.Socket, data: Buffer) {
        try {
            const cleanRequest = data.toString('utf-8');
            const jsonRequest = JSON.parse(cleanRequest);
            const dron = {
                id: jsonRequest.id,
                targetSquareStr: jsonRequest.target,
                currentSquareStr: jsonRequest.current
            }
            const targetSquare = SquareEntity.fromString(dron.targetSquareStr);
            const currentSquare = SquareEntity.fromString(dron.currentSquareStr);
            const pathEnded = targetSquare.equals(currentSquare);
            let status: EStatus = EStatus.UNKNOWN;
            if (pathEnded) {
                status = EStatus.GOOD;
            }
            else {
                status = EStatus.BAD;
            }
            const dronEntity = new DronEntity(dron.id, status, currentSquare);
            currentSquare.setDron(dronEntity);
            // se elimina el anterior. No funciona. Pero eliminaria todos los drones de una casulla
            server.getMap().getMapObject()
                .delete(dronEntity.getId());
            // se anade
            server.getMap().getMapObject()
                .set(currentSquare.getHash(), currentSquare);
            server.showMap();
            const bytesResponse = Buffer.from(cleanRequest + '\r\n' + cleanRequest);
            conn.write(bytesResponse.toString('utf-8'));
            conn.end();
        }
        catch (err) {
            console.error(`ERROR: Trying to handle client request: ${err}`);
        }

    }

    public static showMap(server: ServerEntity): void {
        try {
            console.log(server.getMap().toString());
        }
        catch (err) {
            console.error(`ERROR: Trying to show map: ${err}`);
        }
    }



}