export class NacoError extends Error {
    type: string;
    constructor(message: string, type: string) {
        super(message);
        this.type = type;
    }
}

export class NacoNotFoundError extends NacoError {
    constructor(message: string) {
        super(message, 'NOT_FOUND');
    }
}

export class NacoServerError extends NacoError {
    constructor(message: string) {
        super(message, 'SERVER_ERROR');
    }
}
