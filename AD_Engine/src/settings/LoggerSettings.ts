import dotenv from "dotenv";

import fs from "fs";
dotenv.config();

const auxLoggerPath: string = process.env.LOGGER_PATH;
if (auxLoggerPath == null) {
    throw new Error("LOGGER_PATH is not defined. Error reading from ENV. ");
}
export const LOGGER_PATH: string = auxLoggerPath;

export interface LoggerLineFormat {
    dataTime: string,
    ipAddr: string,
    action: string,
    description: string
}

/**
 * Add a new log to the logger file
 * export interface LoggerLineFormat {
 *     dataTime: string,
 *     ipAddr: string,
 *     action: string,
 *     description: string
 * }
 * @param line
 */
export async function addNewLog(line: LoggerLineFormat): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
        fs.appendFile(LOGGER_PATH, `${JSON.stringify(line)}\n`, 'utf8', (err) => {
            if (err) {
                resolve();
                // reject(err); no quiero generar throws
            } else {
                resolve();
            }
        });
    });
}