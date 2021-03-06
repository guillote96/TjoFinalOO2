var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.js');

config = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
    resolve: {
        alias: {
          'react': pathToReact
        }
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /firebase/,
            loader: 'babel'
        },
        {
            test:/audiolet\.js/,
            loaders: ['imports?this=>window', 'script']
        },
        {
            test: /\.css$/,
            loader: "style-loader!css-loader"
        },
        {
            test: /\.(png|jpg|gif)$/,
            loader: "url"
        }

        ],
        noParse: [pathToReact]
        
    },
    
      devServer: {
    historyApiFallback: true,
    contentBase: './',
    inline: true,
    port : 3000
  }
    
};

module.exports = config;
