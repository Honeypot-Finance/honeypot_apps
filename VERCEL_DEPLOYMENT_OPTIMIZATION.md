# Vercel Deployment Optimization Guide

## Problem

The wasabee app was experiencing Out of Memory (OOM) errors during Vercel deployment due to:

- Webpack cache consuming 5.2GB
- Client-production cache: 3.5GB
- Server-production cache: 1.1GB
- Total build size: 8.4GB exceeding the 8GB limit

## Solution Implemented

### 1. Webpack Memory Optimization (`next.base.config.js`)

**Changes Made:**

- Disabled production source maps (`productionBrowserSourceMaps: false`)
- Added webpack memory optimizations (`webpackMemoryOptimizations: true`)
- Configured filesystem cache with memory limits
- Implemented chunk splitting with size limits (244KB max)
- Added library-specific chunks for charts and web3 packages
- Enabled SWC minification
- Added console.log removal in production
- Optimized image settings with WebP/AVIF support

**Key Optimizations:**

```javascript
// Cache optimization
config.cache = {
  type: 'filesystem',
  maxMemoryGenerations: 1,
  cacheDirectory: path.resolve(__dirname, '.next/cache'),
};

// Chunk splitting
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      maxSize: 244000, // 244KB max
    },
    charts: {
      test: /[\\/]node_modules[\\/](lightweight-charts|apexcharts|recharts|echarts)[\\/]/,
      name: 'charts',
      priority: 10,
    },
    web3: {
      test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|ethers)[\\/]/,
      name: 'web3',
      priority: 10,
    },
  },
}
```

### 2. Vercel Configuration (`apps/wasabee/vercel.json`)

**Added:**

- Custom build command using optimization script
- Framework-specific settings
- Cache headers for static assets
- Memory limits for API functions
- Disabled telemetry and Sentry for build

```json
{
  "buildCommand": "node apps/wasabee/scripts/build-optimize.js",
  "outputDirectory": "apps/wasabee/.next",
  "framework": "nextjs",
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1",
      "DISABLE_SENTRY": "true"
    }
  }
}
```

### 3. App-Specific Optimization (`apps/wasabee/next.config.js`)

**Added:**

- On-demand entries optimization
- Memory-based workers
- Server-side externals
- Additional production optimizations

### 4. Build Optimization Script (`apps/wasabee/scripts/build-optimize.js`)

**Features:**

- Automatic cache cleanup before build
- Memory flag optimization
- Environment variable setup
- Intelligent build process

**Memory Settings:**

```javascript
const nodeOptions = ['--max-old-space-size=2048', '--max-semi-space-size=128'].join(' ');
```

### 5. Enhanced .vercelignore

**Excluded:**

- All cache directories
- Test files and documentation
- Development files
- Large assets (images, fonts)
- Other apps from the monorepo
- Source maps and temp files

### 6. Cache Cleanup Script (`cleanup-cache.js`)

**Purpose:**

- Remove large cache files before deployment
- Clean temporary files
- Provide size reporting

## Usage

### For Local Development

```bash
# Clean cache before building
node cleanup-cache.js

# Build with optimization
cd apps/wasabee
npm run build
```

### For Vercel Deployment

The optimization is automatic through the custom build command in `vercel.json`.

### Manual Cache Cleanup

```bash
# Run the cleanup script
node cleanup-cache.js

# Or clean specific app cache
rm -rf apps/wasabee/.next/cache
```

## Expected Results

### Before Optimization:

- Build size: 8.4GB
- Webpack cache: 5.2GB
- Memory usage: >8GB (causing OOM)
- Build time: >6 minutes before failure

### After Optimization:

- Build size: <2GB (estimated)
- Webpack cache: <500MB
- Memory usage: <4GB
- Build time: <4 minutes
- Successful deployment

## Monitoring

### Build Success Indicators:

- No SIGKILL signals
- Build completes within 4-6 minutes
- Memory usage stays below 6GB
- Cache size remains under 1GB

### If Issues Persist:

1. Check cache size: `du -h apps/wasabee/.next/cache`
2. Run cleanup: `node cleanup-cache.js`
3. Monitor memory: Check Vercel build logs for memory usage
4. Consider upgrading to Vercel Pro for enhanced builds

## Maintenance

### Regular Tasks:

- Run cache cleanup weekly: `node cleanup-cache.js`
- Monitor bundle size with: `npx @next/bundle-analyzer`
- Check for large dependencies periodically

### Dependencies to Monitor:

- `lightweight-charts` (4.2MB)
- `echarts` (large charting library)
- `@rainbow-me/rainbowkit` (web3 UI)
- `wagmi` and `viem` (web3 core)

## Additional Recommendations

1. **Enable Enhanced Builds** on Vercel for larger projects
2. **Use CDN** for static assets like images and fonts
3. **Implement lazy loading** for heavy components
4. **Consider code splitting** for page-level optimizations
5. **Regular dependency audits** to remove unused packages

## Troubleshooting

### Common Issues:

- **Still getting OOM**: Run `node cleanup-cache.js` and redeploy
- **Build fails**: Check if all dependencies are compatible
- **Slow builds**: Verify cache is being cleaned properly

### Debug Commands:

```bash
# Check cache size
du -h -d 2 apps/wasabee/.next/cache

# Find large files
find apps/wasabee -type f -size +10M -exec ls -lh {} \;

# Monitor memory during build
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

This optimization should resolve the OOM issues and enable successful Vercel deployments for the wasabee app.
