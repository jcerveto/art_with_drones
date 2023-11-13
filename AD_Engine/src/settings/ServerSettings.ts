import dotenv from "dotenv";

dotenv.config();

let auxPort: number;
try {
    auxPort = parseInt(process.env.MAIN_PORT);
}
catch (err) {
    console.error(`ERROR: Trying to get main port: ${err}`);
    throw err;
}
export const MAIN_PORT: number = auxPort;


console.log(`MAIN_PORT: ${MAIN_PORT}`);
let auxHost: string = process.env.MAIN_HOST;
if (auxHost == undefined) {
    console.error(`ERROR: Trying to get main host: `);
    throw new Error("No main host found");
}

export const MAIN_HOST: string = auxHost;

let httpPort: number = parseInt(process.env.HTTP_PORT);
if (isNaN(httpPort)) {
    console.error(`ERROR: Trying to get http port: `);
    throw new Error("No http port found");
}
export const HTTP_PORT: number = httpPort;

let maxConcurrentConnections: number = parseInt(process.env.MAX_CONCURRENT_CONNECTIONS);
if (isNaN(maxConcurrentConnections) || maxConcurrentConnections == undefined) {
    console.error(`ERROR: Trying to get max concurrent connections: `);
    throw new Error("No max concurrent connections found");
}
export const MAX_CONCURRENT_CONNECTIONS: number = maxConcurrentConnections;

let auxKeepAliveInterval: number = parseInt(process.env.KEEP_ALIVE_INTERVAL);   // in ms
if (isNaN(auxKeepAliveInterval) || auxKeepAliveInterval == undefined) {
    console.error(`ERROR: Trying to get keep alive interval: `);
    throw new Error("No keep alive interval found");
}

/**
 * Cada cuánto tiempo (en ms) se revisan los keep alive de todos loa drones
 */
export const KEEP_ALIVE_INTERVAL: number = auxKeepAliveInterval;

let auxKeepAliveTimeout: number = parseInt(process.env.KEEP_ALIVE_TIMEOUT);   // in ms
if (isNaN(auxKeepAliveTimeout) || auxKeepAliveTimeout == undefined) {
    console.error(`ERROR: Trying to get keep alive timeout: `);
    throw new Error("No keep alive timeout found");
}

/**
 * Cuánto tiempo (en ms) tiene que pasar para que un drone se considere desconectado
 */
export const KEEP_ALIVE_TIMEOUT: number = auxKeepAliveTimeout;

let auxRecover: string = process.env.RECOVER;
if (auxRecover == undefined) {
    console.error(`ERROR: Trying to get recover: `);
    throw new Error("No recover found");
}
export const RECOVER: boolean = auxRecover == 'yes';


let auxMaxDronesAccepted: number = parseInt(process.env.MAX_DRONES_ACCEPTED);
if (isNaN(auxMaxDronesAccepted) || auxMaxDronesAccepted == undefined) {
    console.error(`ERROR: Trying to get max drones accepted: `);
    throw new Error("No max drones accepted found");
}
export const MAX_DRONES_ACCEPTED: number = auxMaxDronesAccepted;

let auxEncode: string = process.env.ENCODE;
if (auxEncode == undefined) {
    console.error(`ERROR: Trying to get encode: `);
    throw new Error("No encode found");
}
export const ENCODE: string = auxEncode;


let auxCompleteWhenAllDronesArrive: string = process.env.COMPLETE_WHEN_ALL_DRONES_ARRIVE;
if (auxCompleteWhenAllDronesArrive == undefined) {
    console.error(`ERROR: Trying to get complete when all drones arrive: `);
    throw new Error("No complete when all drones arrive found");
}
export const COMPLETE_WHEN_ALL_DRONES_ARRIVE: boolean = auxCompleteWhenAllDronesArrive == 'yes';
