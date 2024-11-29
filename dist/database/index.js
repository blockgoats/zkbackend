import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
const db = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN
});
export async function initializeDatabase() {
    try {
        // Read and execute migrations
        const migrationPath = join(process.cwd(), 'src/database/migrations');
        const migrationFiles = ['001_initial_schema.sql'];
        for (const file of migrationFiles) {
            const sql = readFileSync(join(migrationPath, file), 'utf-8');
            await db.execute(sql);
        }
        // Verify database connection and schema
        await db.execute('SELECT 1');
        logger.info('Database initialized successfully');
    }
    catch (error) {
        logger.error('Failed to initialize database', { error });
        throw error;
    }
}
export { db };
