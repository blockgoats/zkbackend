class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', metadata) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.metadata = metadata;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            status: 'error',
            code: this.code,
            message: this.message,
            ...(this.metadata && { metadata: this.metadata })
        };
    }
}
export { AppError };
