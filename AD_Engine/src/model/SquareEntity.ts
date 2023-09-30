import { DronEntity } from "./DronEntity";


export class SquareEntity {
    public static readonly MAX_SIZE: number = 20;
    public static readonly MIN_SIZE: number = 1;
    private __row: number = 1;
    private __column: number = 1;
    private __dron: DronEntity = null;


    constructor(row: number, column: number, dron: DronEntity | null = null) {
        if (row < SquareEntity.MIN_SIZE || row > SquareEntity.MAX_SIZE) {
            throw new Error('Invalid row number');
        }
        if (column < SquareEntity.MIN_SIZE || column > SquareEntity.MAX_SIZE) {
            throw new Error('Invalid column number');
        }
        this.__dron = dron;
        this.__row = row;
        this.__column = column;
    }

    public getDron(): DronEntity {
        return this.__dron;
    }

    public setDron(dron: DronEntity) {
        this.__dron = dron;
    }

    pub

    public isEmpty(): boolean {
        return this.__dron === null;
    }

    public toString(): string {
        return this.__dron === null ? '■' : this.__dron.toString();
    }

    public getHash(): string {
        return `${this.__row}-${this.__column}`;
    }

    public equals(other: SquareEntity): boolean {
        return this.__row === other.__row && this.__column === other.__column;
    }

    public static fromString(str: string): SquareEntity {
        try {
            const parts = str.split('-');
            return new SquareEntity(parseInt(parts[0]), parseInt(parts[1]));
        }
        catch (err) {
            throw new Error('Invalid square format. string: ' + str);
        }
    }   
    

}