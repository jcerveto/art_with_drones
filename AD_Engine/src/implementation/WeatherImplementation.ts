import * as net from "net";

import * as WeatherSettings from '../settings/WeatherSettings';
import {appendLineToFile} from "./MapFiguraDronTableImplementation";
import {DEBUG_FILE} from "../settings/LoggerSettings";


export const MINIMUM_TEMPERATURE : number = 0;

export function isWeatherValid(temperature: number): boolean {
    return temperature >= MINIMUM_TEMPERATURE;
}

export async function getCurrentTemperature(): Promise<number> {
    return await new Promise(async (resolve, reject): Promise<number> => {
        const GET_URL = `http://api.openweathermap.org/data/2.5/weather?q=${WeatherSettings.GET_CITY()}&appid=${WeatherSettings.API_TOKEN_OPEN_WEATHER}&units=metric`;
        const response = await fetch(GET_URL);
        const data = await response.json();

        await appendLineToFile(DEBUG_FILE, "OpenWeatherQuery -> URL=" + GET_URL +'->' + JSON.stringify(data));
        if (!response.ok) {
            return -1;
        }


        const temperature: number = parseInt(data["main"]["temp"]);
        if (isNaN(temperature)) {
            throw new Error("Temperature is NaN");
        }
        resolve(temperature);
        return temperature;
    });

}