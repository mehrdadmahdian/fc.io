module.exports = {
    css: {
      loaderOptions: {
        sass: {
          additionalData: `
            @import "~bootstrap/scss/bootstrap";
          `
        }
      }
    },
    configureWebpack: {
      module: {
        rules: [
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: {
                loader: 'file-loader',
                options: {
                name: '[name].[hash:8].[ext]',
                outputPath: 'fonts/',
                },
            },
          },
        ],
      },
    },
  }