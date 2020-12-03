const marked = require("marked");

exports.__apply__ = text => marked(text);
