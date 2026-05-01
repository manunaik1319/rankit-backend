# Quick Start Guide

## 🚀 Deploy to Render in 5 Minutes

### Step 1: Create GitHub Repository (2 minutes)

```bash
cd backend
git init
git add .
git commit -m "Backend ready for Render"
git branch -M main
```

Go to GitHub and create a new repository called `rankit-backend`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/rankit-backend.git
git push -u origin main
```

### Step 2: Deploy on Render (3 minutes)

1. **Go to**: https://dashboard.render.com/
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub account
4. **Select**: `rankit-backend` repository
5. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
6. **Click**: "Create Web Service"

### Step 3: Get Your URL

After deployment completes (2-3 minutes), you'll get:
```
https://rankit-backend.onrender.com
```

### Step 4: Update Frontend

In your main project, update `.env.local`:

```env
VITE_API_URL=https://rankit-backend.onrender.com
```

Rebuild and deploy:

```bash
npm run build
firebase deploy --only hosting
```

## ✅ Done!

Your backend is live and your frontend is connected!

## 🧪 Test Your Deployment

Visit your backend URL in a browser:
```
https://rankit-backend.onrender.com
```

You should see:
```json
{
  "status": "ok",
  "message": "RankIt Backend API",
  "version": "1.0.0"
}
```

## 📝 Notes

- **First request**: May take 30-50 seconds (cold start on free tier)
- **Subsequent requests**: Fast (< 1 second)
- **Auto-deploy**: Push to GitHub = automatic redeployment
- **Logs**: View in Render dashboard

## 🆘 Need Help?

- **Detailed guide**: See `DEPLOYMENT_GUIDE.md`
- **Render docs**: https://render.com/docs
- **Test locally**: `npm start` then `npm test`
