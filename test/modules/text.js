const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const text = require("../../lib/modules/text")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({text}, presets);
    return await parse(expression)(context);
}



describe("text", () => {

    describe("text.from - function", () => {
        
        it("should return either 'TRUE' or 'FALSE' if the argument is a Bool item", async () => {
            expect(await evaluate("text.from(1==1)")).to.be.Text("TRUE");
            expect(await evaluate("text.from(1!=1)")).to.be.Text("FALSE");
        });
        
        it("should return the stringified decimal if the argument is a Numb item", async () => {
            expect(await evaluate("text.from 123.45")).to.be.Text("123.45");
        });

        it("should return the argument itself if is a Text item", async () => {
            expect(await evaluate("text.from 'abc'")).to.be.Text("abc");
        });

        it("should return '[[List of <n> items]]' if the argument is a List item", async () => {
            expect(await evaluate("text.from [10,20,30]")).to.be.Text("[[List of 3 items]]");
            expect(await evaluate("text.from [10]      ")).to.be.Text("[[List of 1 item]]");
            expect(await evaluate("text.from []        ")).to.be.Text("[[List of 0 items]]");
        });
        
        it("should return '[[Func]]' if the argument is a Func item", async () => {
            expect(await evaluate("text.from(x->x)")).to.be.Text("[[Func]]");
        });
        
        it("should return '[[Undefined <type>]]' if the argument is an Undefined item", async () => {
            const u = new types.Undefined("TestOp")
            expect(await evaluate("text.from(u)", {u})).to.be.Text("[[Undefined TestOp]]");
        });
        
        it("should concatenate the stringified items if the argument is a tuple", async () => {
            expect(await evaluate("text.from(12,'+',10)")).to.be.Text("12+10");
            expect(await evaluate("text.from()         ")).to.be.Text("");
        });
        
        describe("when the argument is a Namespace item NS", () => {
            
            it("should return its comma-separated list of keys, enclosed between curly braces", async () => {
                expect(await evaluate("text.from{k1:1,k2:2,k3:3}")).to.be.Text("{k1, k2, k3}")
            });
            
            it("should return `text.from(NS.__text__)` if `NS.__text__` exists and is not a Func item", async () => {
                expect(await evaluate("text.from{__text__:123}")).to.be.Text("123")
            });
            
            it("should return `text.from(NS.__text__(NS))` if `NS.__text__` is a Func item", async () => {
                expect(await evaluate("text.from{t:456, __text__: self -> self.t}")).to.be.Text("456");
            });
        });
    });

    describe("text.size(string)", () => {

        it("should return the string length", async () => {
            expect(await evaluate("text.size 'abc'")).to.be.Numb(3);
        });
        
        it("should return Undefined Number if the argument is not a string", async () => {
            expect(await evaluate("text.size 123")).to.be.Undefined("Number");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.size('ABC','Defg')")).to.be.Tuple([3,4]);
        });                        
    });

    describe("f = text.find s1", () => {
        
        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("text.find 'Abc'")).to.be.instanceof(types.Func);
            });

            describe("i = f s2 ", () => {
    
                it("should return the first index of s1 in s2", async () => {
                    expect(await evaluate("text.find 'Abc' '__Abc__def__Abc'")).to.be.Numb(2);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("text.find 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                });
    
                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("text.find 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.find 10 'abc'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s2` is not a string", async () => {
                    expect(await evaluate("text.find 'abc' 10")).to.be.Undefined("Text");
                });

                it("should return a tuple of values if `s2` is a tuple", async () => {
                    expect(await evaluate("text.find 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Tuple([2,5]);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should return one `find` function for each item of the argument", async () => {
                const F = await evaluate("text.find('Abc','Def')");
                expect(F).to.be.instanceof(types.Tuple);

                const [f1,f2] = Array.from(F.items());
                expect(f1).to.be.instanceof(types.Func)
                expect(f2).to.be.instanceof(types.Func)
                
                expect(await evaluate("text.find('Abc','Def') '__Abc__def__Def'")).to.be.Tuple([2,12]);
                expect(await evaluate("text.find('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Tuple([2,5,7,-1]);                    
            });
        });    
    });    

    describe("f = text.rfind s1", () => {
        
        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("text.rfind 'Abc'")).to.be.instanceof(types.Func);
            });

            describe("i = f s2 ", () => {
    
                it("should return the last index of s1 in s2", async () => {
                    expect(await evaluate("text.rfind 'Abc' '__Abc__def__Abc'")).to.be.Numb(12);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("text.rfind 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                });
    
                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("text.rfind 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.rfind 10 'abc'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s2` is not a string", async () => {
                    expect(await evaluate("text.rfind 'abc' 10")).to.be.Undefined("Text");
                });

                it("should return a tuple of values if `s2` is a tuple", async () => {
                    expect(await evaluate("text.rfind 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Tuple([12,5]);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should return one `rfind` function for each item of the argument", async () => {
                const F = await evaluate("text.rfind('Abc','Def')");
                expect(F).to.be.instanceof(types.Tuple);

                const [f1,f2] = Array.from(F.items());
                expect(f1).to.be.instanceof(types.Func)
                expect(f2).to.be.instanceof(types.Func)
                
                expect(await evaluate("text.rfind('Abc','Def') '__Abc__Def__Abc'")).to.be.Tuple([12,7]);
                expect(await evaluate("text.rfind('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Tuple([12,5,7,-1]);                    
            });
        });    
    });    

    describe("text.lower - function", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("text.lower 'AbcDef'")).to.be.Text("abcdef");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("text.lower 123")).to.be.Undefined("Text");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.lower('ABC','Def')")).to.be.Tuple(["abc","def"]);
        });                        
    });    

    describe("text.upper - function", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("text.upper 'AbcDef'")).to.be.Text("ABCDEF");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("text.upper 123")).to.be.Undefined("Text");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.upper('abc','Def')")).to.be.Tuple(["ABC","DEF"]);
        });                        
    });    

    describe("s2 = text.trim_head s1", () => {
        
        it("should return `s1` without leading spaces", async () => {
            expect(await evaluate("text.trim_head '   abc   '")).to.be.Text("abc   ");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("text.trim_head 123")).to.be.Undefined("Text");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.trim_head(' abc ',' Def ')")).to.be.Tuple(["abc ","Def "]);
        });                        
    });   

    describe("s2 = text.trim_tail s1", () => {
        
        it("should return `s1` without trailing spaces", async () => {
            expect(await evaluate("text.trim_tail '   abc   '")).to.be.Text("   abc");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("text.trim_tail 123")).to.be.Undefined("Text");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.trim_tail(' abc ',' Def ')")).to.be.Tuple([" abc"," Def"]);
        });                        
    });   

    describe("s2 = text.trim s1", () => {
        
        it("should return `s1` without leading and trailing spaces", async () => {
            expect(await evaluate("text.trim '   abc   '")).to.be.Text("abc");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("text.trim 123")).to.be.Undefined("Text");
        });

        it("should apply to all the items and return a tuple if the argument is a truple", async () => {
            expect(await evaluate("text.trim(' abc ',' Def ')")).to.be.Tuple(["abc","Def"]);
        });                        
    });   

    describe("f = text.head n", () => {

        describe("when n is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("text.head 3")).to.be.instanceof(types.Func);
            });

            describe("s2 = f s1 ", () => {
    
                it("should return the first n characters of s1", async () => {
                    expect(await evaluate("text.head 3 'abcdef'")).to.be.Text('abc');
                });
    
                it("should consider n relative to the end of the string if it is negative", async () => {
                    expect(await evaluate("text.head (-2) 'abcdef'")).to.be.Text('abcd');
                });

                it("should return Undefined Text if `n` is not a number", async () => {
                    expect(await evaluate("text.head 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.head 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("text.head 3 10")).to.be.Undefined("Text");
                });

                it("should return a tuple of values if `s1` is a tuple", async () => {
                    expect(await evaluate("text.head 2 ('abc', 'def', 'ghi')")).to.be.Tuple(['ab','de','gh']);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should return one `f` function for each item of the argument", async () => {
                const F = await evaluate("text.head(2,3)");
                expect(F).to.be.instanceof(types.Tuple);

                const [f1,f2] = Array.from(F.items());
                expect(f1).to.be.instanceof(types.Func)
                expect(f2).to.be.instanceof(types.Func)
                
                expect(await evaluate("text.head(2,3) 'abcdef'")).to.be.Tuple(['ab','abc']);
                expect(await evaluate("text.head(2,3)('abcdef', 'ghijkl')")).to.be.Tuple(['ab','gh','abc','ghi']);                    
            });
        });    
    });              

    describe("f = text.tail n", () => {

        describe("when n is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("text.tail 3")).to.be.instanceof(types.Func);
            });

            describe("s2 = f s1 ", () => {
    
                it("should return the last characters of s1, starting with the n-th", async () => {
                    expect(await evaluate("text.tail 2 'abcdef'")).to.be.Text('cdef');
                });
    
                it("should consider n relative to the end of the string if it is negative", async () => {
                    expect(await evaluate("text.tail (-2) 'abcdef'")).to.be.Text('ef');
                });

                it("should return Undefined Text if `n` is not a number", async () => {
                    expect(await evaluate("text.tail 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.tail 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("text.tail 3 10")).to.be.Undefined("Text");
                });

                it("should return a tuple of values if `s1` is a tuple", async () => {
                    expect(await evaluate("text.tail (-2) ('abc', 'def', 'ghi')")).to.be.Tuple(['bc','ef','hi']);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should return one `f` function for each item of the argument", async () => {
                const F = await evaluate("text.tail(2,3)");
                expect(F).to.be.instanceof(types.Tuple);

                const [f1,f2] = Array.from(F.items());
                expect(f1).to.be.instanceof(types.Func)
                expect(f2).to.be.instanceof(types.Func)
                
                expect(await evaluate("text.tail(-2,-3) 'abcdef'")).to.be.Tuple(['ef','def']);
                expect(await evaluate("text.tail(-2,-3)('abcdef', 'ghijkl')")).to.be.Tuple(['ef','kl','def','jkl']);                    
            });
        });    
    });              

    describe("f = text.split s1", () => {

        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("text.split '::'")).to.be.instanceof(types.Func);
            });

            describe("l = f s2 ", () => {
    
                it("should return the list of the s2 substrings separated by s1", async () => {
                    expect(await evaluate("text.split '::' 'ab::cd::ef'")).to.be.List(["ab","cd","ef"]);
                    expect(await evaluate("text.split '::' 'abcdef'")).to.be.List(["abcdef"]);
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("text.split 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.split 10 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s2` is not a string", async () => {
                    expect(await evaluate("text.split '::' 10")).to.be.Undefined("Text");
                });

                it("should return a tuple of values if `s2` is a tuple", async () => {
                    expect(await evaluate("text.split '::' ('ab::cd', 'de::fg')")).to.be.Tuple([["ab","cd"], ["de","fg"]]);
                });
            });
        });

        describe("when s1 is a tuple", () => {
            
            it("should return one `f` function for each item of the argument", async () => {
                const F = await evaluate("text.split('::','!!')");
                expect(F).to.be.instanceof(types.Tuple);

                const [f1,f2] = Array.from(F.items());
                expect(f1).to.be.instanceof(types.Func)
                expect(f2).to.be.instanceof(types.Func)
                
                expect(await evaluate("text.split('::','!!') 'a!!b::c!!d'")).to.be.Tuple([["a!!b","c!!d"],["a","b::c","d"]]);
                expect(await evaluate("text.split('::','!!')('ab::cd!!ef', 'gh::ij!!kl')")).to.be.Tuple([["ab","cd!!ef"], ["gh","ij!!kl"], ["ab::cd","ef"], ["gh::ij","kl"]]);
            });
        });    
    });              
});
