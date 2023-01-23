
const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const text = require("../../lib/modules/text")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({text}, presets);
    return await parse(expression)(context);
}


describe("text module", () => {

    describe("text.to_numb", () => {

        it("should convert a string representation of a number to a number", async () => {
            expect(await evaluate("text.to_numb '12'")).to.be.Numb(12);
            expect(await evaluate("text.to_numb '-12e1'")).to.be.Numb(-120);
            expect(await evaluate("text.to_numb '0b11'")).to.be.Numb(3);
            expect(await evaluate("text.to_numb '0o33'")).to.be.Numb(27);
            expect(await evaluate("text.to_numb '0xA2'")).to.be.Numb(162);
        });

        it("should return Undefined Number if the argument is not a valid string", async () => {
            expect(await evaluate("text.to_numb 'abc'")).to.be.Undefined("Number");
            expect(await evaluate("text.to_numb 10")).to.be.Undefined("Number");
        });

        it("should apply only to the first item, if the argument is a truple", async () => {
            expect(await evaluate("text.to_numb('10', '0b11', '0o33')")).to.be.Numb(10);
        });
    });

    describe("text.size: text.s -> Numb n", () => {

        it("should return the number of characters of s", async () => {
            expect(await evaluate("text.size 'abc'")).to.be.Numb(3);
        });

        it("should return Undefined Number if the argument is not a text.item", async () => {
            expect(await evaluate("text.size TRUE")).to.be.Undefined("Number");
            expect(await evaluate("text.size 123")).to.be.Undefined("Number");
            expect(await evaluate("text.size(x->x)")).to.be.Undefined("Number");
            expect(await evaluate("text.size([1,2,3])")).to.be.Undefined("Number");
            expect(await evaluate("text.size({x:1})")).to.be.Undefined("Number");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.size('ABC','Defg')")).to.be.Numb(3);
        });
    });

    describe("text.find: Text s1 -> Func f", () => {

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

                it("should return Undefined Number if `s1` is not a string", async () => {
                    expect(await evaluate("text.find 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.find 10 'abc'")).to.be.Undefined("Number");
                });

                it("should return Undefined Number if `s2` is not a string", async () => {
                    expect(await evaluate("text.find 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("text.find 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Numb(2);
                });
            });
        });

        describe("when the argument is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.find('Abc','Def')")).to.be.instanceof(types.Func);
                expect(await evaluate("text.find('Abc','Def') '__Abc__def__Def'")).to.be.Numb(2);
                expect(await evaluate("text.find('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Numb(2);
            });
        });
    });

    describe("text.rfind: Text s1 -> Func f", () => {

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

                it("should return Undefined Number if `s1` is not a string", async () => {
                    expect(await evaluate("text.rfind 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.rfind 10 'abc'")).to.be.Undefined("Number");
                });

                it("should return Undefined Number if `s2` is not a string", async () => {
                    expect(await evaluate("text.rfind 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("text.rfind 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Numb(12);
                });
            });
        });

        describe("when the argument is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.rfind('Abc','Def')")).to.be.instanceof(types.Func);
                expect(await evaluate("text.rfind('Abc','Def') '__Abc__Def__Abc'")).to.be.Numb(12);
                expect(await evaluate("text.rfind('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Numb(12);
            });
        });
    });

    describe("text.lower: Text S -> Text s", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("text.lower 'AbcDef'")).to.be.Text("abcdef");
        });

        it("should return Undefined text.if the argument is not a string", async () => {
            expect(await evaluate("text.lower 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.lower('ABC','Def')")).to.be.Text("abc");
        });
    });

    describe("text.upper: Text s -> Text S", () => {

        it("should return the given string converted to lower case characters", async () => {
            expect(await evaluate("text.upper 'AbcDef'")).to.be.Text("ABCDEF");
        });

        it("should return Undefined text.if the argument is not a string", async () => {
            expect(await evaluate("text.upper 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.upper('abc','Def')")).to.be.Text("ABC");
        });
    });

    describe("text.trim_head: Text _s_ -> Text s_", () => {

        it("should return `_s_` without leading spaces", async () => {
            expect(await evaluate("text.trim_head '   abc   '")).to.be.Text("abc   ");
        });

        it("should return Undefined text.if the argument is not a string", async () => {
            expect(await evaluate("text.trim_head 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.trim_head(' abc ',' Def ')")).to.be.Text("abc ");
        });
    });

    describe("text.trim_tail: Text _s_ -> Text _s", () => {

        it("should return `_s_` without trailing spaces", async () => {
            expect(await evaluate("text.trim_tail '   abc   '")).to.be.Text("   abc");
        });

        it("should return Undefined text.if the argument is not a string", async () => {
            expect(await evaluate("text.trim_tail 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.trim_tail(' abc ',' Def ')")).to.be.Text(" abc");
        });
    });

    describe("text.trim: Text _s_ -> Text s", () => {

        it("should return `_s_` without leading and trailing spaces", async () => {
            expect(await evaluate("text.trim '   abc   '")).to.be.Text("abc");
        });

        it("should return Undefined text.if the argument is not a string", async () => {
            expect(await evaluate("text.trim 123")).to.be.Undefined("Text");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("text.trim(' abc ',' Def ')")).to.be.Text("abc");
        });
    });

    describe("text.head: Numb n -> Func f", () => {

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

                it("should return Undefined text.if `n` is not a number", async () => {
                    expect(await evaluate("text.head 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.head 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined text.if `s1` is not a string", async () => {
                    expect(await evaluate("text.head 3 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("text.head 2 ('abc', 'def', 'ghi')")).to.be.Text('ab');
                });
            });
        });

        describe("when the argument is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.head(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("text.head(2,3) 'abcdef'")).to.be.Text('ab');
                expect(await evaluate("text.head(2,3)('abcdef', 'ghijkl')")).to.be.Text('ab');
            });
        });
    });

    describe("text.tail: Numb n -> Func f", () => {

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

                it("should return Undefined text.if `n` is not a number", async () => {
                    expect(await evaluate("text.tail 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.tail 'abc' 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined text.if `s1` is not a string", async () => {
                    expect(await evaluate("text.tail 3 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("text.tail (-2) ('abc', 'def', 'ghi')")).to.be.Text('bc');
                });
            });
        });

        describe("when the argument is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.tail(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("text.tail(-2,-3) 'abcdef'")).to.be.Text('ef');
                expect(await evaluate("text.tail(-2,-3)('abcdef', 'ghijkl')")).to.be.Text('ef');
            });
        });
    });

    describe("text.split: Text s1 -> Func f", () => {

        describe("when s1 is an item", () => {

            it("should return a function", async () => {
                expect(await evaluate("text.split '::'")).to.be.instanceof(types.Func);
            });

            describe("l = f s2 ", () => {

                it("should return the tuple of the s2 substrings separated by s1", async () => {
                    expect(await evaluate("text.split '::' 'ab::cd::ef'")).to.be.Tuple(["ab","cd","ef"]);
                    expect(await evaluate("text.split '::' 'abcdef'")).to.be.Text("abcdef");
                });

                it("should return Undefined text.if `s1` is not a string", async () => {
                    expect(await evaluate("text.split 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.split 10 'def'")).to.be.Undefined("Text");
                });

                it("should return Undefined text.if `s2` is not a string", async () => {
                    expect(await evaluate("text.split '::' 10")).to.be.Undefined("Text");
                });

                it("should apply only to the first item if the parameter is a tuple", async () => {
                    expect(await evaluate("text.split '::' ('ab::cd', 'de::fg')")).to.be.Tuple(["ab","cd"]);
                });
            });
        });

        describe("when s1 is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.split('::','!!')")).to.be.instanceof(types.Func);
                expect(await evaluate("text.split('::','!!') 'a!!b::c!!d'")).to.be.Tuple(["a!!b","c!!d"]);
                expect(await evaluate("text.split('::','!!')('ab::cd!!ef', 'gh::ij!!kl')")).to.be.Tuple(["ab","cd!!ef"]);
            });
        });
    });

    describe("text.join: Text s -> Func f", () => {

        describe("when s is an item", () => {

            it("should return a function", async () => {
                expect(await evaluate("text.join ':'")).to.be.instanceof(types.Func);
            });

            describe("S = f T ", () => {

                it("should concatenate the text items of T with interposed separator s", async () => {
                    expect(await evaluate("text.join ':' ('aa','bb','cc')")).to.be.Text("aa:bb:cc");
                });

                it("should return Undefined text.if `s` is not a Text item", async () => {
                    expect(await evaluate("text.join 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("text.join 10 ('a','b','c')")).to.be.Undefined("Text");
                });

                it("should stringify any item of `T` which is not a text.item", async () => {
                    expect(await evaluate("text.join ':' ('a',1,'b')")).to.be.Text("a:1:b");
                });
            });
        });

        describe("when the argument is a tuple", () => {

            it("should apply only to the first item", async () => {
                expect(await evaluate("text.join(':','~')")).to.be.instanceof(types.Func);
                expect(await evaluate("text.join(':','~') ('a','b')")).to.be.Text("a:b");
            });
        });
    });
});
