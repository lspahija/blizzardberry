import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, {
  max: 10, // Limit max connections for Supabase's free tier
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 2, // Timeout for establishing connections
  prepare: false, // Disable prepared statements to avoid "prepared statement does not exist" errors
});

export default sql;
