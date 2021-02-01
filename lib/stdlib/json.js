
exports.parse = text => JSON.parse(text);

exports.stringify = spaces => object => JSON.stringify(object, null, spaces);
