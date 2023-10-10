export enum EStatus {
    GOOD,
    BAD,
    UNKNOWN,
}

export function getEStatusToString(status: EStatus): string {
    switch (status) {
        case EStatus.GOOD:
            return "good";
        case EStatus.BAD:
            return "bad";
        case EStatus.UNKNOWN:
            return "unknown";
        default:
            // Handle unexpected enum values
            return "Invalid Status";
    }
}
