# RankIt Backend API

Backend API for RankIt College Predictor - deployed on Render.

## Features

- College prediction based on JEE rank
- CSAB cutoffs data
- Branch and college information
- College comparison

## API Endpoints

- `GET /` - Health check
- `POST /api/predict` - Get college predictions
- `GET /api/csab` - Get CSAB cutoffs
- `GET /api/cutoffs` - Search cutoffs
- `GET /api/branches` - Get all branches
- `POST /api/compare` - Compare colleges

## Deployment on Render

### Step 1: Push to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: rankit-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click "Create Web Service"

### Step 3: Update Frontend

After deployment, update your frontend `.env` file with the Render URL:

```
VITE_API_URL=https://rankit-backend.onrender.com
```

## Local Development

```bash
npm install
npm start
```

Server will run on http://localhost:3000

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)
