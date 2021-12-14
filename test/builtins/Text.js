const {expect} = require("chai");
const {Text} = require("../../lib/builtins");


describe("Text", () => {
    
    describe("Text.from_char_codes(...charCodes)", () => {

        it("should return the string made of the given UTF char codes", async () => {
            expect(await Text.from_char_codes(65, 98, 99)).to.equal("Abc");
        });
    });        
    
    describe("Text.to_char_codes (str)", () => {
        
        it("should return an iterator yielding the char codes of the given string", async () => {
            const iter = Text.to_char_codes ("Abc");
            expect(iter[Symbol.iterator]).to.be.a("function");
            expect(Array.from(iter)).to.deep.equal([65, 98, 99]);
        });
        
        it("shoudl throw an error if str is not a string", () => {
            expect(() => Text.to_char_codes (10)).to.throw(TypeError);
        });
    });

    describe("Text.find(subStr)(str)", () => {
        
        it("should return a function", () => {
            expect(Text.find("Abc")).to.be.a("function");
        });
        
        it("should throw an error if the sub-string is not a string", () => {
            expect(() => Text.find(1)).to.throw(TypeError);
        });
        
        describe("fn = Text.find(subStr)", () => {
            
            it("should return the first index of subStr in str", async () => {
                expect(await Text.find("Abc")("__Abc__def__Abc")).to.equal(2);
            });

            it("should return -1 if no match is found", async () => {
                expect(await Text.find("xxx")("__Abc__def__Abc")).to.equal(-1);
            });

            it("should throw an error if the passed string is not a string", () => {
                const fn = Text.find("abc");
                expect(() => fn(1)).to.throw(TypeError);
            });
        });
    });    
    
    describe("Text.rfind(subStr)(str)", () => {
        
        it("should return a function", () => {
            expect(Text.rfind("Abc")).to.be.a("function");
        });
        
        it("should throw an error if the sub-string is not a string", () => {
            expect(() => Text.rfind(1)).to.throw(TypeError);
        });
        
        describe("fn = Text.rfind(subStr)", () => {
            
            it("should return the last index of subStr in str", async () => {
                expect(await Text.rfind("Abc")("__Abc__def__Abc")).to.equal(12);
            });

            it("should return -1 if no match is found", async () => {
                expect(await Text.rfind("xxx")("__Abc__def__Abc")).to.equal(-1);
            });

            it("should throw an error if the passed string is not a string", () => {
                const fn = Text.rfind("abc");
                expect(() => fn(1)).to.throw(TypeError);
            });
        });
    });    
    
    describe("Text.lower(str)", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await Text.lower("AbcDef")).to.equal("abcdef");
        });
    });    
    
    describe("Text.upper(str)", () => {

        it("should return the given string converted to upper case characters", async () => {
            expect(await Text.upper("AbcDef")).to.equal("ABCDEF");
        });
    });   
    
    describe("Text.trim_head(str)", () => {
        it("should remove the leading spaces", async () => {
            expect(await Text.trim_head("   abc   ")).to.equal("abc   ");
        });
    });

    describe("Text.trim_tail(str)", () => {
        it("should remove the trailing spaces", async () => {
            expect(await Text.trim_tail("   abc   ")).to.equal("   abc");
        });
    });

    describe("Text.trim(str)", () => {
        it("should remove both leading and trailing spaces", async () => {
            expect(await Text.trim("   abc   ")).to.equal("abc");
        });
    });   
    
    describe("Text.head(index)(str)", () => {

        it("should return a function", () => {
            expect(Text.head(3)).to.be.a("function");
        });
        
        it("should throw an error if the index is not a number", () => {
            expect(() => Text.head('abc')).to.throw(TypeError);
        });
        
        describe("fn = Text.head(index)", () => {
            
            it("should return the first `index` characters of the passed string", async () => {
                expect(Text.head(3)("Abcdefghi")).to.equal("Abc");
            });

            it("should interpret negative indices as relative to the end of the string", async () => {
                expect(Text.head(-5)("Abcdefghi")).to.equal("Abcd");
            });

            it("should throw an error if the passed string is not a string", () => {
                const fn = Text.head(3);
                expect(() => fn(1)).to.throw(TypeError);
            });
        });
    });              

    describe("Text.tail(index)(str)", () => {

        it("should return a function", () => {
            expect(Text.tail(3)).to.be.a("function");
        });
        
        it("should throw an error if the index is not a number", () => {
            expect(() => Text.tail('abc')).to.throw(TypeError);
        });
        
        describe("fn = Text.tail(index)", () => {
            
            it("should return the substring made of all the character after `index`", async () => {
                expect(Text.tail(3)("Abcdefghi")).to.equal("defghi");
            });

            it("should interpret negative indices as relative to the end of the string", async () => {
                expect(Text.tail(-5)("Abcdefghi")).to.equal("efghi");
            });

            it("should throw an error if the passed string is not a string", () => {
                const fn = Text.tail(3);
                expect(() => fn(1)).to.throw(TypeError);
            });
        });
    });              

    describe("Text.split(divider)(str)", () => {

        it("should return a function", () => {
            expect(Text.split(",")).to.be.a("function");
        });
        
        it("should throw an error if the sub-string is not a string", () => {
            expect(() => Text.split(1)).to.throw(TypeError);
        });
        
        describe("fn = Text.split(divider)", () => {
            
            it("should return an iterator yielding the `str` substrings between the `divider`", async () => {
                const iter = await Text.split(",")("Abc,def,hij");
                expect(iter[Symbol.iterator]).to.be.a("function");
                expect(Array.from(iter)).to.deep.equal(["Abc", "def", "hij"]);
            });

            it("should throw an error if the passed string is not a string", () => {
                const fn = Text.split("abc");
                expect(() => fn(1)).to.throw(TypeError);
            });
        });
    });              
});


