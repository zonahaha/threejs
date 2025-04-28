const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    port:8080,
    hot: true,
    open: true,
    liveReload: true,
    watchFiles: {        // 添加这个配置
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
});
