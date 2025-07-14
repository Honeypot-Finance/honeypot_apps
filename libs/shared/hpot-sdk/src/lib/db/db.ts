// libs/shared/db/src/pg.ts
import postgres from 'postgres';

// Optimized postgres configuration for serverless environments
export const pg = postgres(process.env['DB']!, {
  // Reduce connection pool size for serverless functions
  max: process.env['NODE_ENV'] === 'development' ? 5 : 10,
  // Increase idle timeout for serverless cold starts
  idle_timeout: 60,
  // Reduce connect timeout to fail fast
  connect_timeout: 10,
  // Connection lifetime to prevent stale connections
  max_lifetime: 300, // 5 minutes
  ssl: true,
  // Enable proper connection cleanup
  prepare: false,
  // Connection settings
  connection: {
    application_name: 'honey_frontend',
  },
  // Add proper error handling
  onnotice: (notice) => {
    if (process.env['DEBUG'] === 'true') {
      console.warn('PostgreSQL notice:', notice);
    }
  },
  // Debug configuration
  debug:
    process.env['DEBUG'] === 'true'
      ? function (connection, query, params) {
          const newQuery = query.replace(/\$(\d+)/g, (_, p1) => {
            const replace = params[p1 - 1];
            return typeof replace === 'string' ? `'${replace}'` : replace;
          });
          console.log(newQuery);
        }
      : false,
});

// Utility function for safe database operations with proper error handling
export const withDatabase = async <T>(
  operation: (db: typeof pg) => Promise<T>
): Promise<T> => {
  try {
    const result = await operation(pg);
    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};

// Graceful shutdown handler for serverless environments
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing postgres connections...');
    await pg.end();
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing postgres connections...');
    await pg.end();
  });
}
