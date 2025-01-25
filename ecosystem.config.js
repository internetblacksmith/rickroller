module.exports = {
  apps: [{
    name: 'rickroller',
    script: './bin/www',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Restart settings
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory limit restart
    max_memory_restart: '500M',
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};