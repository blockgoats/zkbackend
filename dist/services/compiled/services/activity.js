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
exports.ActivityService = void 0;
const index_js_1 = require("../database/index.js");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
const ethers_1 = require("ethers");
function ensureDate(input) {
    if (input instanceof Date)
        return input;
    if (typeof input === 'number' || typeof input === 'string') {
        return new Date(input);
    }
    if (typeof input === 'bigint') {
        return new Date(Number(input));
    }
    if (input instanceof ArrayBuffer) {
        const dataView = new DataView(input);
        return new Date(dataView.getFloat64(0, true));
    }
    return undefined;
}
function testEnsureDate() {
    const testInputs = [
        new Date(),
        1633036800000, // number representing a timestamp
        '2021-10-01T00:00:00Z', // ISO string
        BigInt(1633036800000), // bigint representing a timestamp
        new ArrayBuffer(8) // empty ArrayBuffer
    ];
    const dataView = new DataView(testInputs[4]);
    dataView.setFloat64(0, 1633036800000, true); // setting a timestamp
    testInputs.forEach(input => {
        const result = ensureDate(input);
        console.log(`Input: ${input}, Output: ${result}`);
    });
}
// Run the test function
testEnsureDate();
class ActivityService {
    static logActivity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const id = `act_${ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(16))}`;
                yield index_js_1.db.execute({
                    sql: `
          INSERT INTO activity_logs (
            id, user_id, type, status, metadata, ip_address, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
                    args: [
                        id,
                        data.userId,
                        data.type,
                        data.status,
                        data.metadata ? JSON.stringify(data.metadata) : null,
                        (_a = data.ipAddress) !== null && _a !== void 0 ? _a : null,
                        (_b = data.userAgent) !== null && _b !== void 0 ? _b : null
                    ]
                });
                logger_js_1.logger.info('Activity logged', {
                    userId: data.userId,
                    type: data.type,
                    status: data.status
                });
            }
            catch (error) {
                logger_js_1.logger.error('Failed to log activity', { error });
                throw new errors_js_1.AppError('Failed to log activity', 500, 'ACTIVITY_LOG_FAILED');
            }
        });
    }
    static getActivityLogs(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
            try {
                const { limit = 50, offset = 0, type, startDate, endDate } = options;
                const startDateDate = ensureDate(startDate);
                const endDateDate = ensureDate(endDate);
                let sql = 'SELECT * FROM activity_logs WHERE user_id = ?';
                const args = [userId];
                if (type) {
                    sql += ' AND type = ?';
                    args.push(type);
                }
                if (startDateDate) {
                    sql += ' AND created_at >= ?';
                    args.push(startDateDate.toISOString());
                }
                if (endDateDate) {
                    sql += ' AND created_at <= ?';
                    args.push(endDateDate.toISOString());
                }
                sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
                args.push(limit, offset);
                const result = yield index_js_1.db.execute({ sql, args });
                return result.rows.map(row => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    return ({
                        id: String((_a = row.id) !== null && _a !== void 0 ? _a : ''),
                        userId: String((_b = row.user_id) !== null && _b !== void 0 ? _b : ''),
                        type: String((_c = row.type) !== null && _c !== void 0 ? _c : ''),
                        status: String((_d = row.status) !== null && _d !== void 0 ? _d : ''),
                        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
                        metadata: (_e = row.metadata) !== null && _e !== void 0 ? _e : {},
                        ipAddress: String((_f = row.ip_address) !== null && _f !== void 0 ? _f : ''),
                        userAgent: String((_g = row.user_agent) !== null && _g !== void 0 ? _g : '')
                    });
                });
            }
            catch (error) {
                logger_js_1.logger.error('Failed to get activity logs', { error });
                throw new errors_js_1.AppError('Failed to get activity logs', 500, 'ACTIVITY_FETCH_FAILED');
            }
        });
    }
}
exports.ActivityService = ActivityService;
export {};
