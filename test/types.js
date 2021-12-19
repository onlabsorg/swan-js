const chai = require("chai"), expect = chai.expect;

const {
    Term,
        Tuple,
        Item,
            Bool, 
            Numb, 
            Func, 
            Undefined, 
            Mapping, 
                Sequence, 
                    Text, 
                    List, 
                Namespace,
            Name,
                
    wrap, unwrap 
} = require('../lib/types');

describe("types", () => {
    
    describe("Bool", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return the term value", () => {
                expect((new Bool(true)).toBoolean()).to.be.true;
                expect((new Bool(false)).toBoolean()).to.be.false;
            });
        });

        describe(".toVoid()", () => {
            
            it("should return false", () => {
                expect((new Bool(true)).toVoid()).to.be.false;
                expect((new Bool(false)).toVoid()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return 'TRUE' if the value is true", () => {
                expect((new Bool(true)).toString()).to.equal("TRUE")
            });

            it("should return 'FALSE' if the value is true", () => {
                expect((new Bool(false)).toString()).to.equal("FALSE")
            });
        });
    });

    describe("Numb", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true if the number is not null", () => {
                expect((new Numb(9)).toBoolean()).to.be.true;
                expect((new Numb(0)).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return 0", () => {
                expect((new Numb(9)).toVoid()).to.equal(0);
                expect((new Numb(0)).toVoid()).to.equal(0);
            });
        });

        describe(".toString()", () => {
            
            it("should return the stringified value", () => {
                expect((new Numb(-1.23)).toString()).to.equal("-1.23");
            });
        });
    });
    
    describe("Func", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true", () => {
                expect((new Func(x=>x)).toBoolean()).to.be.true;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return null", () => {
                expect((new Func(x=>x)).toVoid()).to.be.null;
            });
        });

        describe(".toString()", () => {
            
            it("should return '[[Func]]'", () => {
                expect((new Func(x=>x)).toString()).to.equal("[[Func]]");
            });
        });
    });

    describe("Undefined", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true", () => {
                expect((new Undefined()).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return null", () => {
                expect((new Undefined()).toVoid()).to.be.null;
            });
        });

        describe(".toString()", () => {
            
            it("should return '[[Undefined <type-name>]]'", () => {
                expect((new Undefined(null, "TestOperation")).toString()).to.equal("[[Undefined TestOperation]]");
            });
        });
    });

    describe("Text", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true if the string value is not empty", () => {
                expect((new Text("abc")).toBoolean()).to.be.true;
                expect((new Text("")).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return an empty string", () => {
                expect((new Text("abc")).toVoid()).to.equal("");
                expect((new Text("")   ).toVoid()).to.equal("");
            });
        });

        describe(".toString()", () => {
            
            it("should return the text value as it is", () => {
                expect((new Text("abc")).toString()).to.equal("abc");
            });
        });
    });

    describe("List", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true if the array value is not empty", () => {
                expect((new List([1,2,3])).toBoolean()).to.be.true;
                expect((new List([])).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return an empty array", () => {
                expect((new List([1,2,3])).toVoid()).to.deep.equal([]);
                expect((new List([])     ).toVoid()).to.deep.equal([]);
            });
        });

        describe(".toString()", () => {
            
            it("should return [[List of N items]], where n is the number of items in the list", () => {
                expect((new List(["abc", 1, true])).toString()).to.equal("[[List of 3 items]]");
                expect((new List(["abc"])).toString()).to.equal("[[List of 1 item]]");
                expect((new List([])).toString()).to.equal("[[List of 0 items]]");
            });
        });
    });

    describe("Namespace", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true if the namespace value is not empty", () => {
                expect((new Namespace({a:1})).toBoolean()).to.be.true;
                expect((new Namespace({})).toBoolean()).to.be.false;
                expect((new Namespace({$key:1})).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return an empty object", () => {
                expect((new Namespace({a:1,b:2})).toVoid()).to.deep.equal({});
                expect((new Namespace({})       ).toVoid()).to.deep.equal({});
            });
        });

        describe(".toString()", () => {
            
            it("should retun a comma-separated list of keys enclosed between curly braces", () => {
                expect((new Namespace({key1:1, key2:2, key3:3, $key4:4})).toString()).to.equal("{key1, key2, key3}");
            });
        });
    });
    
    describe("Tuple", () => {
        
        describe(".toBoolean()", () => {
            
            it("should return true if at least one item booleanizes to true", () => {
                expect((new Tuple(1,2,3)).toBoolean()).to.be.true;
                expect((new Tuple(1)).toBoolean()).to.be.true;

                expect((new Tuple(0,"",[])).toBoolean()).to.be.false;
                expect((new Tuple(0)).toBoolean()).to.be.false;
                expect((new Tuple()).toBoolean()).to.be.false;
            });
        });
        
        describe(".toVoid()", () => {
            
            it("should return null", () => {
                expect((new Tuple(1,2,3)).toVoid()).to.be.null;
                expect((new Tuple()     ).toVoid()).to.be.null;
            });
        });

        describe(".toString()", () => {
            
            it("should return the concatenation of the stringified items", () => {
                expect((new Tuple("abc",0,true)).toString()).to.equal("abc0TRUE");
                expect((new Tuple()).toString()).to.equal("");
            });
        });
    });
});