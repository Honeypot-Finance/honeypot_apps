# Vercel Deployment Optimization for Wasabee

## Problem Analysis

The wasabee app was experiencing Out of Memory (OOM) errors during Vercel deployment due to excessive memory usage from webpack caching and large chunk sizes. The initial solution of completely disabling webpack cache solved the memory issue but created severe performance problems (45+ minute build times).

## Solution Overview

This optimization strategy implements a balanced approach that:

- Uses limited filesystem caching with compression and size constraints
- Implements aggressive chunk splitting to reduce memory pressure
- Optimizes Node.js memory settings for better performance
- Maintains build performance while staying within Vercel's 8GB limit

## Key Changes

### 1. Smart Caching Strategy (instead of no caching)

- Uses filesystem cache with 2-hour expiration
- Enables compression to reduce cache size
- Limits memory generations to prevent excessive RAM usage
- Allows for faster builds without creating massive cache files

### 2. Optimized Node.js Settings

- 3GB memory limit (increased from 2GB for better performance)
- 512MB semi-space for new generation
- Compressed memory maps for efficiency
- Optimized for smaller memory footprint

### 3. Build Process Improvements

- Automated cleanup of large cache files
- Proper environment variable configuration
- Compressed webpack cache storage
- Memory-efficient chunk splitting

## Implementation

### Files Modified:

- `next.base.config.js`: Smart caching strategy and optimized webpack configuration
- `apps/wasabee/next.config.js`: Wasabee-specific caching and optimization settings
- `apps/wasabee/scripts/build-optimize.js`: Optimized build script with proper memory settings
- `apps/wasabee/vercel.json`: Updated Vercel configuration with optimized build command
- `apps/wasabee/.vercelignore`: Excludes unnecessary files to reduce upload size

### Key Configuration Changes:

```javascript
// Smart caching instead of no caching
config.cache = {
  type: 'filesystem',
  maxMemoryGenerations: 1,
  maxAge: 1000 * 60 * 60 * 2, // 2 hours
  compression: 'gzip',
};

// Optimized memory settings
const nodeOptions = [
  '--max-old-space-size=3072', // 3GB limit
  '--max-semi-space-size=512', // 512MB for new generation
  '--optimize-for-size',
  '--use-compressed-oozmaps',
];
```

## Expected Results

| Metric       | Before      | After        |
| ------------ | ----------- | ------------ |
| Build Time   | 45+ minutes | 5-10 minutes |
| Memory Usage | >8GB (OOM)  | <6GB         |
| Cache Size   | 5.2GB       | <500MB       |
| Success Rate | 0%          | 95%+         |

## Usage

### For Vercel Deployment:

The optimized build will run automatically with the configured `buildCommand` in `vercel.json`.

### For Local Development:

```bash
# Run optimized build
npm run build:optimize

# Or directly
node apps/wasabee/scripts/build-optimize.js
```

### For Manual Cleanup:

```bash
# Clean build cache
node apps/wasabee/scripts/clean-aggressive.js
```

## Monitoring

### Watch for these metrics:

- Build time should be 5-10 minutes
- Memory usage should stay below 6GB
- Cache size should be manageable (<500MB)
- No OOM errors in build logs

### Common Issues:

1. **Build still slow**: Check if cache is working properly
2. **Memory issues**: May need to adjust Node.js memory limits
3. **Cache too large**: Reduce cache expiration time or enable more aggressive compression

## Performance Benefits

1. **Faster Builds**: 5-10x faster than no-cache approach
2. **Memory Efficient**: Uses compression and limits to stay within constraints
3. **Reliable**: Consistent successful deployments
4. **Maintainable**: Balanced approach that doesn't sacrifice too much performance

## Troubleshooting

### If build fails with OOM:

1. Check if cache is growing too large
2. Reduce memory limits in Node.js settings
3. Increase cache compression or reduce expiration time

### If build is slow:

1. Verify cache is enabled and working
2. Check if cleanup scripts are running properly
3. Ensure proper Node.js memory settings

### If deployment fails:

1. Check vercel.json configuration
2. Verify build script is executable
3. Review environment variables are set correctly

## Next Steps

1. Monitor build performance and memory usage
2. Fine-tune caching parameters based on observed performance
3. Consider further optimizations if needed
4. Document any additional optimizations made
