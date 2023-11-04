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

