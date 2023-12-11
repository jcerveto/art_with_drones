import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ServerEntity } from "../model/ServerEntity";
import * as ServerSettings from "../settings/ServerSettings";
import {DronEntity} from "../model/DronEntity";
import {RegistryTable} from "../model/RegistryTable";
import {AlreadyInMap} from "../model/AlreadyInMap";
import * as LoggerSettings from "../settings/LoggerSettings";
import {MapFiguraDronTable} from "../model/MapFiguraDronTable";
import {MapFiguraDronTableImplementation} from "./MapFiguraDronTableImplementation";
import {SquareEntity} from "../model/SquareEntity";
import * as BrokerServices from "./BrokerImplementation";

const auxRegistrationTimeout: string = process.env.REGISTRY_TIMEOUT;
if (auxRegistrationTimeout == null) {
    throw new Error("ERROR: REGISTRATION_TIMEOUT environment variable not set");
}
const auxRegistrationTimeoutNumber: number = parseInt(auxRegistrationTimeout);
if (isNaN(auxRegistrationTimeoutNumber)) {
    throw new Error("ERROR: REGISTRATION_TIMEOUT environment variable is not a number");
}
export const REGISTRATION_TIMEOUT: number = auxRegistrationTimeoutNumber;

let serverRef: ServerEntity = null;


const app = express();
app.use(express.json());
app.use(cors());
//app.use(morgan("dev")); // Usar morgan para debuggear

function getServerInfo() {
    if (serverRef == null) {
        console.error("ERROR: Trying to get server info but server is null");
        return {};
    }

    return {
        map: serverRef.getMap().getStatusArray(),
        figureName: serverRef.getCurrentFigure()?.getName() ?? "No figure currently",
        authDronesIds: serverRef.getMap().getAllDrones().map((drone) => {
            return {
                id: drone.getId(),
                isAlive: serverRef.isDroneAlive(drone),
                targetSquare: drone.getTargetSquare().getHash(),
            }
        }),
    }
}

app.get("/", (req, res) => {
    try {
        const serverInfo = getServerInfo();
        res.status(200).header("Content-Type", "application/json").send(JSON.stringify(serverInfo));    
    } catch (err) {
        console.error(`ERROR: Trying to get server info: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/home", (req, res) => {
    try {
        const serverInfo = getServerInfo();
        res.status(200).header("Content-Type", "application/json").send(JSON.stringify(serverInfo));
    } catch (err) {
        console.error(`ERROR: Trying to get server info: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
});


    app.post("/register", async (req, res) => {
    try {
        if (serverRef == null) {
            console.error("ERROR: Trying to register drone but server is null");
            res.status(500).json({ error: "Internal server error" });
        }

        const droneId: number = parseInt(req.body.id);
        const password: string = req.body.password;
        const tempToken: string = req.body.token;
        const registrationTimeStamp: number = parseInt(req.body.timestamp);

        const droneObj = new DronEntity(droneId);

        // validate password
        // validate token
        if (! await RegistryTable.dronIdMatchesWithToken(droneId, password)) {
            throw new Error(`ERROR: Token don't match with Drone id: ${droneId} and token: ${password}.`);
        }

       // validate timestamp
        if (Date.now() - registrationTimeStamp > REGISTRATION_TIMEOUT) {
            throw new Error("ERROR: Registration timeout expired");
        }

        // validate token
        // TODO: validate token
        const generatedTimeStamp: string = await serverRef.generateToken(droneObj, registrationTimeStamp);
        if (tempToken != generatedTimeStamp) {
            throw new Error(`ERROR: Token don't match with Drone id: ${droneId} and token: ${tempToken}.`);
        }

        // valida si el dron ya está en el mapa
        if (serverRef.getMap().isDroneInMap(droneObj)) {
            throw new AlreadyInMap('ERROR: Drone already in map. ');
        }

        // valida si hay hueco en la base de datos
        if (serverRef.getMap().getAllDrones().length >= ServerSettings.MAX_DRONES_ACCEPTED) {
            throw new Error('ERROR: No more drones allowed. map is full of drones. ');
        }

        let targetSquare: SquareEntity = null;
        // ver si hay hueco y mapear to figure
        if (await MapFiguraDronTable.mapNewDrone(droneObj)) {
            console.log(`New drone added to database: ${droneObj.toString()}`);
            const targetSquare = await MapFiguraDronTableImplementation.getSquareFromDrone(droneObj);
            droneObj.setTarget(targetSquare);
        }
        else {
            console.error("ERROR: Drone not mapped. DroneId: ", droneObj.toString());
            await MapFiguraDronTable.forceMapNewDrone(droneObj, new SquareEntity(1, 1));
            droneObj.setTarget(new SquareEntity(1, 1));
            console.log(`New drone added to database: ${droneObj.toString()} -> (1, 1)`);
        }

        // add to map (1, 1)
        const firstSquare = new SquareEntity(1, 1);
        serverRef.getMap().addDrone(droneObj, firstSquare);
        console.log("New drone added. ");
        console.log(serverRef.getMap().toString());
        console.log("Mapa mostrado. ");
        serverRef.updateNewDroneTimeStamp(droneObj);

        // kafka publish
        await BrokerServices.publishTargetPosition(droneObj, targetSquare);


        await LoggerSettings.addNewLog({
            dataTime: new Date().toISOString(),
            ipAddr: req.ip ?? "N/D",
            action: "http Auth OK",
            description: `Drone ${droneId} registered successfully. Drone ${droneId} is now in the map.`,
        });

        res.status(200).send(JSON.stringify({
            ok: true,
            message: `Successful authentication. Drone ${droneId} registered`,
        }));


    } catch (err) {
        await LoggerSettings.addNewLog({
            dataTime: new Date().toISOString(),
            ipAddr: req.ip ?? "N/D",
            action: "BAD Auth",
            description: err.message,
        });

        console.error(`ERROR: Trying to get server info: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.delete("/remove", (req, res) => {
    try {
        if (serverRef == null) {
            console.error("ERROR: Trying to remove drone but server is null");
            res.status(500).json({ error: "Internal server error" });
        }

        const droneId: number = parseInt(req.body.id);
        const droneObj = new DronEntity(droneId);
        serverRef?.getMap().removeDrone(droneObj);

        res.status(200).send(JSON.stringify({
            ok: true,
            message: `Drone ${droneId} removed`,
        }));
    } catch (err) {
        console.error(`ERROR: Trying to get server info: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
});




export async function start(server: ServerEntity) {
    try {
        serverRef = server;
        app.listen(ServerSettings.HTTP_PORT, () => {
            console.log(`HTTP server listening on port ${ServerSettings.HTTP_PORT}`);
        });
    } catch (err) {
        console.error(`ERROR: Trying to start HTTP server: ${err}`);
    }
}