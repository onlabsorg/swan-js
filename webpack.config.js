const path = require('path');

module.exports = {
        
    entry: "./index.js",
    
    output: {
        filename: 'swan.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, './dist')
    },
    
    resolve: {
        fallback: {
            "path": require.resolve('path-browserify')
        }
    }
}
