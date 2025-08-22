# 🚀 Quick Start Guide

Get GameVault running in 5 minutes!

## Prerequisites

- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
- **IGDB API credentials** - Free at [api.igdb.com](https://api.igdb.com/)

## ⚡ Quick Setup

### 1. Install Node.js
- Go to [nodejs.org](https://nodejs.org/)
- Download the LTS version
- Run the installer
- Restart your terminal/command prompt

### 2. Run Setup Script
**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**Manual Setup:**
```bash
npm install
```

### 3. Configure API
```bash
# Copy environment file
copy env.example .env.local

# Edit .env.local and add your credentials
VITE_IGDB_CLIENT_ID=your_client_id_here
VITE_IGDB_CLIENT_SECRET=your_client_secret_here
```

### 4. Start the App
```bash
npm run dev
```

### 5. Open Browser
Navigate to `http://localhost:3000`

## 🔑 Get IGDB API Credentials

1. Visit [https://api.igdb.com/](https://api.igdb.com/)
2. Click "Sign Up" and create account
3. Go to "Applications" → "Create Application"
4. Copy Client ID and Client Secret
5. Add to `.env.local` file

## 🎯 First Steps

1. **Add a game**: Go to Search page, find a game, click "Add to Library"
2. **View library**: Check the Library page to see your games
3. **Track progress**: Change game status (Playing, Completed, Backlog, Dropped)
4. **Add ratings**: Rate games on a 0-100 scale
5. **Export data**: Go to Settings to backup your library

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Run `npm run dev` to start development server
- Check console for any error messages

## 🎮 Happy Gaming!

Your personal gaming library is ready to use!
