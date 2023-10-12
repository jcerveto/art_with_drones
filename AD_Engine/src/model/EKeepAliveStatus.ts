export enum EKeepAliveStatus {
    ALIVE,
    DEAD,
}

export function getEKeepAliveStatusToString(status: EKeepAliveStatus): string {
    switch (status) {
        case EKeepAliveStatus.ALIVE:
            return "alive";
        case EKeepAliveStatus.DEAD:
            return "dead";
        default:
            // Handle unexpected enum values
            return "Invalid Status";
    }
}