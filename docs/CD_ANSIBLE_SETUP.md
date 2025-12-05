# CD Pipeline #2 - Ansible Deployment Setup

This guide covers setting up automated deployment to a production server using GitHub Actions and Ansible.

## Overview

The Ansible deployment pipeline:
- Triggers automatically on push to `main` branch
- Connects to production server via SSH
- Installs Node.js 20
- Deploys Next.js application
- Configures PM2 process manager (cluster mode, 2 instances)
- Sets up Nginx reverse proxy
- Provides health check verification

## Architecture

```
GitHub Actions → SSH → Production Server
                       ├── Node.js 20
                       ├── Application (/opt/library-website)
                       ├── PM2 (cluster mode)
                       └── Nginx (port 80 → 3000)
```

## Prerequisites

1. **Production Server** (Ubuntu 20.04/22.04 recommended)
   - Public IP address
   - SSH access configured
   - Sudo privileges for deployment user
   - Ports 80 (HTTP) and 22 (SSH) open

2. **GitHub Repository Secrets**
   - `SSH_PRIVATE_KEY`: Private SSH key for server access
   - `SERVER_IP`: Production server IP address
   - `SERVER_USER`: SSH username (defaults to 'ubuntu')

## Server Setup

### 1. Create Deployment User (if needed)

```bash
# On production server
sudo adduser ubuntu
sudo usermod -aG sudo ubuntu
```

### 2. Configure SSH Access

On your local machine:
```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"

# Copy public key to server
ssh-copy-id ubuntu@YOUR_SERVER_IP
```

Add private key to GitHub Secrets:
```bash
# Display private key
cat ~/.ssh/id_rsa
# Copy entire output including BEGIN/END lines
```

### 3. Test SSH Connection

```bash
ssh ubuntu@YOUR_SERVER_IP
# Should connect without password prompt
```

## GitHub Secrets Configuration

1. Go to repository **Settings** → **Secrets and variables** → **Actions**

2. Add the following secrets:

   **SSH_PRIVATE_KEY**
   ```
   -----BEGIN RSA PRIVATE KEY-----
   [Your private key content]
   -----END RSA PRIVATE KEY-----
   ```

   **SERVER_IP**
   ```
   123.456.789.012
   ```

   **SERVER_USER** (optional, defaults to 'ubuntu')
   ```
   ubuntu
   ```

## Ansible Playbook Structure

### Roles

1. **nodejs** - Installs Node.js 20
   - Adds NodeSource repository
   - Installs Node.js and npm
   - Verifies installation

2. **app** - Deploys application
   - Creates application directory (`/opt/library-website`)
   - Syncs code from GitHub Actions runner
   - Installs dependencies
   - Builds Next.js production bundle
   - Creates `.env` file

3. **pm2** - Process management
   - Installs PM2 globally
   - Configures cluster mode (2 instances)
   - Auto-restart on failure
   - Startup script for server reboot
   - Memory limit: 500MB per instance

4. **nginx** - Reverse proxy
   - Installs Nginx
   - Configures proxy to port 3000
   - Enables gzip compression
   - Sets up health check endpoint
   - Caches static assets

### Variables

Located in `ansible/group_vars/production.yml`:

```yaml
app_name: library-website
app_port: 3000
app_dir: /opt/library-website
node_env: production
node_version: 20
```

## Deployment Workflow

The `.github/workflows/cd-ansible.yml` workflow:

1. **Checkout** - Gets latest code
2. **Setup SSH** - Configures SSH key and known hosts
3. **Install Ansible** - Installs Ansible on runner
4. **Create Inventory** - Generates inventory file with server IP
5. **Test Connection** - Pings server with `ansible -m ping`
6. **Run Playbook** - Executes deployment playbook
7. **Verify** - Checks application health endpoint
8. **Summary** - Generates deployment report

## Testing Locally

You can test the Ansible playbook locally before pushing:

### 1. Install Ansible

**macOS:**
```bash
brew install ansible
```

**Ubuntu/Debian:**
```bash
sudo apt-add-repository ppa:ansible/ansible
sudo apt update
sudo apt install ansible
```

**Windows (WSL):**
```bash
sudo apt update
sudo apt install ansible
```

### 2. Update Inventory

Edit `ansible/inventory.ini` with your server IP:
```ini
[production]
production-server ansible_host=YOUR_SERVER_IP ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3
```

### 3. Run Playbook

```bash
# Test connection
ansible -i ansible/inventory.ini production -m ping

# Run playbook
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy.yml -v
```

## Deployment Process

### Automatic Deployment

Push to main branch triggers automatic deployment:
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

### Manual Deployment

Trigger via GitHub Actions UI:
1. Go to **Actions** tab
2. Select **CD - Ansible Deployment**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

## Post-Deployment Verification

### 1. Check Application

```bash
# Via browser
http://YOUR_SERVER_IP

# Via curl
curl http://YOUR_SERVER_IP
curl http://YOUR_SERVER_IP/api/health
```

### 2. Check PM2 Status

SSH into server:
```bash
ssh ubuntu@YOUR_SERVER_IP
pm2 list
pm2 logs library-website
pm2 monit
```

### 3. Check Nginx

```bash
sudo systemctl status nginx
sudo nginx -t
```

### 4. View Logs

```bash
# Application logs
pm2 logs library-website

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### SSH Connection Failed

```bash
# On runner, check SSH key format
cat ~/.ssh/id_rsa
# Should start with -----BEGIN RSA PRIVATE KEY-----

# Test connection manually
ssh -i ~/.ssh/id_rsa ubuntu@YOUR_SERVER_IP

# Check server SSH logs
sudo tail -f /var/log/auth.log
```

### Ansible Playbook Failed

```bash
# Run with increased verbosity
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy.yml -vvv

# Check specific role
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy.yml --tags nodejs
```

### PM2 Process Not Starting

```bash
# Check PM2 logs
pm2 logs library-website --err

# Restart application
pm2 restart library-website

# Check ecosystem config
cat /opt/library-website/ecosystem.config.js
```

### Nginx Configuration Error

```bash
# Test configuration
sudo nginx -t

# Check site configuration
cat /etc/nginx/sites-available/library-website

# Reload Nginx
sudo systemctl reload nginx
```

### Application Not Accessible

```bash
# Check if app is running
pm2 list

# Check port binding
netstat -tulpn | grep 3000

# Check Nginx is running
sudo systemctl status nginx

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
```

## Security Considerations

1. **SSH Key Management**
   - Use separate SSH keys for deployment
   - Rotate keys periodically
   - Never commit private keys to repository
   - Use GitHub Secrets for sensitive data

2. **Server Hardening**
   - Disable password authentication
   - Use SSH key authentication only
   - Configure firewall (ufw)
   - Keep system updated
   - Use fail2ban for brute-force protection

3. **Application Security**
   - Set NODE_ENV=production
   - Use environment variables for secrets
   - Configure rate limiting
   - Enable HTTPS (add SSL certificate to Nginx)
   - Regular security updates

## Performance Optimization

### PM2 Cluster Mode

The deployment uses cluster mode with 2 instances:
- Utilizes multiple CPU cores
- Zero-downtime reloads
- Automatic restart on failure
- Load balancing across instances

### Nginx Optimization

- Gzip compression enabled
- Static asset caching (60 minutes)
- Proxy buffering
- Connection pooling
- Configurable timeouts

## Continuous Improvement

### Monitor Deployments

Check GitHub Actions logs:
1. Go to **Actions** tab
2. Select latest **CD - Ansible Deployment** run
3. Review deployment summary
4. Check for errors or warnings

### Update Deployment

To modify deployment:

1. **Update roles** in `ansible/roles/*/tasks/main.yml`
2. **Update variables** in `ansible/group_vars/production.yml`
3. **Update playbook** in `ansible/playbooks/deploy.yml`
4. **Test locally** before pushing
5. **Push to main** to trigger deployment

### Rollback Strategy

If deployment fails:

```bash
# SSH to server
ssh ubuntu@YOUR_SERVER_IP

# Restore previous version (manual)
cd /opt/library-website
git log
git checkout <previous-commit-sha>
npm install
npm run build
pm2 restart library-website
```

For automated rollback, implement:
- Version tagging
- Deployment history tracking
- Automated backup/restore scripts

## Next Steps

1. **Add HTTPS**
   - Obtain SSL certificate (Let's Encrypt)
   - Configure Nginx SSL
   - Force HTTPS redirect

2. **Add Monitoring**
   - PM2 Plus monitoring
   - Log aggregation (ELK stack)
   - Uptime monitoring (UptimeRobot)
   - Performance monitoring (New Relic, DataDog)

3. **Add Database Persistence**
   - Configure SQLite backup
   - Or migrate to PostgreSQL/MySQL

4. **Add Blue-Green Deployment**
   - Zero-downtime deployments
   - Quick rollback capability

5. **Add Automated Testing**
   - Smoke tests after deployment
   - Integration tests on production
   - Performance benchmarks

## Related Documentation

- [CI Pipeline Setup](../docs/CI_SETUP.md)
- [CD Cloud Run Setup](../docs/CD_SETUP.md)
- [Project Structure](../docs/PROJECT_STRUCTURE.md)
