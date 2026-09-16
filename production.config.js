// Production optimization configuration
module.exports = {
  // Compression settings
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024
  },
  
  // Cache settings
  cache: {
    maxAge: 31536000, // 1 year for static assets
    etag: true,
    lastModified: true
  },
  
  // Security headers
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  // Performance settings
  performance: {
    removeConsole: true,
    minify: true,
    treeshake: true
  }
};