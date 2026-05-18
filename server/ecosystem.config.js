// PM2 process config — run with: pm2 start ecosystem.config.js
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'tickerdle-server',
      script: 'src/index.js',

      // Restart automatically if the process crashes
      autorestart: true,

      // Watch is off in production — use a redeploy script instead
      watch: false,

      // Restart if memory exceeds 200 MB (safety net for memory leak)
      max_memory_restart: '200M',

      // Keep last 10 log files, rotate at 10 MB
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/error.log',
      out_file:   'logs/out.log',
      merge_logs: true,

      env_production: {
        NODE_ENV:    'production',
        PORT:        3001,
        CORS_ORIGIN: 'https://tickerdle.org',
      },
    },
  ],
};
