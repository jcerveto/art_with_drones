import { SquareEntity } from "./SquareEntity";
import { createDrone, deleteDrone } from "../queries/crud-current";


export class MapEntity {
    private __size: number = 0;

    private __map: Map<string, SquareEntity> = new Map<string, SquareEntity>();

    constructor(size: number) {
        if (size < 0) {
            throw new Error('Map size cannot be negative');
        }
        if (size > 20) {
            throw new Error('Map size cannot be greater than 20');
        }
        this.__size = size;

        for (let row = 1; row <= size; row++) {
            for (let column = 1; column <= size; column++) {
                const square = new SquareEntity(row, column);
                this.__map.set(square.getHash(), square);
            }
        }
    }

    public async removeDrone(square: SquareEntity, id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                deleteDrone(square, id)
                    .then((result: boolean) => {
                        if (result) {
                            resolve();
                        }
                        else {
                            reject();
                        }
                    })
                    .catch((err) => {
                        console.error('Error deleting data:', err.message);
                        reject();
                    }); 
            } catch (err) {
                console.error('Error removing drone:', err);
                reject();
            }
        });
    }

    public async addDrone(square: SquareEntity, id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                createDrone(square, id)
                    .then((result: boolean) => {
                        if (result) {
                            resolve();
                        }
                        else {
                            reject();
                        }
                    })
                    .catch((err) => {
                        console.error('Error inserting data:', err.message);
                        reject();
                    }); 
            } catch (err) {
                console.error('Error adding drone:', err);
                reject();
            }
        });
    }
    

    public getSize(): number {
        return this.__size;
    }

    public getMapObject(): Map<string, SquareEntity> {
        return this.__map;
    }

    public toString(): string {
        let buffer = '  ';

        for (let i = 1; i <= this.__size; i++) {
            buffer += `${i}`.padStart(2, ' ');
        }
        buffer += '\n';
    
        for (let row = 1; row <= this.__size; row++) {
            buffer += `${row}`.padStart(2, ' ');
    
            for (let column = 1; column <= this.__size; column++) {
                const square = this.__map.get(`${row}-${column}`);
                buffer += square.toString().padStart(2, ' ');
            }
            buffer += '\n';
        }
    
        return buffer;
    }
    


}