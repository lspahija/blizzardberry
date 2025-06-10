import postgres from 'postgres';

const connectionString = process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, {
  max: 10, // Limit max connections for Supabase's free tier
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 2, // Timeout for establishing connections
});

export default sql;
