import dotenv from "dotenv";

dotenv.config();
const databaseName: string = process.env.DATABASE_PATH;

if (!databaseName) {
  throw new Error("DATABASE_PATH is not defined");
}

export const dbPath = databaseName;

const figuresPath: string = process.env.FIGURES_PATH;

if (!figuresPath) {
    throw new Error("FIGURES_PATH is not defined");
}

export const FIGURES_FILE_PATH = figuresPath;
