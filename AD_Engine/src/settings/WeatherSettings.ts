import dotenv from "dotenv";
import fs from "fs";


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


let auxCityOpenWeatherPath: string = process.env.CITY_OPEN_WEATHER_PATH;
if (auxCityOpenWeatherPath == undefined) {
    throw new Error("No city open weather path found");
}
export const CITY_OPEN_WEATHER_PATH: string = auxCityOpenWeatherPath

export function GET_CITY(): string {
    let city: string = fs.readFileSync(CITY_OPEN_WEATHER_PATH, 'utf8');
    if (city == undefined) {
        throw new Error("No city found");
    }

    return city;
}


let auxApiKeyOpenWeather: string = process.env.API_TOKEN_OPEN_WEATHER;
if (auxApiKeyOpenWeather == undefined) {
    throw new Error("No api key open weather found");
}
export const API_TOKEN_OPEN_WEATHER: string = auxApiKeyOpenWeather;



