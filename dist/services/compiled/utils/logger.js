"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta || '');
    },
    error: (message, meta) => {
        console.error(`[ERROR] ${message}`, meta || '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta || '');
    },
    debug: (message, meta) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, meta || '');
        }
    }
};
export {};
