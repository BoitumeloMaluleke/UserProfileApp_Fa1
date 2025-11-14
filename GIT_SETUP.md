# Git and GitHub Setup Guide

## Check Your Current Git Configuration

### Check Git Username and Email
Run these commands in Cursor's terminal (Ctrl + `):

```bash
git config --global user.name
git config --global user.email
```

### Check All Git Settings
```bash
git config --global --list
```

---

## Configure Git (If Not Set)

If email is not set, configure it:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

**Use the same email that you use for your GitHub account!**

---

## Check GitHub Authentication

### Option 1: Check via Git Credential Manager
```bash
# Windows
git config --global credential.helper manager-core

# Then check stored credentials
git config --global credential.helper
```

### Option 2: Check via GitHub CLI (if installed)
```bash
gh auth status
```

### Option 3: Try to Push (will show if authenticated)
```bash
git push
```
- If it asks for credentials, you'll see which account it's using
- If it works, you're logged in

---

## GitHub Account vs Git Configuration

**Important distinction:**
- **Git config** (user.name, user.email) = What name/email shows on your commits
- **GitHub authentication** = Which GitHub account you're logged into

They can be different! For example:
- Git config might show: `user.name = "Boitumelo Maluleke"`
- GitHub account might be: `@username-on-github`

---

## Setup GitHub Authentication

### Method 1: Personal Access Token (Recommended)
1. Go to GitHub.com → Your profile → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token → Give it a name → Check "repo" scope
4. Copy the token (save it - you won't see it again!)
5. When Git asks for password, paste the token instead

### Method 2: GitHub CLI
```bash
# Install GitHub CLI first, then:
gh auth login
```

### Method 3: SSH Keys (Advanced)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Then add public key to GitHub
```

---

## Quick Check Commands

```bash
# Check Git user config
git config user.name
git config user.email

# Check GitHub account (if GitHub CLI installed)
gh auth status

# Test GitHub connection
git ls-remote https://github.com/YOUR_USERNAME/UserProfileApp.git
```

---

## For Deployment - What You Need:

1. ✅ Git configured (name and email) - Already set!
2. ✅ GitHub account created
3. ✅ GitHub authenticated (will be tested when you push)
4. ✅ MongoDB Atlas account (free) - Needed for Azure deployment

---

## MongoDB Atlas - Yes, You Need It!

**Why?**
- Azure servers can't access your local Docker MongoDB
- You need a cloud database that Azure can connect to
- MongoDB Atlas is FREE (512MB storage, perfect for this project)

**Setup takes 5 minutes:**
1. Go to https://mongodb.com/cloud/atlas
2. Sign up (free)
3. Create free cluster
4. Get connection string
5. Done!

---

## Troubleshooting

### If Git asks for password every time:
- Use Personal Access Token instead of password
- Or set up SSH keys

### If you don't know your GitHub username:
- Go to github.com and sign in
- Click your profile picture (top right)
- Your username is shown there

### To change Git email:
```bash
git config --global user.email "new-email@example.com"
```

