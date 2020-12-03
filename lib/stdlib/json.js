
exports.parse = text => JSON.parse(text);

exports.stringify = (object, spaces=0) => JSON.stringify(object, null, spaces);
