/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.module.rules.push({
        test: /\.html$/,
        use: "ignore-loader", // Ignorar archivos HTML
      });
  
      config.externals = [
        ...config.externals,
        { "@mapbox/node-pre-gyp": "commonjs @mapbox/node-pre-gyp" },
      ];
      
  
      return config;
    },
  };
  
  export default nextConfig;
  