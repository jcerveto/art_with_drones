import { SquareEntity } from "./SquareEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";


export class DronEntity {
    private __id: number;
    private __status: EKeepAliveStatus = EKeepAliveStatus.ALIVE;
    private __target: SquareEntity | null = null;

    constructor(id: number) {
        this.__id = id;
    }

    public getStatus(): EKeepAliveStatus {
        return this.__status;
    }

    public setStatus(status: EKeepAliveStatus) {
        this.__status = status;
    }

    public getTarget(): SquareEntity | null {
        return this.__target;
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
        return new SquareEntity(15, 18);
    }

    public toString(): string {
        return `[${this.__id}]`;
    }
}
