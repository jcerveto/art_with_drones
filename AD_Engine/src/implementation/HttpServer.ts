import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ServerEntity } from "../model/ServerEntity";
import * as ServerSettings from "../settings/ServerSettings";

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
        map: serverRef.getMap().getStatusArray()
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