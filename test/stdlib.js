var expect = require("chai").expect;
var loadlib = require("../lib/stdlib-loader");
var swan = require("..");
const apply = (f, ...args) => swan.O.apply(f, swan.T.createTuple(...args));


describe("stdlib", () => {
    
    describe("markdown", () => {
        it("should expose a function that converts markdown to HTML", async () => {
            var markdown = await loadlib("markdown");
            var html = await apply(markdown, "*bold*");
            expect(html).to.equal("<p><em>bold</em></p>\n");
        });
    });
    
    describe("path", () => {
        it("should expose NodeJS path functions", async () => {
            var path = await loadlib("path");
            var pathlib = require("path");
            expect(path.getBaseName).to.equal(pathlib.basename);
            expect(path.getExtName).to.equal(pathlib.extname);
            expect(path.normalize).to.equal(pathlib.normalize);
            expect(path.getDirName).to.equal(pathlib.dirname);
            expect(path.resolve("/path/to/doc1", "../doc2")).to.equal("/path/to/doc2");
        });
    });

    describe("math", () => {
        it("should expose JavaScript Math functions", async () => {
            var math = await loadlib("math");
            expect(math.E).to.equal(Math.E);
            expect(math.PI).to.equal(Math.PI);
            expect(math.abs).to.equal(Math.abs);
            expect(math.acos).to.equal(Math.acos);
            expect(math.acosh).to.equal(Math.acosh);
            expect(math.asin).to.equal(Math.asin);
            expect(math.asinh).to.equal(Math.asinh);
            expect(math.atan).to.equal(Math.atan);
            expect(math.atanh).to.equal(Math.atanh);
            expect(math.ceil).to.equal(Math.ceil);
            expect(math.cos).to.equal(Math.cos);
            expect(math.cosh).to.equal(Math.cosh);
            expect(math.exp).to.equal(Math.exp);
            expect(math.floor).to.equal(Math.floor);
            expect(math.log).to.equal(Math.log);
            expect(math.log10).to.equal(Math.log10);
            expect(math.max).to.equal(Math.max);
            expect(math.min).to.equal(Math.min);
            expect(math.random).to.equal(Math.random);
            expect(math.round).to.equal(Math.round);
            expect(math.sin).to.equal(Math.sin);
            expect(math.sinh).to.equal(Math.sinh);
            expect(math.sqrt).to.equal(Math.sqrt);
            expect(math.tan).to.equal(Math.tan);
            expect(math.tanh).to.equal(Math.tanh);
            expect(math.trunc).to.equal(Math.trunc);    
        });
    });

    describe("json", () => {
        it("should expose NodeJS JSON methods", async () => {
            var json = await loadlib("json");
            expect(json.parse(`{"a":1, "b":true}`)).to.deep.equal({a:1, b:true});
            expect(json.stringify({a:1})).to.equal(`{"a":1}`);
            expect(json.stringify({a:1}, 2)).to.equal(`{\n  "a": 1\n}`);
        });
    });
    
    describe("text", () => {
        
        describe("text.find(str, subStr)", () => {
            
            it("should return the first index of subStr in str", async () => {
                var text = await loadlib("text");
                expect(await text.find("__Abc__def__Abc", "Abc")).to.equal(2);                
            });
            
            it("should return -1 if no match is found", async () => {
                var text = await loadlib("text");
                expect(await text.find("__Abc__def__Abc", "xxx")).to.equal(-1);                
            });            
        });

        describe("text.rfind(str, subStr)", () => {
            
            it("should return the last index of subStr in str", async () => {
                var text = await loadlib("text");
                expect(await text.rfind("__Abc__def__Abc", "Abc")).to.equal(12);                
            });
            
            it("should return -1 if no match is found", async () => {
                var text = await loadlib("text");
                expect(await text.rfind("__Abc__def__Abc", "xxx")).to.equal(-1);                
            });            
        });

        describe("text.lower(str)", () => {
            
            it("should return the given string converted to lower case characters", async () => {
                var text = await loadlib("text");
                expect(await text.lower("AbcDef")).to.equal("abcdef");                
            });
        });
        
        describe("text.upper(str)", () => {
            
            it("should return the given string converted to upper case characters", async () => {
                var text = await loadlib("text");
                expect(await text.upper("AbcDef")).to.equal("ABCDEF");                
            });
        });
        
        describe("text.char(...charCodes)", () => {
            
            it("should return the string made of the given UTF char codes", async () => {
                var text = await loadlib("text");
                expect(await text.char(65, 98, 99)).to.equal("Abc");
            });
        });
        
        describe("text.code(str)", () => {
            
            it("should return the list of UTF char codes of the given string", async () => {
                var text = await loadlib("text");
                expect(await text.code("Abc")).to.deep.equal([65, 98, 99]);
            });
        });

        describe("text.slice(str, firstIndex, lastIndex)", () => {
            
            it("should return a slice of the given string from firstIndex to lastIndex", async () => {
                var text = await loadlib("text");
                expect(await text.slice("0123456789", 2, 5)).to.equal("234");
            });

            it("should allow negative indexing", async () => {
                var text = await loadlib("text");
                expect(await text.slice("0123456789", -8, -5)).to.equal("234");
            });

            it("should slice till the end of the string if lastIndex is omitted", async () => {
                var text = await loadlib("text");
                expect(await text.slice("0123456789", 4)).to.equal("456789");
            });
        });

        describe("text.split(str, divider)", () => {
            
            it("should return the list of `str` substrings between `divider` substrings", async () => {
                var text = await loadlib("text");
                expect(await text.split("Abc,def,hij", ",")).to.deep.equal(["Abc", "def", "hij"]);
            });
        });

        describe("text.replace(str, subStr, newSubStr)", () => {
            
            it("should replace all the occurencies of `subStr` with `newSubStr`", async () => {
                var text = await loadlib("text");
                expect(await text.replace("abcXYdefXYghi", "XY", "Z")).to.equal("abcZdefZghi");
            });
        });
    });

    describe("list", () => {
        
        describe("list.find(list, item)", () => {
            
            it("should return the first index of subStr in str", async () => {
                var list = await loadlib("list");
                expect(await list.find([0,10,20,10,20], 20)).to.equal(2);                
            });
            
            it("should return -1 if no match is found", async () => {
                var list = await loadlib("list");
                expect(await list.find([0,10,20,10,20], 50)).to.equal(-1);                
            });            
        });

        describe("text.rfind(str, subStr)", () => {
            
            it("should return the first index of subStr in str", async () => {
                var list = await loadlib("list");
                expect(await list.rfind([0,10,20,10,20], 20)).to.equal(4);                
            });
            
            it("should return -1 if no match is found", async () => {
                var list = await loadlib("list");
                expect(await list.rfind([0,10,20,10,20], 50)).to.equal(-1);                
            });            
        });

        describe("text.slice(list, firstIndex, lastIndex)", () => {
            
            it("should return a slice of the given string from firstIndex to lastIndex", async () => {
                var list = await loadlib("list");
                expect(await list.slice([0,10,20,30,40,50,60], 2, 5)).to.deep.equal([20,30,40]);
            });

            it("should allow negative indexing", async () => {
                var list = await loadlib("list");
                expect(await list.slice([0,10,20,30,40,50,60], -5, -2)).to.deep.equal([20,30,40]);
            });

            it("should slice till the end of the string if lastIndex is omitted", async () => {
                var list = await loadlib("list");
                expect(await list.slice([0,10,20,30,40,50,60], 3)).to.deep.equal([30,40,50,60]);
            });
        });

        describe("text.reverse(list)", () => {
            
            it("should return a copy of the passed list, in reversed order", async () => {
                var list = await loadlib("list");
                var l1 = [1,2,3,4,5];
                var l2 = await list.reverse(l1);
                expect(l1).to.not.equal(l2);
                expect(l2).to.deep.equal([5,4,3,2,1]);
            });
        });

        describe("text.join(list, separator)", () => {
            
            it("should return a string obtaining by concatenating the list item with interposed separator", async () => {
                var list = await loadlib("list");
                expect(await list.join(["a","b","c"],",")).to.equal("a,b,c");
            });
        });
    });

    describe("http", () => {
        
        describe("http.get(url, options)", () => {
            
            it("should fetch the text at the given url", async () => {
                var http = await loadlib("http");
                var url = "https://raw.githubusercontent.com/onlabsorg/olojs/master/README.md";
                var response = await fetch(url);
                var content = await response.text();
                expect(await http.get(url)).to.equal(content);
            });

            it("should throw an error if the response status is not 2XX", async () => {
                var http = await loadlib("http");
                var url = "https://raw.githubusercontent.com/onlabsorg/olojs/master/NON_EXISTING_FILE";
                try {
                    await http.get(url);
                    throw new Error("it didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("404");
                }
            });
        });        
    });
});
