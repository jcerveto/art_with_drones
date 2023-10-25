import { ServerEntity } from './model/ServerEntity';
import { sleep } from './implementation/TimeUtils';

// Example usage
if (process.argv.length != 3) {
    console.log('Usage: node server.ts <port>');
    process.exit(1);
}


const main = async () => {
    try {
        const port = parseInt(process.argv[2]);
        const host = '0.0.0.0';
        const server = await new ServerEntity(port, host);

        await server.start();
        do {
            await server.loadFigures();
            await server.startShow();
            await sleep(10_000);
        } while (true);
        //server.startFigure()
        //    .catch((err) => console.error(err));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

}

main()