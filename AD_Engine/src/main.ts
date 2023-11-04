import { ServerEntity } from './model/ServerEntity';
import { sleep } from './implementation/TimeUtils';
import * as ServerSettings from './settings/ServerSettings';

// Example usage
if (process.argv.length != 2) {
    console.log('Usage: node server.ts');
    process.exit(1);
}


const main = async () => {
    try {
        /*
        const port = ServerSettings.MAIN_PORT;
        const host = ServerSettings.MAIN_HOST;
        if (port == undefined || host == undefined) {
            throw new Error("No main host or port found");
        }
        */
        const port = ServerSettings.MAIN_PORT;
        const host = '0.0.0.0'

        const server = await new ServerEntity(port, host);

        if (ServerSettings.RECOVER) {
            await server.recover();
        }
        await server.start();
        do {
            await server.loadFigures();
            await server.startShow();
            await sleep(10_000);
        } while (true);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

}

main()