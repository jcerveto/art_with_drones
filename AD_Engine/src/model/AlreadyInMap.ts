export class AlreadyInMap extends Error {
    constructor(message) {
        super(message);
        this.name = "AlreadyInMap";
    }
}