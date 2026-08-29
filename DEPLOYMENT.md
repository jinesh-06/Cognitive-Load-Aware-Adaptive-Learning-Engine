# Deployment Guide: Frontend (Vercel) + Backend (Render)

This guide covers deploying the frontend to Vercel and backend to Render.

## Prerequisites
- GitHub, GitLab, or Bitbucket account with your code pushed
- Vercel account (free)
- Render account (free)
- Google Gemini API key

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend Repository
Ensure your code is pushed to Git:
```bash
git add .
git commit -m "Setup for separate frontend/backend deployment"
git push origin main
```

### Step 2: Create Render Account & Deploy
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Fill in the configuration:
   - **Name:** `cognitive-load-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free (or Paid for better performance)

### Step 3: Add Environment Variables
In the Render dashboard:
1. Go to **Environment** tab
2. Add the following variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your Google Gemini API key

3. Click **Deploy** and wait for the build to complete

### Step 4: Get Your Backend URL
Once deployed successfully, Render will provide a URL like:
```
https://cognitive-load-backend-xxxx.onrender.com
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account & Deploy
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Connect your Git repository
4. Click **Import** (Vercel auto-detects Next.js/Vite)

### Step 2: Configure Build Settings
Make sure Vercel detects:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Add Environment Variables
In the Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Render backend URL (e.g., `https://cognitive-load-backend-xxxx.onrender.com`)
3. Set it for **Production** environment
4. Click **Save and Deploy**

### Step 4: Trigger Redeployment
After adding environment variables, redeploy:
1. Go to **Deployments** tab
2. Click **... (three dots)** on the latest deployment
3. Select **Redeploy**

---

## Verification

### Test the Connection
1. Visit your Vercel frontend URL
2. Open browser DevTools (F12) → **Network** tab
3. Perform an action that calls the API
4. Verify requests go to your Render backend URL (not `/api`)

### Check Backend Health
Visit in your browser:
```
https://your-render-backend.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "service": "Cognitive Load-Aware Adaptive Learning Engine",
  "timestamp": "...",
  "geminiConfigured": true
}
```

---

## Environment Variables Summary

### Render Backend (.env)
```
GEMINI_API_KEY=your_key_here
NODE_ENV=production
PORT=3000  # Automatically set by Render
```

### Vercel Frontend (Project Settings)
```
VITE_API_URL=https://cognitive-load-backend-xxxx.onrender.com
```

---

## Troubleshooting

### "Cannot reach backend"
- Ensure `VITE_API_URL` is set correctly in Vercel
- Wait 30+ seconds after Render deployment (cold start)
- Check Render logs for errors

### "API calls still going to /api"
- Clear browser cache (Ctrl+Shift+Delete)
- Verify `VITE_API_URL` is set in Vercel production environment
- Trigger a redeployment in Vercel

### "CORS errors"
- Ensure backend allows frontend domain
- Check if backend is setting proper CORS headers
- Verify API URL doesn't have trailing slash

---

## Next Steps

1. **Monitor Logs:**
   - Render: Dashboard → Logs
   - Vercel: Deployments → View Details

2. **Custom Domain (Optional):**
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domains

3. **Enable Auto-Deploy:**
   - Both platforms auto-deploy on Git push by default

---

## Local Development

To test locally with the same setup:
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Update VITE_API_URL in .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Run dev server (will use localhost:3000 API)
npm run dev
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Render spins down after 15 min of inactivity | Upgrade to Paid plan or use a monitoring service |
| Frontend doesn't see backend changes | Clear cache, hard refresh (Ctrl+Shift+R) |
| Build fails on Vercel | Check `npm run build` works locally |
| Build fails on Render | Ensure Node version is compatible (check package.json) |

