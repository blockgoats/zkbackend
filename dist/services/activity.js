import { db } from '../database/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ethers } from 'ethers';
function ensureDate(input) {
    if (input instanceof Date)
        return input;
    if (typeof input === 'number' || typeof input === 'string') {
        const date = new Date(input);
        return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
}
function testEnsureDate() {
    const testInputs = [
        new Date(),
        1633036800000, // number representing a timestamp
        '2021-10-01T00:00:00Z', // ISO string
    ];
    testInputs.forEach(input => {
        const result = ensureDate(input);
        console.log(`Input: ${input}, Output: ${result}`);
    });
}
export class ActivityService {
    static async logActivity(data) {
        try {
            const id = `act_${ethers.hexlify(ethers.randomBytes(16))}`;
            await db.execute({
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
                    data.ipAddress ?? null,
                    data.userAgent ?? null
                ]
            });
            logger.info('Activity logged', {
                userId: data.userId,
                type: data.type,
                status: data.status
            });
        }
        catch (error) {
            logger.error('Failed to log activity', { error });
            throw new AppError('Failed to log activity', 500, 'ACTIVITY_LOG_FAILED');
        }
    }
    static async getActivityLogs(userId, options = {}) {
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
            const result = await db.execute({ sql, args });
            return result.rows.map(row => ({
                id: String(row.id ?? ''),
                userId: String(row.user_id ?? ''),
                type: String(row.type ?? ''),
                status: String(row.status ?? ''),
                createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
                metadata: row.metadata ? JSON.parse(String(row.metadata)) : {},
                ipAddress: row.ip_address ? String(row.ip_address) : undefined,
                userAgent: row.user_agent ? String(row.user_agent) : undefined
            }));
        }
        catch (error) {
            logger.error('Failed to get activity logs', { error });
            throw new AppError('Failed to get activity logs', 500, 'ACTIVITY_FETCH_FAILED');
        }
    }
}
