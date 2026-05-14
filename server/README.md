# ResQAI — Server Folder

This folder contains the **server launcher** for the ResQAI platform.

## Structure

```
server/
├── server.js          # Production server entry point (bootstraps backend)
├── package.json       # Server scripts
└── README.md          # This file
```

## Usage

### Development
```bash
# Run backend directly
cd backend && npm run dev
```

### Production (via server/)
```bash
# Start from project root
node server/server.js

# Or from server directory
cd server && node server.js
```

## Notes
- The actual Express API code lives in `../backend/`
- This folder provides the launch point for production
- Environment variables should be set in `../backend/.env`
