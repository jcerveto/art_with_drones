import dotenv from "dotenv";

dotenv.config();

let auxWeatherPort: number = parseInt(process.env.WEATHER_PORT);
if (auxWeatherPort == undefined || isNaN(auxWeatherPort)) {
    throw new Error("No weather port found");
}
export const WEATHER_PORT: number = auxWeatherPort;

let auxWeatherHost: string = process.env.WEATHER_HOST;
if (auxWeatherHost == undefined) {
    throw new Error("No weather host found");
}
export const WEATHER_HOST: string = auxWeatherHost;


let auxWeatherTimeout: number = parseInt(process.env.WEATHER_TIMEOUT);
if (auxWeatherTimeout == undefined || isNaN(auxWeatherTimeout)) {
    throw new Error("No weather timeout found");
}
export const WEATHER_TIMEOUT: number = auxWeatherTimeout; // ms

let auxValidateWeather = process.env.WEATHER_VALIDATE;
if (auxValidateWeather == undefined) {
    throw new Error("No validate weather found");
} else if (auxValidateWeather != 'yes' && auxValidateWeather != 'no') {
    throw new Error("Validate weather must be yes or no. Not: " + auxValidateWeather);
}

export const VALIDATE_WEATHER: boolean = auxValidateWeather == 'yes';


