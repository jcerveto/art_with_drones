import dotenv from "dotenv";

dotenv.config();
const databaseName: string = process.env.DATABASE_NAME ?? 'AD_DronesBD/database.db';
const rootPath: string = process.env.ROOT_PATH ?? '../';
export const dbPath = rootPath + databaseName;
