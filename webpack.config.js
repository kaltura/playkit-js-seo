const path = require('path');

module.exports = (env, { mode }) => {
  return {
    target: 'web',
    entry: './src/index.ts',
    optimization: {
      minimize: mode !== 'development'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: { configFile: mode === 'development' ? 'tsconfig.dev.json' : 'tsconfig.json' },
          exclude: /node_modules/
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      filename: 'playkit-seo.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    externals: {
      '@playkit-js/kaltura-player-js': 'root KalturaPlayer',
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'demo/dev')
      },
      client: {
        progress: true
      }
    }
  };
};
