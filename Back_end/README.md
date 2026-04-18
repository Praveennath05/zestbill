# Backend Server Setup

## Prerequisites
1. Node.js installed
2. MongoDB running on `localhost:27017`

## Starting the Server

### Option 1: Using npm script
```bash
npm start
```

### Option 2: Using the batch file (Windows)
Double-click `START_SERVER.bat`

### Option 3: Direct Node command
```bash
node index.js
```

## Verify Server is Running

Once started, you should see:
- "Registering routes..."
- "✓ Auth routes registered"
- "✓ Product routes registered"
- "✓ Order routes registered"
- "Database initialized" (if MongoDB is running)
- "Server running on port 5000"

## Test the Server

Open your browser and go to:
- http://localhost:5000/ - Should show server status
- http://localhost:5000/api/health - Health check endpoint

## Troubleshooting

### 404 Errors
- Make sure the server is actually running
- Check the console for any error messages
- Verify MongoDB is running (server will still start without it, but auth won't work)

### MongoDB Connection Issues
- Make sure MongoDB is installed and running
- Check if MongoDB service is running: `mongod --version`
- Server will start without MongoDB, but login/register will fail

### Port Already in Use
- Change PORT in index.js or use environment variable
- Or kill the process using port 5000

