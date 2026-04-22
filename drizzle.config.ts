import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run Drizzle Kit');
}

const parsedDatabaseUrl = new URL(databaseUrl);

if (parsedDatabaseUrl.hostname === 'host') {
  throw new Error('DATABASE_URL is using the placeholder host. Replace it with your MySQL hostname.');
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: databaseUrl,
  },
});
