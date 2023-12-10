import { SquareEntity } from "./SquareEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";


export class DronEntity {
    private __id: number;
    private __status: EKeepAliveStatus = EKeepAliveStatus.ALIVE;
    private __target: SquareEntity | null = null;

    constructor(id: number) {
        if (id == null) {
            throw new Error('ERROR: Invalid id. Cannot be null or undefined.');
        }
        if (id < 0) {
            throw new Error('ERROR: Invalid id. Cannot be negative.');
        }
        if (isNaN(id)) {
            throw new Error('ERROR: Invalid id. Cannot be NaN.');
        }
        this.__id = id;
    }

    public getStatus(): EKeepAliveStatus {
        return this.__status;
    }

    public setStatus(status: EKeepAliveStatus) {
        this.__status = status;
    }


    public setTarget(target: SquareEntity) {
        this.__target = target;
    }

    public getId(): number {
        return this.__id;
    }

    public equals(other: DronEntity): boolean {
        return this.__id == other.__id;
    }

    public getHash(): string {
        return this.__id?.toString();
    }

    public getTargetSquare(): SquareEntity {
        return this.__target;
    }

    public toString(): string {
        return `[${this.__id}]`;
    }

    public copy(): DronEntity {
        const copy: DronEntity = new DronEntity(this.__id);
        copy.setStatus(this.__status);
        copy.setTarget(this.__target);
        return copy;
    }
}
