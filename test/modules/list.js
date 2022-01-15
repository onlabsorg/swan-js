const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const list = require("../../lib/modules/list")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({list}, presets);
    return await parse(expression)(context);
}



describe("list", () => {

    describe("n = list.size L", () => {

        it("should return the number of items of the list", async () => {
            expect(await evaluate("list.size [1,2,3]")).to.be.Numb(3);            
        });
                
        it("should return Undefined Number if the argument is not a List item", async () => {
            expect(await evaluate("list.size 123")).to.be.Undefined("Number");
        });
        
        it("should apply only to the first item, if the parameter is a tuple", async () => {
            expect(await evaluate("list.size ([1,2,3], [4,5])")).to.be.Numb(3);                        
        });
    });

    describe("L2 = list.reverse L1", () => {

        it("should return a new array with the items of L in reversed order", async () => {
            expect(await evaluate("list.reverse [1,2,3]")).to.be.List([3,2,1]);
        });
        
        it("should return Undefined List if the argument is not a List", async () => {
            expect(await evaluate("list.reverse 123")).to.be.Undefined("List");
        });

        it("should apply only to the first item, if the parameter is a tuple", async () => {
            expect(await evaluate("list.reverse([1,2,3],[4,5,6])")).to.be.List([3,2,1]);
        });                        
    });

    describe("f = list.find x", () => {
        
        describe("when the argument is an item", () => {
            it("should return a function", async () => {
                expect(await evaluate("list.find 123")).to.be.instanceof(types.Func);
            });

            describe("i = f L ", () => {

                it("should return the first index of x in L", async () => {
                    expect(await evaluate("list.find 20 [10,20,30,20,10]")).to.be.Numb(1);
                });

                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("list.find 10 [1,2,3]")).to.be.Numb(-1);
                });

                it("should return Undefined Number if `L` is not a list", async () => {
                    expect(await evaluate("list.find 'abc' 10")).to.be.Undefined("Number");
                });

                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.find 7 ([1,7,8,7,5], [6,8,8,7,7])")).to.be.Numb(1);
                });
            });
        });

        describe("when the argument is a tuple", () => {
            
            it("should apply only to the first item", async () => {
                const F = await evaluate("list.find(10,20)");
                expect(F).to.be.instanceof(types.Func);
                expect(await evaluate("list.find(8,2) [1,8,2,2]")).to.be.Numb(1);
                expect(await evaluate("list.find(8,2)([1,8,2,2], [0,1,8,1])")).to.be.Numb(1);
            });
        });    
    });    

    describe("f = list.rfind s1", () => {
    
        describe("when s1 is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("list.rfind 123")).to.be.instanceof(types.Func);
            });
    
            describe("i = f L ", () => {
    
                it("should return the las index of x in L", async () => {
                    expect(await evaluate("list.rfind 20 [10,20,30,20,10]")).to.be.Numb(3);
                });
    
                it("should return -1 if no match is found", async () => {
                    expect(await evaluate("list.rfind 10 [1,2,3]")).to.be.Numb(-1);
                });
    
                it("should return Undefined Number if `L` is not a list", async () => {
                    expect(await evaluate("list.rfind 'abc' 10")).to.be.Undefined("Number");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.rfind 7 ([1,7,8,7,5], [6,8,8,7,7])")).to.be.Numb(3);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("list.rfind(10,20)")).to.be.instanceof(types.Func);
                expect(await evaluate("list.rfind(1,2) [1,1,2,2]")).to.be.Numb(1);
                expect(await evaluate("list.rfind(1,2)([1,1,2,2], [0,1,0,1])")).to.be.Numb(1);                    
            });
        });    
    });    
    
    describe("f = list.head n", () => {
    
        describe("when n is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("list.head 3")).to.be.instanceof(types.Func);
            });
    
            describe("l = f L ", () => {
    
                it("should return the first n items of L", async () => {
                    expect(await evaluate("list.head 3 [1,2,3,4,5,6]")).to.be.List([1,2,3]);
                });
    
                it("should consider negative indices as relative to the end of the list", async () => {
                    expect(await evaluate("list.head (-2) [1,2,3,4,5,6]")).to.be.List([1,2,3,4]);
                });
    
                it("should return Undefined List if `n` is not a number", async () => {
                    expect(await evaluate("list.head 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("list.head 'abc' [1,2,3]")).to.be.Undefined("List");
                });
    
                it("should return Undefined List if `L` is not a List item", async () => {
                    expect(await evaluate("list.head 3 10")).to.be.Undefined("List");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.head 2 ([1,2,3], [4,5,6])")).to.be.List([1,2]);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should return one `f` function for each item of the argument", async () => {
                expect(await evaluate("list.head(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("list.head(2,3) [1,2,3,4]")).to.be.List([1,2]);
                expect(await evaluate("list.head(2,3)([1,2,3,4],[5,6,7,8])")).to.be.List([1,2]);
            });
        });    
    });              
    
    describe("f = list.tail n", () => {
    
        describe("when n is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("list.tail 3")).to.be.instanceof(types.Func);
            });
    
            describe("l = f L ", () => {
    
                it("should return the last items of L, starting with the n-th", async () => {
                    expect(await evaluate("list.tail 2 [1,2,3,4,5,6]")).to.be.List([3,4,5,6]);
                });
    
                it("should consider negative indices as relative to the end of the list", async () => {
                    expect(await evaluate("list.tail (-2) [1,2,3,4,5,6]")).to.be.List([5,6]);
                });
    
                it("should return Undefined List if `n` is not a number", async () => {
                    expect(await evaluate("list.tail 'abc'")).to.be.instanceof(types.Func);
                    expect(await evaluate("list.tail 'abc' [1,2,3]")).to.be.Undefined("List");
                });
    
                it("should return Undefined List if `L` is not a List item", async () => {
                    expect(await evaluate("list.tail 3 10")).to.be.Undefined("List");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.tail (-2) ([1,2,3], [4,5,6])")).to.be.List([2,3]);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("list.tail(2,3)")).to.be.instanceof(types.Func);
                expect(await evaluate("list.tail(-2,-3) [1,2,3,4]")).to.be.List([3,4]);
                expect(await evaluate("list.tail(-2,-3)([1,2,3,4],[5,6,7,8])")).to.be.List([3,4]);                    
            });
        });    
    });              
    
    describe("f = list.join s", () => {
    
        describe("when s is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("list.join ':'")).to.be.instanceof(types.Func);
            });
    
            describe("S = f L ", () => {
    
                it("should concatenate the text items of L with interposed separator s", async () => {
                    expect(await evaluate("list.join ':' ['aa','bb','cc']")).to.be.Text("aa:bb:cc");
                });
    
                it("should return Undefined Text if `s` is not a Text item", async () => {
                    expect(await evaluate("list.join 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("list.join 10 ['a','b','c']")).to.be.Undefined("Text");
                });
    
                it("should return Undefined Text if any item of `L` is not a Text item", async () => {
                    expect(await evaluate("list.join ':' ['a',1,'b']")).to.be.Undefined("Text");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.join ':' (['a','b'],['c','d'])")).to.be.Text("a:b");
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("list.join(':','~')")).to.be.instanceof(types.Func);
                expect(await evaluate("list.join(':','~') ['a','b']")).to.be.Text("a:b");
                expect(await evaluate("list.join(':','~')(['a','b'],['c','d'])")).to.be.Text("a:b");                    
            });
        });    
    });              
    
    describe("f = list.map F", () => {
    
        describe("when F is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("list.map(x->2*x)")).to.be.instanceof(types.Func);
            });
    
            describe("ML = f L ", () => {
    
                it("should map the items of L via the function F", async () => {
                    expect(await evaluate("list.map(x->2*x) [1,2,3]")).to.be.List([2,4,6]);
                });
    
                it("should return Undefined List if F is not a Func item", async () => {
                    expect(await evaluate("list.map 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("list.map 10 [1,2,3]")).to.be.Undefined("List");
                });
    
                it("should return Undefined List if `L` is not a List item", async () => {
                    expect(await evaluate("list.map(x->x)")).to.be.instanceof(types.Func);
                    expect(await evaluate("list.map(x->x) 10")).to.be.Undefined("List");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("list.map(x->2*x)([1,2],[3,4])")).to.be.List([2,4]);
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("list.map(x->2*x,x->3*x)")).to.be.instanceof(types.Func);
                expect(await evaluate("list.map(x->2*x,x->3*x) [1,2]")).to.be.List([2,4]);
                expect(await evaluate("list.map(x->2*x,x->3*x)([1,2],[3,4])")).to.be.List([2,4]);
            });
        });    
    });              
});
