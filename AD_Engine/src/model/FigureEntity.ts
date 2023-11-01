import {SquareEntity} from "./SquareEntity";

export class FigureEntity {
    private figure: Map<string, number> = new Map<string, number>();
    private name: string;

    constructor(name: string) {
        this.name = name ?? "default";
        this.figure = new Map<string, number>();
    }

    getName() {
        return this.name;
    }
    addSquare(square: SquareEntity, droneId: number) {
        this.figure.set(square.getHash(), droneId);
    }

    removeSquare(square: SquareEntity) {
        this.figure.delete(square.getHash());
    }

    getFigure(): Map<string, number> {
        return this.figure;
    }

    toString(): string {
        let buffer: string = `Figure ${this.name} with ${this.figure.size} squares`;
        this.figure.forEach((value: number, key: string) => {
            buffer += `\n\t${key} => ${value}`;
        });

        return buffer;
    }


}