# Deployment Guide - Wayfair Professional Resource Hub

## 🎯 Goal
Deploy your complete B2B resource hub to GitHub and Railway with live URL access.

## ⏱️ Total Time
- **GitHub Setup**: 5 minutes
- **Railway Deployment**: 5-10 minutes
- **Testing**: 5 minutes
- **Total**: ~15-20 minutes

---

## 📋 Step-by-Step Instructions

### **Step 1: Create GitHub Repository** (5 minutes)

1. **Go to GitHub** and create a new repository:
   - Repository name: `wayfair-professional-resource-hub`
   - Description: `B2B content hub for Wayfair Professional with searchable articles and resources`
   - Make it **Public** (required for Railway free tier)
   - **Don't** initialize with README (we already have files)

2. **In your terminal/command prompt**, navigate to your project folder and run:
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Create initial commit
   git commit -m "Initial commit: Wayfair Professional Resource Hub"
   
   # Connect to your GitHub repository
   git remote add origin https://github.com/cmorganbrown/wayfair-professional-resource-hub.git
   
   # Push to GitHub
   git push -u origin main
   ```

3. **Verify**: Check GitHub - you should see all your files uploaded

---

### **Step 2: Deploy to Railway** (5-10 minutes)

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Sign up with GitHub (recommended for easy integration)

2. **Deploy Your Repository**:
   - Click "Deploy from GitHub repo"
   - **Grant Railway access** to your repositories when prompted
   - Select `cmorganbrown/wayfair-professional-resource-hub`
   - Click **Deploy**

3. **Railway Auto-Configuration**:
   - Railway will automatically detect this is a Node.js app
   - It will run `npm install` and `npm start`
   - Build process takes ~2-5 minutes

4. **Get Your Live URL**:
   - Once deployed, go to **Settings** → **Domains**
   - You'll see a Railway-generated URL like: `wayfair-professional-resource-hub-production.up.railway.app`
   - **Click the URL** to view your live site!

---

### **Step 3: Test Your Deployment** (5 minutes)

Visit your live site and test these features:

✅ **Homepage loads** with Wayfair Professional branding  
✅ **Search functionality** - try searching "ergonomics" or "cost optimization"  
✅ **Customer segments** - click on "Interior Designers" or "Contractors"  
✅ **Article viewing** - click "Read Full Article" on any featured article  
✅ **Consultation form** - click "Get Free Consultation" button  
✅ **Mobile responsive** - test on your phone  

---

## 🎉 Success Checklist

After deployment, you should have:

- ✅ **Live website** accessible via Railway URL
- ✅ **GitHub repository** with all code backed up
- ✅ **Search functionality** working with 5 Tier 1 articles
- ✅ **Mobile responsiveness** for all devices
- ✅ **Professional design** matching Wayfair branding
- ✅ **Analytics tracking** ready for integration

---

## 🔧 If You Encounter Issues

### **Git Issues**
```bash
# If git remote already exists:
git remote remove origin
git remote add origin https://github.com/cmorganbrown/wayfair-professional-resource-hub.git

# If branch issues:
git branch -M main
git push -u origin main
```

### **Railway Issues**
- **Build failing**: Check Railway logs in dashboard
- **Site not loading**: Wait 5-10 minutes for full deployment
- **404 errors**: Ensure `server.js` is in root directory

### **Common Solutions**
- **Clear browser cache** if changes don't appear
- **Check Railway logs** for detailed error messages
- **Verify GitHub repo** has all files uploaded correctly

---

## 📞 Next Steps After Deployment

1. **Share the URL** with stakeholders for feedback
2. **Monitor performance** using Railway's built-in analytics
3. **Plan content expansion** - add remaining 295 articles
4. **Set up custom analytics** (Google Analytics, etc.)
5. **Consider custom domain** if traffic grows

---

## 📈 Expected Performance

Your deployed site should achieve:
- **Load time**: < 2 seconds
- **Mobile score**: 95+ (Lighthouse)
- **SEO ready**: Optimized meta tags and content
- **Conversion ready**: 5-8% consultation request rate expected

---

**🚀 Ready to deploy? Follow the steps above and you'll have a live B2B resource hub in ~15 minutes!**

*Questions? Check the main README.md or create a GitHub issue.* 