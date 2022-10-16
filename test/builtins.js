const expect = require("./expect");

const types = require("../lib/types");
const builtins = require("../lib/builtins");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));


describe("builtins", () => {
    
    describe("Bool.TRUE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("Bool.TRUE")).to.be.Bool(true);
        });
    });
    
    describe("Bool.FALSE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("Bool.FALSE")).to.be.Bool(false);
        });
    });

    describe("Bool: Term t -> Bool b", () => {
        
        it("should return FALSE if the argument is a falsy term", async () => {
            expect(await evaluate("Bool ()       ")).to.be.Bool(false);
            expect(await evaluate("Bool (1 == 2) ")).to.be.Bool(false);
            expect(await evaluate("Bool 0        ")).to.be.Bool(false);
            expect(await evaluate("Bool ''       ")).to.be.Bool(false);
            expect(await evaluate("Bool []       ")).to.be.Bool(false);
            expect(await evaluate("Bool {}       ")).to.be.Bool(false);
            expect(await evaluate("Bool ('a'/'b')")).to.be.Bool(false);
            expect(await evaluate("Bool (0,'',[])")).to.be.Bool(false);
        });

        it("should return TRUE if the argument is a truty term", async () => {
            expect(await evaluate("Bool (x->x)   ")).to.be.Bool(true);
            expect(await evaluate("Bool (1 == 1) ")).to.be.Bool(true);
            expect(await evaluate("Bool 10       ")).to.be.Bool(true);
            expect(await evaluate("Bool 'abc'    ")).to.be.Bool(true);
            expect(await evaluate("Bool [1,2,3]  ")).to.be.Bool(true);
            expect(await evaluate("Bool {a:1}    ")).to.be.Bool(true);
            expect(await evaluate("Bool (1,'',[])")).to.be.Bool(true);
        });
    });
    
    describe("Bool.not: Term t -> Bool b", () => {
        
        it("should return TRUE if the argument is a falsy term", async () => {
            expect(await evaluate("Bool.not ()       ")).to.be.Bool(true);
            expect(await evaluate("Bool.not (1 == 2) ")).to.be.Bool(true);
            expect(await evaluate("Bool.not 0        ")).to.be.Bool(true);
            expect(await evaluate("Bool.not ''       ")).to.be.Bool(true);
            expect(await evaluate("Bool.not []       ")).to.be.Bool(true);
            expect(await evaluate("Bool.not {}       ")).to.be.Bool(true);
            expect(await evaluate("Bool.not ('a'/'b')")).to.be.Bool(true);
            expect(await evaluate("Bool.not (0,'',[])")).to.be.Bool(true);
        });

        it("should return FALSE if the argument is a truty term", async () => {
            expect(await evaluate("Bool.not (x->x)   ")).to.be.Bool(false);
            expect(await evaluate("Bool.not (1 == 1) ")).to.be.Bool(false);
            expect(await evaluate("Bool.not 10       ")).to.be.Bool(false);
            expect(await evaluate("Bool.not 'abc'    ")).to.be.Bool(false);
            expect(await evaluate("Bool.not [1,2,3]  ")).to.be.Bool(false);
            expect(await evaluate("Bool.not {a:1}    ")).to.be.Bool(false);
            expect(await evaluate("Bool.not (1,'',[])")).to.be.Bool(false);
        });
    }); 
    
    describe("Numb.parse", () => {
        
        it("should convert a string representation of a number to a number", async () => {
            expect(await evaluate("Numb.parse '12'")).to.be.Numb(12);
            expect(await evaluate("Numb.parse '-12e1'")).to.be.Numb(-120);
            expect(await evaluate("Numb.parse '0b11'")).to.be.Numb(3);
            expect(await evaluate("Numb.parse '0o33'")).to.be.Numb(27);
            expect(await evaluate("Numb.parse '0xA2'")).to.be.Numb(162);
        });
        
        it("should return Undefined Number if the argument is not a valid string", async () => {
            expect(await evaluate("Numb.parse 'abc'")).to.be.Undefined("Number");
            expect(await evaluate("Numb.parse 10")).to.be.Undefined("Number");
        });

        it("should apply only to the first item, if the argument is a truple", async () => {
            expect(await evaluate("Numb.parse('10', '0b11', '0o33')")).to.be.Numb(10);
        });                    
    });           
    
    describe("Text: Term t -> Text s", () => {
        
        it("should return either 'TRUE' or 'FALSE' if the argument is a Bool item", async () => {
            expect(await evaluate("Text(1==1)")).to.be.Text("TRUE");
            expect(await evaluate("Text(1!=1)")).to.be.Text("FALSE");
        });
        
        it("should return the stringified decimal if the argument is a Numb item", async () => {
            expect(await evaluate("Text 123.45")).to.be.Text("123.45");
        });

        it("should return the argument itself if is a Text item", async () => {
            expect(await evaluate("Text 'abc'")).to.be.Text("abc");
        });

        it("should return '[[List of <n> items]]' if the argument is a List item", async () => {
            expect(await evaluate("Text [10,20,30]")).to.be.Text("[[List of 3 items]]");
            expect(await evaluate("Text [10]      ")).to.be.Text("[[List of 1 item]]");
            expect(await evaluate("Text []        ")).to.be.Text("[[List of 0 items]]");
        });
        
        it("should return '[[Func]]' if the argument is a Func item", async () => {
            expect(await evaluate("Text(x->x)")).to.be.Text("[[Func]]");
        });
        
        it("should return '[[Undefined <type>]]' if the argument is an Undefined item", async () => {
            const u = new types.Undefined("TestOp")
            expect(await evaluate("Text(u)", {u})).to.be.Text("[[Undefined TestOp]]");
        });
        
        it("should concatenate the stringified items if the argument is a tuple", async () => {
            expect(await evaluate("Text(12,'+',10)")).to.be.Text("12+10");
            expect(await evaluate("Text()         ")).to.be.Text("");
        });
        
        describe("when the argument is a Namespace item NS", () => {
            
            it("should return '[[Namespace of n items]]' if no __str__ name is defined", async () => {
                expect(await evaluate("Text{k1:1,k2:2,k3:3}")).to.be.Text("[[Namespace of 3 items]]");
                expect(await evaluate("Text{k1:1          }")).to.be.Text("[[Namespace of 1 item]]");
                expect(await evaluate("Text{              }")).to.be.Text("[[Namespace of 0 items]]");
            });
            
            it("should return `NS.__text__` if `NS.__text__` is a Text item", async () => {
                expect(await evaluate("Text{t:456, __text__: 'abc'}")).to.be.Text("abc");
                expect(await evaluate("Text{t:456, __text__: 457}")).to.be.Text("[[Namespace of 2 items]]");
            });
        });
    });
    
    describe("Text.size: Text s -> Numb n", () => {
        
        it("should return the number of characters of s", async () => {
            expect(await evaluate("Text.size 'abc'")).to.be.Numb(3);
        });
        
        it("should return Undefined Number if the argument is not a Text item", async () => {
            expect(await evaluate("Text.size TRUE")).to.be.Undefined("Number");
            expect(await evaluate("Text.size 123")).to.be.Undefined("Number");
            expect(await evaluate("Text.size(x->x)")).to.be.Undefined("Number");
            expect(await evaluate("Text.size([1,2,3])")).to.be.Undefined("Number");
            expect(await evaluate("Text.size({x:1})")).to.be.Undefined("Number");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.size('ABC','Defg')")).to.be.Numb(3);
        });                        
    });

    describe("Text.enum: Text s -> Tuple c", () => {
        
        it("should return the tuple of characters of s", async () => {
            expect(await evaluate("Text.enum 'abc'")).to.be.Tuple(['a','b','c']);
        });
        
        it("should return Undefined Term if the argument is not a Text item", async () => {
            expect(await evaluate("Text.enum TRUE")).to.be.Undefined("Term");
            expect(await evaluate("Text.enum 123")).to.be.Undefined("Term");
            expect(await evaluate("Text.enum(x->x)")).to.be.Undefined("Term");
            expect(await evaluate("Text.enum([1,2,3])")).to.be.Undefined("Term");
            expect(await evaluate("Text.enum({x:1})")).to.be.Undefined("Term");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.enum('ABC','Defg')")).to.be.Tuple(['A','B','C']);
        });                        
    });

    describe("Text.find: Text s1 -> Func f", () => {
        
        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("Text.find 'Abc'")).to.be.instanceof(types.Func);
            });

            describe("i = f s2 ", () => {
    
                it("should return the first index of s1 in s2", async () => {
                    expect(await evaluate("Text.find 'Abc' '__Abc__def__Abc'")).to.be.Numb(2);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("Text.find 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                });
    
                it("should return Undefined Number if `s1` is not a string", async () => {
                    expect(await evaluate("Text.find 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.find 10 'abc'")).to.be.Undefined("Number");
                });

                it("should return Undefined Number if `s2` is not a string", async () => {
                    expect(await evaluate("Text.find 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("Text.find 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Numb(2);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.find('Abc','Def')")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.find('Abc','Def') '__Abc__def__Def'")).to.be.Numb(2);
                expect(await evaluate("Text.find('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Numb(2);                    
            });
        });    
    });    

    describe("Text.rfind: Text s1 -> Func f", () => {
        
        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("Text.rfind 'Abc'")).to.be.instanceof(types.Func);
            });

            describe("i = f s2 ", () => {
    
                it("should return the last index of s1 in s2", async () => {
                    expect(await evaluate("Text.rfind 'Abc' '__Abc__def__Abc'")).to.be.Numb(12);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("Text.rfind 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                });
    
                it("should return Undefined Number if `s1` is not a string", async () => {
                    expect(await evaluate("Text.rfind 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.rfind 10 'abc'")).to.be.Undefined("Number");
                });

                it("should return Undefined Number if `s2` is not a string", async () => {
                    expect(await evaluate("Text.rfind 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("Text.rfind 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Numb(12);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.rfind('Abc','Def')")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.rfind('Abc','Def') '__Abc__Def__Abc'")).to.be.Numb(12);
                expect(await evaluate("Text.rfind('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Numb(12);
            });
        });    
    });    

    describe("Text.lower: Text S -> Text s", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("Text.lower 'AbcDef'")).to.be.Text("abcdef");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("Text.lower 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.lower('ABC','Def')")).to.be.Text("abc");
        });                        
    });    

    describe("Text.upper: Text s -> Text S", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("Text.upper 'AbcDef'")).to.be.Text("ABCDEF");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("Text.upper 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.upper('abc','Def')")).to.be.Text("ABC");
        });                        
    });    

    describe("Text.trim_head: Text _s_ -> Text s_", () => {
        
        it("should return `_s_` without leading spaces", async () => {
            expect(await evaluate("Text.trim_head '   abc   '")).to.be.Text("abc   ");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("Text.trim_head 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.trim_head(' abc ',' Def ')")).to.be.Text("abc ");
        });                        
    });   

    describe("Text.trim_tail: Text _s_ -> Text _s", () => {
        
        it("should return `_s_` without trailing spaces", async () => {
            expect(await evaluate("Text.trim_tail '   abc   '")).to.be.Text("   abc");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("Text.trim_tail 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.trim_tail(' abc ',' Def ')")).to.be.Text(" abc");
        });                        
    });   

    describe("Text.trim: Text _s_ -> Text s", () => {
        
        it("should return `_s_` without leading and trailing spaces", async () => {
            expect(await evaluate("Text.trim '   abc   '")).to.be.Text("abc");
        });
        
        it("should return Undefined Text if the argument is not a string", async () => {
            expect(await evaluate("Text.trim 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Text.trim(' abc ',' Def ')")).to.be.Text("abc");
        });                        
    });   

    describe("Text.head: Numb n -> Func f", () => {

        describe("when n is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("Text.head 3")).to.be.instanceof(types.Func);
            });

            describe("s2 = f s1 ", () => {
    
                it("should return the first n characters of s1", async () => {
                    expect(await evaluate("Text.head 3 'abcdef'")).to.be.Text('abc');
                });
    
                it("should consider n relative to the end of the string if it is negative", async () => {
                    expect(await evaluate("Text.head (-2) 'abcdef'")).to.be.Text('abcd');
                });

                it("should return Undefined Text if `n` is not a number", async () => {
                    expect(await evaluate("Text.head 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.head 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("Text.head 3 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("Text.head 2 ('abc', 'def', 'ghi')")).to.be.Text('ab');
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.head(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.head(2,3) 'abcdef'")).to.be.Text('ab');
                expect(await evaluate("Text.head(2,3)('abcdef', 'ghijkl')")).to.be.Text('ab');                    
            });
        });    
    });              

    describe("Text.tail: Numb n -> Func f", () => {

        describe("when n is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("Text.tail 3")).to.be.instanceof(types.Func);
            });

            describe("s2 = f s1 ", () => {
    
                it("should return the last characters of s1, starting with the n-th", async () => {
                    expect(await evaluate("Text.tail 2 'abcdef'")).to.be.Text('cdef');
                });
    
                it("should consider n relative to the end of the string if it is negative", async () => {
                    expect(await evaluate("Text.tail (-2) 'abcdef'")).to.be.Text('ef');
                });

                it("should return Undefined Text if `n` is not a number", async () => {
                    expect(await evaluate("Text.tail 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.tail 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("Text.tail 3 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("Text.tail (-2) ('abc', 'def', 'ghi')")).to.be.Text('bc');
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.tail(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.tail(-2,-3) 'abcdef'")).to.be.Text('ef');
                expect(await evaluate("Text.tail(-2,-3)('abcdef', 'ghijkl')")).to.be.Text('ef');                    
            });
        });    
    });              

    describe("Text.split: Text s1 -> Func f", () => {

        describe("when s1 is an item", () => {
            
            it("should return a function", async () => {
                expect(await evaluate("Text.split '::'")).to.be.instanceof(types.Func);
            });

            describe("l = f s2 ", () => {
    
                it("should return the tuple of the s2 substrings separated by s1", async () => {
                    expect(await evaluate("Text.split '::' 'ab::cd::ef'")).to.be.Tuple(["ab","cd","ef"]);
                    expect(await evaluate("Text.split '::' 'abcdef'")).to.be.Text("abcdef");
                });

                it("should return Undefined Text if `s1` is not a string", async () => {
                    expect(await evaluate("Text.split 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.split 10 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined Text if `s2` is not a string", async () => {
                    expect(await evaluate("Text.split '::' 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("Text.split '::' ('ab::cd', 'de::fg')")).to.be.Tuple(["ab","cd"]);
                });
            });
        });

        describe("when s1 is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.split('::','!!')")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.split('::','!!') 'a!!b::c!!d'")).to.be.Tuple(["a!!b","c!!d"]);
                expect(await evaluate("Text.split('::','!!')('ab::cd!!ef', 'gh::ij!!kl')")).to.be.Tuple(["ab","cd!!ef"]);
            });
        });    
    });   
    
    describe("Text.join: Text s -> Func f", () => {
    
        describe("when s is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("Text.join ':'")).to.be.instanceof(types.Func);
            });
    
            describe("S = f T ", () => {
    
                it("should concatenate the text items of T with interposed separator s", async () => {
                    expect(await evaluate("Text.join ':' ('aa','bb','cc')")).to.be.Text("aa:bb:cc");
                });
    
                it("should return Undefined Text if `s` is not a Text item", async () => {
                    expect(await evaluate("Text.join 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("Text.join 10 ('a','b','c')")).to.be.Undefined("Text");
                });
    
                it("should stringify any item of `T` which is not a Text item", async () => {
                    expect(await evaluate("Text.join ':' ('a',1,'b')")).to.be.Text("a:1:b");
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("Text.join(':','~')")).to.be.instanceof(types.Func);
                expect(await evaluate("Text.join(':','~') ('a','b')")).to.be.Text("a:b");
            });
        });    
    });                                
    
    describe("List.size: List l -> Numb n", () => {
        
        it("should return the number of items of l", async () => {
            expect(await evaluate("List.size [10,20,30]")).to.be.Numb(3);
        });
        
        it("should return Undefined Number if the argument is not a mapping", async () => {
            expect(await evaluate("List.size TRUE")).to.be.Undefined("Number");
            expect(await evaluate("List.size 123")).to.be.Undefined("Number");
            expect(await evaluate("List.size(x->x)")).to.be.Undefined("Number");
            expect(await evaluate("List.size('abc')")).to.be.Undefined("Number");
            expect(await evaluate("List.size({x:1})")).to.be.Undefined("Number");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("List.size([1,2,3],[4,5])")).to.be.Numb(3);
        });                        
    });

    describe("List.reverse: List L1 -> List L2", () => {

        it("should return a new array with the items of L in reversed order", async () => {
            expect(await evaluate("List.reverse [1,2,3]")).to.be.List([3,2,1]);
        });
        
        it("should return Undefined List if the argument is not a List", async () => {
            expect(await evaluate("List.reverse 123")).to.be.Undefined("List");
        });

        it("should apply only to the first item, if the parameter is a tuple", async () => {
            expect(await evaluate("List.reverse([1,2,3],[4,5,6])")).to.be.List([3,2,1]);
        });                        
    });

    describe("List.find: Item x -> Func f", () => {
        
        describe("when the argument is an item", () => {
            it("should return a function", async () => {
                expect(await evaluate("List.find 123")).to.be.instanceof(types.Func);
            });

            describe("i = f L ", () => {

                it("should return the first index of x in L", async () => {
                    expect(await evaluate("List.find 20 [10,20,30,20,10]")).to.be.Numb(1);
                });

                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("List.find 10 [1,2,3]")).to.be.Numb(-1);
                });

                it("should return Undefined Number if `L` is not a list", async () => {
                    expect(await evaluate("List.find 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("List.find 7 ([1,7,8,7,5], [6,8,8,7,7])")).to.be.Numb(1);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                const F = await evaluate("List.find(10,20)");
                expect(F).to.be.instanceof(types.Func);
                expect(await evaluate("List.find(8,2) [1,8,2,2]")).to.be.Numb(1);
                expect(await evaluate("List.find(8,2)([1,8,2,2], [0,1,8,1])")).to.be.Numb(1);
            });
        });    
    });    

    describe("List.rfind: Item x -> Func f", () => {
    
        describe("when s1 is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("List.rfind 123")).to.be.instanceof(types.Func);
            });
    
            describe("i = f L ", () => {
    
                it("should return the las index of x in L", async () => {
                    expect(await evaluate("List.rfind 20 [10,20,30,20,10]")).to.be.Numb(3);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("List.rfind 10 [1,2,3]")).to.be.Numb(-1);
                });
    
                it("should return Undefined Number if `L` is not a list", async () => {
                    expect(await evaluate("List.rfind 'abc' 10")).to.be.Undefined("Number");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("List.rfind 7 ([1,7,8,7,5], [6,8,8,7,7])")).to.be.Numb(3);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("List.rfind(10,20)")).to.be.instanceof(types.Func);
                expect(await evaluate("List.rfind(1,2) [1,1,2,2]")).to.be.Numb(1);
                expect(await evaluate("List.rfind(1,2)([1,1,2,2], [0,1,0,1])")).to.be.Numb(1);                    
            });
        });    
    });    
    
    describe("List.head: Numb n -> Func f", () => {
    
        describe("when n is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("List.head 3")).to.be.instanceof(types.Func);
            });
    
            describe("l = f L ", () => {
    
                it("should return the first n items of L", async () => {
                    expect(await evaluate("List.head 3 [1,2,3,4,5,6]")).to.be.List([1,2,3]);
                });
    
                it("should consider negative indices as relative to the end of the list", async () => {
                    expect(await evaluate("List.head (-2) [1,2,3,4,5,6]")).to.be.List([1,2,3,4]);
                });
    
                it("should return Undefined List if `n` is not a number", async () => {
                    expect(await evaluate("List.head 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("List.head 'abc' [1,2,3]")).to.be.Undefined("List");
                });
    
                it("should return Undefined List if `L` is not a List item", async () => {
                    expect(await evaluate("List.head 3 10")).to.be.Undefined("List");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("List.head 2 ([1,2,3], [4,5,6])")).to.be.List([1,2]);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should return one `f` function for each item of the argument", async () => {
                expect(await evaluate("List.head(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("List.head(2,3) [1,2,3,4]")).to.be.List([1,2]);
                expect(await evaluate("List.head(2,3)([1,2,3,4],[5,6,7,8])")).to.be.List([1,2]);
            });
        });    
    });              
    
    describe("List.tail: Numb n -> Func f", () => {
    
        describe("when n is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("List.tail 3")).to.be.instanceof(types.Func);
            });
    
            describe("l = f L ", () => {
    
                it("should return the last items of L, starting with the n-th", async () => {
                    expect(await evaluate("List.tail 2 [1,2,3,4,5,6]")).to.be.List([3,4,5,6]);
                });
    
                it("should consider negative indices as relative to the end of the list", async () => {
                    expect(await evaluate("List.tail (-2) [1,2,3,4,5,6]")).to.be.List([5,6]);
                });
    
                it("should return Undefined List if `n` is not a number", async () => {
                    expect(await evaluate("List.tail 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("List.tail 'abc' [1,2,3]")).to.be.Undefined("List");
                });
    
                it("should return Undefined List if `L` is not a List item", async () => {
                    expect(await evaluate("List.tail 3 10")).to.be.Undefined("List");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("List.tail (-2) ([1,2,3], [4,5,6])")).to.be.List([2,3]);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("List.tail(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("List.tail(-2,-3) [1,2,3,4]")).to.be.List([3,4]);
                expect(await evaluate("List.tail(-2,-3)([1,2,3,4],[5,6,7,8])")).to.be.List([3,4]);                    
            });
        });    
    });              
    
    describe("type: Item x -> Text t", () => {
        
        it("should return the type name of the passed item", async () => {
            expect(await evaluate("type(1==1)")).to.be.Text("Bool");
            expect(await evaluate("type 10   ")).to.be.Text("Numb");
            expect(await evaluate("type 'abc'")).to.be.Text("Text");
            expect(await evaluate("type [10] ")).to.be.Text("List");
            expect(await evaluate("type {a:1}")).to.be.Text("Namespace");
            expect(await evaluate("type(x->x)")).to.be.Text("Func");
            expect(await evaluate("type(2*[])")).to.be.Text("Undefined");
        });
        
        it("should return a tuple of strings if the argument is a tuple", async () => {
            expect(await evaluate("type(10,'abc',[])")).to.be.Tuple(["Numb","Text","List"]);
            expect(await evaluate("type()")).to.be.Tuple([]);
        });
    
    });    
    
    describe("Namespace.names: Namespace ns -> Tuple t", () => {
        
        it("should return the tuple of names contained in ns", async () => {
            expect(await evaluate("Namespace.names {a:2,b:4,c:6}")).to.be.Tuple(['a','b','c']);
        });

        it("should return Undefined Term if the argument is not a Namespace item", async () => {
            expect(await evaluate("Namespace.names TRUE")).to.be.Undefined("Term");
            expect(await evaluate("Namespace.names 123")).to.be.Undefined("Term");
            expect(await evaluate("Namespace.names(x->x)")).to.be.Undefined("Term");
            expect(await evaluate("Namespace.names('abc')")).to.be.Undefined("Term");
            expect(await evaluate("Namespace.names([1,2,3])")).to.be.Undefined("Term");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Namespace.names({a:1,b:2},{c:3})")).to.be.Tuple(['a','b']);
        });                        
    });

    describe("Numb.tuple: Numb n -> Numb Tuple r", () => {
        
        it("should return a tuple of integer numbers between 0 and n (excluded)", async () => {
            expect(await evaluate("Numb.tuple 4")).to.be.Tuple([0,1,2,3]);
            expect(await evaluate("Numb.tuple 4.1")).to.be.Tuple([0,1,2,3,4]);
        });
        
        it("should return Undefined Tuple if n is not a Numb item", async () => {
            expect(await evaluate("Numb.tuple 'abc'")).to.be.Undefined("Tuple");
        });
        
        it("should apply only to the first item if n is a tuple", async () => {
            expect(await evaluate("Numb.tuple(4,2)")).to.be.Tuple([0,1,2,3]);
        });
    });
    
    describe("Namespace.size: Namespace ns -> Numb n", () => {
        
        it("should return the number of name:value pairs contained in ns", async () => {
            expect(await evaluate("Namespace.size {a:2,b:4,c:6}")).to.be.Numb(3);
        });

        it("should return Undefined Number if the argument is not a Namespace", async () => {
            expect(await evaluate("Namespace.size TRUE")).to.be.Undefined("Number");
            expect(await evaluate("Namespace.size 123")).to.be.Undefined("Number");
            expect(await evaluate("Namespace.size(x->x)")).to.be.Undefined("Number");
            expect(await evaluate("Namespace.size('abc')")).to.be.Undefined("Number");
            expect(await evaluate("Namespace.size([1,2,3])")).to.be.Undefined("Number");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("Namespace.size({a:10,b:20},{c:30})")).to.be.Numb(2);
        });                        
    });

    describe("Namespace.parent: Namespace x -> Namespace p", () => {
        
        it("should return the prototype of x", async () => {
            const presets = {p:{x:10}};
            presets.c = Object.create(presets.p);
            expect(await evaluate("Namespace.parent c", presets)).to.be.Namespace(presets.p);
        });

        it("should return Undefined Namespace if x has no prototype", async () => {
            const presets = { o: Object.create(null) };
            expect(await evaluate("Namespace.parent o", presets)).to.be.Undefined("Namespace");
        });

        it("should return Undefined Namespace if x is not a namespace", async () => {
            expect(await evaluate("Namespace.parent 123")).to.be.Undefined("Namespace");
        });

        it("should apply only to the first item if x is a tuple", async () => {
            const presets = {p1:{x:10}, p2:{y:20}};
            presets.c1 = Object.create(presets.p1);
            presets.c2 = Object.create(presets.p2);
            expect(await evaluate("Namespace.parent(c1,c2)", presets)).to.be.Namespace(presets.p1);
        });
    });

    describe("Namespace.own: Namespace x -> Namespace o", () => {
        
        it("should return the own namespace of x", async () => {
            const presets = {p:{x:10}};
            presets.c = Object.create(presets.p);
            presets.c.y = 20;
            expect(await evaluate("Namespace.own c", presets)).to.be.Namespace({y:20});
            expect(await evaluate("Namespace.parent(Namespace.own c)", presets)).to.be.Undefined("Namespace");
        });

        it("should return Undefined Namespace if x is not a namespace", async () => {
            expect(await evaluate("Namespace.own 123")).to.be.Undefined("Namespace");
        });

        it("should apply only to the first item if x is a tuple", async () => {
            const presets = {p1:{x:10}, p2:{y:20}};
            presets.c1 = Object.create(presets.p1);
            presets.c1.z1 = 30; 
            presets.c2 = Object.create(presets.p2);
            presets.c2.z2 = 30;
            expect(await evaluate("Namespace.own(c1,c2)", presets)).to.be.Namespace({z1:30});
        });
    });
    
    describe("Func.ID: Term t -> Term t", () => {
        
        it("should return the passed term unchanged", async () => {
            expect(await evaluate("Func.ID 'xxx'")).to.be.Text('xxx');
            expect(await evaluate("Func.ID('xxx',123,[])")).to.be.Tuple(['xxx',123,[]]);
        });
    }); 

    describe("Undefined: Tuple t -> Undefined u", () => {
        
        it("should return and Undefined data type", async () => {
            expect(await evaluate("Undefined('Test',1,2)")).to.be.Undefined("Test", (...args) => {
                expect(args.length).to.equal(2);
                expect(args[0]).to.equal(1);
                expect(args[1]).to.equal(2);
            })
        });
    });    
    
    describe("Undefined.type: Undefined u -> Text t", () => {
        
        it("should return the type of the passed Undefined item", async () => {
            expect(await evaluate("Undefined.type(Undefined 'test-undef')")).to.be.Text('test-undef');
        });

        it("should return Undefined Undefined if the passed item is not undefined", async () => {
            expect(await evaluate("Undefined.type 10")).to.be.Undefined('Undefined');            
        });
    }); 
    
    describe("Undefined.args: Undefined u -> Tuple t", () => {
        
        it("should return the arguments Tuple of the passed Undefined item", async () => {
            expect(await evaluate("Undefined.args(Undefined('test-undef', 1, 2, 33))")).to.be.Tuple([1,2,33]);
        });

        it("should return Undefined Undefined if the passed item is not undefined", async () => {
            expect(await evaluate("Undefined.args 10")).to.be.Undefined('Term');            
        });
    }); 
    
    describe("require: Text id -> Namespace m", () => {
        
        it("should return the standard library module identified by the passed module id", async () => {
            
            // Test content
            const time1 = require("../lib/modules/time")(types);
            const time2 = await evaluate("require 'time'");
            expect(time2).to.be.instanceof(types.Namespace);
            for (let key in time1) {
                expect(typeof time1[key]).to.equal(typeof time2.vget(key));
            }
            
            // Test in action
            expect(await evaluate("require 'math' .max (1,22,3,4) ")).to.be.Numb(22);
            expect(await evaluate("require 'time' .to_ISO_string 1639513675.900")).to.be.Text("2021-12-14T20:27:55.900Z");
            expect(await evaluate("require 'dict' .isDict(10)")).to.be.Bool(false);
            expect(await evaluate("type(require 'debug' .log [])")).to.be.Text("Text");
            expect(await evaluate("type(require 'path' .join)")).to.be.Text("Func");
        });
    });
    
    describe("this", () => {
        
        it("should return the current context", async () => {
            expect(await evaluate("x=10, this.x")).to.be.Numb(10);
            expect(await evaluate("x=10, {x=20, y=this.x}.y")).to.be.Numb(20);
            expect(await evaluate("x=10, {x=20}.this.x")).to.be.Numb(20);
            expect(await evaluate("x=10, {y=20}.this.x")).to.be.Numb(10);
            expect(await evaluate("x=10, {x=20}.this 'x'")).to.be.Numb(20);
            expect(await evaluate("x=10, {y=20}.this 'x'")).to.be.Undefined('Mapping', (arg) => {
                expect(arg).to.equal("x");
            });
            expect(await evaluate("__apply__ = (n) -> 2*n, this 10")).to.be.Numb(20);            
            expect(await evaluate("z=30, Namespace.names({x:10, y:20}.this)")).to.be.Tuple(['x', 'y'])
        });
    });
});
