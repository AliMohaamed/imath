// PM2 config. `current` is a symlink to the active release (see .github/workflows/deploy.yml).
// Fork mode, 1 instance, memory-capped so a leak can't starve edusuite/techworld on this VPS.
const ROOT = "/home/deploy/imath";

module.exports = {
  apps: [
    {
      name: "im-web",
      cwd: `${ROOT}/current`,
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        PORT: "3300",
        // Loopback only (Nginx is the public entry point). Must be "localhost", NOT "127.0.0.1": Next compares
        // middleware rewrites (Arabic pages at /, rewritten to /ar/...) against http://<HOSTNAME>:<PORT>; any other
        // name makes it proxy the rewrite as an external URL and every Arabic page loops with 307.
        // step4-nginx.sh points proxy_pass at whatever address "localhost" resolves to for Node (127.0.0.1 or ::1).
        HOSTNAME: "localhost",
        NODE_OPTIONS: "--max-old-space-size=320",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      out_file: `${ROOT}/logs/im-web.out.log`,
      error_file: `${ROOT}/logs/im-web.err.log`,
      merge_logs: true,
      time: true,
    },
  ],
};
