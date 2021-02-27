const T = require('../types');

exports.__apply__ = (...keyValuePairs) => {
    const map = new Map(keyValuePairs);
    const dict = {};
    dict.has = key => map.has(key);
    dict.get = key => map.get(key);
    dict.size = map.size;
    dict.keys = T.createTuple(...map.keys());
    dict.values = T.createTuple(...map.values());
    dict.entries = T.createTuple(...map.entries());
    return dict;
}