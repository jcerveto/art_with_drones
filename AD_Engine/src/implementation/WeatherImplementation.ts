import * as net from "net";

import * as WeatherSettings from '../settings/WeatherSettings';


export const MINIMUM_TEMPERATURE : number = 0;

export function isWeatherValid(temperature: number): boolean {
    return temperature >= MINIMUM_TEMPERATURE;
}

export async function getCurrentTemperature(): Promise<number> {
    return new Promise((resolve, reject) => {
        const city = "alacant";
        const client = new net.Socket();

        client.connect(WeatherSettings.WEATHER_PORT, WeatherSettings.WEATHER_HOST, () => {
            console.log(`Connected to weather server.`);
            client.write(city);
        });

        client.on('data', (data) => {
            try {
                const response = data.toString("utf-8");
                const responseJson = JSON.parse(response);
                const temperature: number = parseInt(responseJson?.temperature);
                if (! isNaN(temperature)) {
                    client.end();
                    resolve(temperature);
                } else {
                    client.end();
                    reject(new Error(`Invalid temperature: ${temperature}`));
                }
            } catch (err) {
                console.error(`ERROR: Trying to get current temperature: ${err}`);
                reject(-1);
            }
        });

        client.on('close', () => {
            console.log('Connection closed');
        });

        client.on('error', (err) => {
            console.error(`ERROR: Trying to get current temperature: ${err}`);
            reject(-1);
        });
    });




}