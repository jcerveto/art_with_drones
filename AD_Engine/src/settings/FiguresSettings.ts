import dotenv from "dotenv";

dotenv.config();

export const FIGURES_PATH: string = process.env.FIGURES_PATH;
if (FIGURES_PATH == null || FIGURES_PATH == undefined) {
    throw new Error("FIGURES_PATH is not defined. Error reading from ENV. ");
}
