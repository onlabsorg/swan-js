const chai = require("chai"), expect = chai.expect;

const {
    Term,
        Tuple,
        Item,
            Bool, 
            Numb, 
            Func, 
            Undefined, 
            Container, 
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
    });
});