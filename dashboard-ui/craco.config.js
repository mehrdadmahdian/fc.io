// CRACO configuration for better hot reload in Docker
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Enable hot reload in Docker
      if (env === 'development') {
        webpackConfig.watchOptions = {
          poll: 1000,
          aggregateTimeout: 200,
          ignored: /node_modules/,
        };
      }
      
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // Override dev server config for Docker
    devServerConfig.host = '0.0.0.0';
    devServerConfig.port = 3000;
    devServerConfig.hot = true;
    devServerConfig.liveReload = true;
    
    // Configure websocket properly for Docker
    devServerConfig.client = {
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 3000,
        protocol: 'ws',
      },
    };
    
    // Enable polling for file watching in Docker
    devServerConfig.watchFiles = {
      paths: ['src/**/*'],
      options: {
        poll: 1000,
        aggregateTimeout: 200,
        ignored: /node_modules/,
      },
    };
    
    return devServerConfig;
  },
};
