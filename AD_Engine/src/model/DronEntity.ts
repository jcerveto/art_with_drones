import { EStatus } from "./EStatus"
import { SquareEntity } from "./SquareEntity";


export class DronEntity {
    private __id: number;
    private __status: EStatus = EStatus.BAD;
    private __target: SquareEntity | null = null;

    constructor(id: number, status: EStatus) {
        this.__id = id;
        this.__status = status;
    }

    public getStatus(): EStatus {
        return this.__status;
    }

    public setStatus(status: EStatus) {
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

    public getHash(): string {
        return this.__id?.toString();
    }

    public getTargetSquare(): SquareEntity {
        return new SquareEntity(15, 18);
    }

    public toString(): string {
        if (this.__status === EStatus.GOOD)
            return 'G';
        if (this.__status === EStatus.BAD)
            return 'R';
        if (this.__status === EStatus.UNKNOWN)
            return '■';
        return '■';
    }
}
