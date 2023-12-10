import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ServerEntity } from "../model/ServerEntity";
import * as ServerSettings from "../settings/ServerSettings";
import {DronEntity} from "../model/DronEntity";

let serverRef: ServerEntity = null;

interface AuthDrone {
    id: number,
    isAlive: boolean,
}

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


app.post("/register", (req, res) => {
    try {
        const response = {}
        res.status(200).send(JSON.stringify(response));
    } catch (err) {
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

        const droneId = req.body.id;
        const droneObj = new DronEntity(droneId);
        serverRef.getMap().removeDrone(droneObj);

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