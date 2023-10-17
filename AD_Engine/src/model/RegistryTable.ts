import {RegistryTableImplementation} from "../implementation/RegistryTableImplementation";

export class RegistryTable {
    public static async dronIdMatchesWithToken(dronId: number, token: string): Promise<boolean> {
        try {
            return await RegistryTableImplementation.dronIdMatchesWithToken(dronId, token);
        } catch (err) {
            console.error(err.message);
            return false;
        }
    }
}