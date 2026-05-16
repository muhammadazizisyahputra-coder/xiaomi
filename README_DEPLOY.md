# Deployment guide for AI Notes backend

This document describes how to deploy the Node.js backend and MySQL database on a Linux/CentOS server, and how to keep the service running using PM2.

## 1. Server prerequisites
- A Linux server (CentOS 7/8 recommended). 2GB+ RAM recommended for small apps.
- A public IP or domain name pointing to the server.
- SSH access.

## 2. Install system packages

1. Update and install common packages

```bash
sudo yum update -y
sudo yum install -y git curl wget unzip
```

2. Install Node.js (LTS) via NodeSource

```bash
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

3. Install MySQL (MariaDB) server

```bash
sudo yum install -y mariadb-server
sudo systemctl enable --now mariadb
```

4. Secure MySQL

```bash
sudo mysql_secure_installation
# follow prompts (set root password, remove anonymous users, disable remote root login, remove test DB)
```

## 3. Create database and user

Login to MySQL and create database/user:

```bash
mysql -u root -p
CREATE DATABASE ai_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_notes_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON ai_notes.* TO 'ai_notes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4. Deploy application code

1. Clone repo

```bash
cd /var/www
sudo git clone https://github.com/<your-org-or-username>/xiaomi.git
cd xiaomi
sudo git checkout feature/ai-notes-app
```

2. Install server dependencies

```bash
cd server
npm install --production
```

3. Create environment file

Create `server/.env` and set the environment variables:

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ai_notes
DB_USER=ai_notes_user
DB_PASS=strong_password_here
PORT=8080
JWT_SECRET=replace_with_strong_random_string
MIMO_API_URL=https://api.mimo.example/v1/parse
MIMO_API_KEY=your_mimo_api_key_here
TASK_POLL_INTERVAL=3000
MOCK_AI=false
```

- Note: set `MOCK_AI=true` only for development/testing. For production, keep it false.

4. Initialize database schema

If you want to use the provided SQL migration:

```bash
mysql -u ai_notes_user -p ai_notes < server/migrations/init.sql
```

Alternatively use sequelize migrations if you add them.

## 5. Start with PM2 (process manager)

1. Install PM2 globally

```bash
sudo npm install -g pm2
```

2. Start the server with PM2

```bash
cd /var/www/xiaomi/server
pm install
pm run start    # or: pm2 start index.js --name ai-notes
pm2 start index.js --name ai-notes --env production
```

3. Save the PM2 process list and enable startup on boot

```bash
pm2 save
pm2 startup systemd
# Follow the printed command from pm2 startup and run it with sudo
```

4. View logs

```bash
pm2 logs ai-notes
pm2 monit
```

## 6. Reverse proxy and HTTPS (optional but recommended)

Use Nginx as a reverse proxy and to terminate TLS.

1. Install Nginx

```bash
sudo yum install -y epel-release
sudo yum install -y nginx
sudo systemctl enable --now nginx
```

2. Create an Nginx config for your domain

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

3. Obtain TLS certificate via Certbot (Let's Encrypt)

```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

4. Restart Nginx

```bash
sudo systemctl restart nginx
```

## 7. Monitoring & Backup

- Use PM2 to monitor and restart crashed processes.
- Schedule MySQL backups (mysqldump) via cron and store offsite.

Example backup script `/usr/local/bin/backup_ai_notes.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%F-%H%M")
BACKUP_DIR=/var/backups/ai_notes
mkdir -p $BACKUP_DIR
mysqldump -u ai_notes_user -p'strong_password_here' ai_notes > $BACKUP_DIR/ai_notes-$TIMESTAMP.sql
# optionally upload to remote storage
```

Add cron entry (daily at 02:00):

```bash
0 2 * * * /usr/local/bin/backup_ai_notes.sh
```

## 8. Environment variables & secrets

- Never commit `.env` to git. Use server environment variables or secret management.
- Use strong JWT_SECRET and rotate keys when needed.

## 9. Troubleshooting

- Check PM2 logs: `pm2 logs ai-notes`.
- Check MySQL connectivity: `mysql -u ai_notes_user -p -h 127.0.0.1 -P 3306 ai_notes`.
- Ensure firewall (iptables/ firewalld) allows incoming ports if necessary (80/443)

## 10. Notes for small-scale deployments

- For small projects, a single VPS with PM2 + Nginx + MySQL is sufficient.
- For scale, separate database into managed DB (RDS), add Redis for queueing, and run workers as separate PM2 services or containers.


If you want, I can also generate a systemd unit file, a PM2 ecosystem.config.js, or a Dockerfile/docker-compose for containerized deployment. Tell me which you'd prefer and I will add it to the repo.