module.exports = {
  apps: [{
    name: 'seq1-ui',
    script: './start_wrapper.sh',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 5000,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SEQ1_API_URL: 'http://127.0.0.1:5000',
      SEQ1_API_KEY: 'canonical_key_2025',
      NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: '903398',
      NEXT_PUBLIC_BUILD_TIME: '2025-06-30T15:07:00Z'
    },
    error_file: '/var/log/pm2/seq1-ui-error.log',
    out_file: '/var/log/pm2/seq1-ui-out.log',
    log_file: '/var/log/pm2/seq1-ui-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000
  }]
}
