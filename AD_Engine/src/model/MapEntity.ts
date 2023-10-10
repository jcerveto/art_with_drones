import {SquareEntity} from "./SquareEntity";

export class MapEntity {
    public static SIZE: number = 20;

    private __map: Map<
        string,
        SquareEntity
    > = new Map<string, SquareEntity>();

    public getMapObject(): Map<string, SquareEntity> {
        return this.__map;
    }


    constructor() {
        for (let row = 1; row <= MapEntity.SIZE; row++) {
            for (let column = 1; column <= MapEntity.SIZE; column++) {
                const square = new SquareEntity(row, column);
                this.__map.set(square.getHash(), square);
            }
        }
    }



    public toString(): string {
        let buffer = '  ';

        for (let i = 1; i <= MapEntity.SIZE; i++) {
            buffer += `${i}`.padStart(2, ' ');
        }
        buffer += '\n';

        for (let row = 1; row <= MapEntity.SIZE; row++) {
            buffer += `${row}`.padStart(2, ' ');

            for (let column = 1; column <= MapEntity.SIZE; column++) {
                const square = this.__map.get(`${row}-${column}`);
                buffer += square.toString().padStart(2, ' ');
            }
            buffer += '\n';
        }

        return buffer;
    }

    public updateSquare(newSquare: SquareEntity): void {
        const key = newSquare.getHash();

        if (this.__map.has(key)) {
            this.__map.set(key, newSquare);
        } else {
            console.error(`Square with hash ${key} not found in the map.`);
        }
    }


    public toJson(): string {
        try {
            const jsonArray: Array<string> = [];

            this.__map.forEach((square: SquareEntity) => {
                jsonArray.push(square.toJson());
            });

            return JSON.stringify(jsonArray);
        } catch (err) {
            console.error("ERROR: Parsing Map toJson. Returning empty object. ", err);
            return JSON.stringify({});
        }

    }

}