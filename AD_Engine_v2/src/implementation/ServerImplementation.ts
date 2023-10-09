import * as net from 'net';

import { ServerEntity } from "../model/ServerEntity";
import * as errorMessages from "../settings/ConnectionsMessages";
import {MapFiguraDronTable} from "../model/MapFiguraDronTable";
import {DronEntity} from "../model/DronEntity";
import {SquareEntity} from "../model/SquareEntity";
import {RegistryTable} from "../model/RegistryTable";

export class ServerImplementation {
    public static createNetServer(server: ServerEntity): net.Server {
        return net.createServer(server.handleClientAuthentication.bind(server));
    }

    public static start(server: ServerEntity) {
        try {
            server.getServer()
                .listen(server.getPort(), () => {
                    console.log('listening on 0.0.0.0:' + server.getPort());
                });

            if (!MapFiguraDronTable.createEmptyFigure(server.getMap())) {
                throw new Error('No se ha podido cargar la figura mapeada. ')
            }
            console.log("Figure mapped correctly. ")
        } catch (err) {
            console.error("ERROR while starting... ", err);
            throw err;
        }
    }

    public static handleClientAuthentication(server: ServerEntity, conn: net.Socket): void {
        console.log(`New client. `);

        conn.on('data', data => {
            try {
                console.log('data received: ' + data);
                ServerImplementation.handleClientAuthenticationRequest(server, conn, data);
                console.log("hola3")
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

    private static handleClientAuthenticationRequest(server: ServerEntity, conn: net.Socket, data: Buffer) {
        try {
            const cleanRequest = data.toString('utf-8');
            console.log('clean request: ', cleanRequest);
            const jsonParsedRequest = JSON.parse(cleanRequest);
            console.log('parsed: ', jsonParsedRequest);
            const dron_id = parseInt(jsonParsedRequest.id_registry);
            const dron_token = jsonParsedRequest.token;
            // validate token
            /*
            if (! RegistryTable.dronIdMatchesWithToken(dron_id, dron_token)) {
                throw new Error("ERROR: Token don't match with Drone id");
                !!! NO FUNCIONA
            }*/

            // map to figure
            const newDrone = new DronEntity(dron_id, null);
            if (!MapFiguraDronTable.mapNewDrone(newDrone)) {
                throw new Error('ERROR: BAD DRONE MATCH. ')
            }

            // obtener target square
            const targetSquare = server.getTargetSquareFromDronId(dron_id);
            if (targetSquare == null || targetSquare == undefined) {
                throw new Error("ERROR: getTargetSquareFromDronId returned null or undefined. ")
            }

            // enviar respuesta
            const answer = {
                target_position: targetSquare.toJson(),
                ok: true
            }
            const answerJson = JSON.stringify(answer, null, 2);

            const bytesResponse = Buffer.from(answerJson);
            conn.write(bytesResponse.toString('utf-8'));
            console.log("RESPUESTA ENVIADA. ");
            conn.end();

        } catch (err) {
            console.log("hola1")
            console.error('Error handling client request:', err.message, err.error);
            console.log("hola2")
            conn.write(errorMessages.AuthFailed);
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

}