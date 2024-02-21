export class ConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = "ConfigError";
    }
}
