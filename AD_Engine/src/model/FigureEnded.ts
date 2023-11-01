export class FigureEnded extends Error {
    constructor(message) {
        super(message);
        this.name = "FigureEnded";
    }
}