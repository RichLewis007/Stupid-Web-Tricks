# Deployment Guide

## Cloudflare Pages Deployment

### Method 1: Direct Git Integration (Recommended)

1. **Push to GitHub**: Make sure your code is pushed to GitHub
   ```bash
   git remote add origin https://github.com/richlewis007/stupid-web-tricks.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages**
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select your GitHub repository: `richlewis007/stupid-web-tricks`
   - Click **Begin setup**

3. **Configure Build Settings**:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)
   - **Node.js version**: 18

4. **Deploy**: Click **Save and Deploy**

### Method 2: GitHub Actions (Automated)

1. **Set up Secrets** in your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID

2. **Get Cloudflare Credentials**:
   - **API Token**: Go to Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - **Account ID**: Found in the right sidebar of your Cloudflare Dashboard

3. **Push to GitHub**: The GitHub Action will automatically deploy on every push to main

### Method 3: Manual Upload

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Upload to Cloudflare Pages**:
   - Go to Cloudflare Pages dashboard
   - Click **Upload assets**
   - Upload the `dist` folder contents

## Environment Variables

If you need environment variables, add them in:
- Cloudflare Pages dashboard → Settings → Environment variables
- Or in the `wrangler.toml` file

## Custom Domain

1. **Add Custom Domain**:
   - Go to your Cloudflare Pages project
   - Click **Custom domains** → **Set up a custom domain**
   - Enter your domain name

2. **DNS Configuration**:
   - Add a CNAME record pointing to your Pages subdomain
   - Or use Cloudflare's nameservers for automatic configuration

## Performance Optimization

The site is already optimized with:
- Static site generation (zero JavaScript by default)
- Optimized images and assets
- Proper caching headers
- Modern CSS with Tailwind CSS
- Responsive design

## Monitoring

- **Analytics**: Available in Cloudflare Pages dashboard
- **Performance**: Use Cloudflare's built-in analytics
- **Uptime**: Cloudflare provides 99.9% uptime SLA

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Ensure all dependencies are installed
- Check for syntax errors in code

### Deployment Issues
- Verify build output directory is `dist`
- Check environment variables if used
- Review Cloudflare Pages logs

### Performance Issues
- Enable Cloudflare's CDN features
- Check image optimization settings
- Review caching configuration

## Support

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Astro Docs**: https://docs.astro.build/
- **GitHub Issues**: Create an issue in the repository
