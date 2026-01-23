import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const queryClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle({ client: queryClient, schema });

export type Database = typeof db;
