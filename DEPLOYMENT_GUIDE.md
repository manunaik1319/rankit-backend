# Backend Deployment Guide for Render

## ✅ Pre-Deployment Checklist

Your backend is ready to deploy! Here's what we've set up:

- ✅ Express server with all API endpoints
- ✅ Data files (cutoffs, colleges, branches, CSAB)
- ✅ CORS enabled for frontend access
- ✅ Health check endpoint
- ✅ Error handling
- ✅ Production-ready configuration

## 📦 What's Included

```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies and scripts
├── api/               # API route handlers
│   ├── predict.js     # College prediction
│   ├── csab.js        # CSAB cutoffs
│   ├── cutoffs.js     # Cutoff search
│   ├── branches.js    # Branch data
│   └── compare.js     # College comparison
├── data/              # JSON data files
│   ├── cutoffs.json
│   ├── colleges.json
│   ├── branches.json
│   └── csab-cutoffs.json
└── README.md          # Documentation
```

## 🚀 Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

#### Step 1: Create GitHub Repository

```bash
cd backend
git init
git add .
git commit -m "Initial backend setup for Render"
```

Create a new repository on GitHub, then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rankit-backend.git
git push -u origin main
```

#### Step 2: Deploy on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** and authorize Render
4. Select your `rankit-backend` repository
5. Configure the service:

   **Basic Settings:**
   - **Name**: `rankit-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if in monorepo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Select **"Free"** plan (0.1 CPU, 512 MB RAM)

6. Click **"Create Web Service"**

#### Step 3: Wait for Deployment

- Render will automatically build and deploy your service
- First deployment takes 2-5 minutes
- You'll get a URL like: `https://rankit-backend.onrender.com`

#### Step 4: Test Your Deployment

Once deployed, test the health endpoint:

```bash
curl https://rankit-backend.onrender.com/
```

You should see:
```json
{
  "status": "ok",
  "message": "RankIt Backend API",
  "version": "1.0.0",
  "endpoints": {
    "predict": "/api/predict",
    "csab": "/api/csab",
    "cutoffs": "/api/cutoffs",
    "branches": "/api/branches",
    "compare": "/api/compare"
  }
}
```

### Option 2: Deploy via Render Blueprint (render.yaml)

If you have `render.yaml` in your repo:

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect and use `render.yaml`
5. Click **"Apply"**

## 🔧 Update Frontend to Use Backend

After deployment, update your frontend to use the backend API:

### 1. Update `.env.local` in your frontend:

```env
VITE_API_URL=https://rankit-backend.onrender.com
```

### 2. Update `src/services/firebaseApi.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function predictColleges(userData) {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
}
```

### 3. Rebuild and redeploy frontend:

```bash
npm run build
firebase deploy --only hosting
```

## ⚠️ Important Notes

### Free Tier Limitations

- **Cold Starts**: Free tier services spin down after 15 minutes of inactivity
- **First Request**: May take 30-50 seconds to wake up
- **Solution**: Consider upgrading to paid tier ($7/month) for always-on service

### Data Size

- Your data files total ~50MB
- This is within Render's limits
- All data is loaded into memory on startup

### CORS

- CORS is enabled for all origins (`origin: true`)
- For production, consider restricting to your frontend domain:

```javascript
const corsHandler = cors({ 
  origin: 'https://jee-mains-tracker.web.app' 
});
```

## 📊 Monitoring

### View Logs

1. Go to your service dashboard on Render
2. Click **"Logs"** tab
3. See real-time server logs

### Check Metrics

1. Go to **"Metrics"** tab
2. Monitor CPU, memory, and request counts

## 🔄 Updates and Redeployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update API logic"
git push origin main
```

Render will automatically:
1. Detect the push
2. Build the new version
3. Deploy with zero downtime

## 🐛 Troubleshooting

### Build Fails

Check the build logs in Render dashboard. Common issues:
- Missing dependencies in `package.json`
- Node version mismatch
- Data files not committed to git

### Server Won't Start

Check logs for:
- Port binding issues (use `process.env.PORT`)
- Missing data files
- Import/export syntax errors

### API Returns Errors

- Check CORS configuration
- Verify data files are loaded
- Check request/response format

## 💰 Cost Estimate

**Free Tier:**
- 750 hours/month free
- Enough for one always-on service
- Perfect for testing and low traffic

**Paid Tier ($7/month):**
- No cold starts
- Better performance
- Recommended for production

## 🎉 You're Ready!

Your backend is production-ready and optimized for Render's free tier. Follow the steps above to deploy, then update your frontend to use the new API URL.

**Questions?** Check Render's documentation: https://render.com/docs
