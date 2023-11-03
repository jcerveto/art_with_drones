export class MaxConcurrentConnectionsExceed extends Error {
    constructor(message) {
        super(message);
        this.name = "MaxConcurrentConnectionsExceed";
    }
}