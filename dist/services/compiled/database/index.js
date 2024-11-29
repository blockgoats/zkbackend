"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
const client_1 = require("@libsql/client");
const fs_1 = require("fs");
const path_1 = require("path");
const logger_js_1 = require("../utils/logger.js");
const db = (0, client_1.createClient)({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN
});
exports.db = db;
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read and execute migrations
            const migrationPath = (0, path_1.join)(process.cwd(), 'src/database/migrations');
            const migrationFiles = ['001_initial_schema.sql'];
            for (const file of migrationFiles) {
                const sql = (0, fs_1.readFileSync)((0, path_1.join)(migrationPath, file), 'utf-8');
                yield db.execute(sql);
            }
            // Verify database connection and schema
            yield db.execute('SELECT 1');
            logger_js_1.logger.info('Database initialized successfully');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to initialize database', { error });
            throw error;
        }
    });
}
export {};
