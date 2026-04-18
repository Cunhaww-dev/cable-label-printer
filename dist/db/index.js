import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to connect to MySQL');
}
const poolConnection = mysql.createPool(databaseUrl);
export const db = drizzle({ client: poolConnection, schema, mode: 'default' });
