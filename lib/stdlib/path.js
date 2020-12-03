const pathlib = require("path");

module.exports = {
    getBaseName: pathlib.basename,
    getDirName: pathlib.dirname,
    getExtName: pathlib.extname,
    normalize: pathlib.normalize,
    resolve: (...paths) => pathlib.resolve("/", ...paths)
};
