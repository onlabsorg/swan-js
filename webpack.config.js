const path = require('path');

module.exports = {
        
    entry: "./index.js",
    
    output: {
        filename: 'swan.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './dist')
    }
}
