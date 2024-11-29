"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
var index_js_1 = require("../database/index.js");
var errors_js_1 = require("../utils/errors.js");
var logger_js_1 = require("../utils/logger.js");
var ethers_1 = require("ethers");
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
        return new Date(new DataView(input).getFloat64(0, true));
    }
    return undefined;
}
function testEnsureDate() {
    var testInputs = [
        new Date(),
        1633036800000, // number representing a timestamp
        '2021-10-01T00:00:00Z', // ISO string
        BigInt(1633036800000), // bigint representing a timestamp
        new ArrayBuffer(8) // empty ArrayBuffer
    ];
    var dataView = new DataView(testInputs[4]);
    dataView.setFloat64(0, 1633036800000, true); // setting a timestamp
    testInputs.forEach(function (input) {
        var result = ensureDate(input);
        console.log("Input: ".concat(input, ", Output: ").concat(result));
    });
}
// Run the test function
testEnsureDate();
var ActivityService = /** @class */ (function () {
    function ActivityService() {
    }
    ActivityService.logActivity = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = "act_".concat(ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(16)));
                        return [4 /*yield*/, index_js_1.db.execute({
                                sql: "\n          INSERT INTO activity_logs (\n            id, user_id, type, status, metadata, ip_address, user_agent\n          ) VALUES (?, ?, ?, ?, ?, ?, ?)\n        ",
                                args: [
                                    id,
                                    data.userId,
                                    data.type,
                                    data.status,
                                    data.metadata ? JSON.stringify(data.metadata) : null,
                                    (_a = data.ipAddress) !== null && _a !== void 0 ? _a : null,
                                    (_b = data.userAgent) !== null && _b !== void 0 ? _b : null
                                ]
                            })];
                    case 1:
                        _c.sent();
                        logger_js_1.logger.info('Activity logged', {
                            userId: data.userId,
                            type: data.type,
                            status: data.status
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        logger_js_1.logger.error('Failed to log activity', { error: error_1 });
                        throw new errors_js_1.AppError('Failed to log activity', 500, 'ACTIVITY_LOG_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ActivityService.getActivityLogs = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var _a, limit, _b, offset, type, startDate, endDate, startDateDate, endDateDate, sql, args, result, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b, type = options.type, startDate = options.startDate, endDate = options.endDate;
                        startDateDate = ensureDate(startDate);
                        endDateDate = ensureDate(endDate);
                        sql = 'SELECT * FROM activity_logs WHERE user_id = ?';
                        args = [userId];
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
                        return [4 /*yield*/, index_js_1.db.execute({ sql: sql, args: args })];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result.rows.map(function (row) {
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
                            })];
                    case 2:
                        error_2 = _c.sent();
                        logger_js_1.logger.error('Failed to get activity logs', { error: error_2 });
                        throw new errors_js_1.AppError('Failed to get activity logs', 500, 'ACTIVITY_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityService;
}());
exports.ActivityService = ActivityService;
