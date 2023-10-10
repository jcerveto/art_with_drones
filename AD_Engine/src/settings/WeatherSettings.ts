import dotenv from "dotenv";

dotenv.config();

let auxWeatherPort: number;
try {
    auxWeatherPort = Number(process.env.WEATHER_PORT) ?? 5000;
}
catch (err) {
    console.error(`ERROR: Trying to get weather port: ${err}`);
    auxWeatherPort = 5000;
}
export const WEATHER_PORT: number = auxWeatherPort;

export const WEATHER_HOST: string = process.env.WEATHER_HOST ?? '0.0.0.0';


let auxWeatherTimeout: number;
try {
    auxWeatherTimeout = Number(process.env.WEATHER_TIMEOUT) ?? 30000;
}
catch (err) {
    console.error(`ERROR: Trying to get weather timeout: ${err}`);
    auxWeatherTimeout = 30000;
}
export const WEATHER_TIMEOUT: number = auxWeatherTimeout; // ms
