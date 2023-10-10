import {RegistryTableImplementation} from "../implementation/RegistryTableImplementation";

export class RegistryTable {
    public static dronIdMatchesWithToken(dronId: number, token: string): boolean {
        try {
            return RegistryTableImplementation.dronIdMatchesWithToken(dronId, token);
        } catch (err) {
            console.error(err.message);
            return false;
        }
    }
}