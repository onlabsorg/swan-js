const expect = require("./expect");


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
                
    wrap, unwrap 
} = require('../lib/types');


describe("types", () => {
    
    describe("Bool", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Bool(true);
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Bool(true);
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([true]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Bool(true);
                expect(Array.from(item)).to.deep.equal([true]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Bool(true);
                const item2 = new Bool(false);
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.Bool(true);
                expect(pairs[0][1]).to.be.Bool(false);
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Bool(true);
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List([true]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Bool(true);
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([true]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Bool(true);
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List([true]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Bool(true);
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([true]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return the term value", () => {
                expect((new Bool(true)).toBoolean()).to.be.true;
                expect((new Bool(false)).toBoolean()).to.be.false;
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
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new Bool(true).typeName).to.equal("Bool");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new Bool(true).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Bool(true);
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                expect(new Bool(true).unwrap() ).to.equal(true);
                expect(new Bool(false).unwrap()).to.equal(false);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should return the logical OR", () => {
                const TRUE = new Bool(true);
                const FALSE = new Bool(false);
                expect(TRUE.sum(TRUE)  ).to.be.Bool(true);
                expect(TRUE.sum(FALSE) ).to.be.Bool(true);
                expect(FALSE.sum(TRUE) ).to.be.Bool(true);
                expect(FALSE.sum(FALSE)).to.be.Bool(false);
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new Bool(true);
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should return true if the item is FALSE", () => {
                expect(new Bool(true).isNull()).to.be.false;
                expect(new Bool(false).isNull()).to.be.true;
            });
        });
        
        describe("Bool.null", () => {
            
            it("should return FALSE", () => {
                expect(Bool.null).to.be.Bool(false);
            });
        });
        
        describe(".mul(other)", () => {

            it("should return the logical AND", () => {
                const TRUE = new Bool(true);
                const FALSE = new Bool(false);
                expect(TRUE.mul(TRUE)  ).to.be.Bool(true);
                expect(TRUE.mul(FALSE) ).to.be.Bool(false);
                expect(FALSE.mul(TRUE) ).to.be.Bool(false);
                expect(FALSE.mul(FALSE)).to.be.Bool(false);
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new Bool(true);
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should return true if the item is TRUE", () => {
                expect(new Bool(true).isUnit()).to.be.true;
                expect(new Bool(false).isUnit()).to.be.false;
            });
        });
        
        describe("Bool.unit", () => {
            
            it("should return TRUE", () => {
                expect(Bool.unit).to.be.Bool(true);
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new Bool(true);
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
            
            it("should return '=' if the items are both TRUE or both FALSE", () => {
                const TRUE = new Bool(true);
                const FALSE = new Bool(false);
                expect(TRUE.compare(TRUE)).to.equal('=');
                expect(FALSE.compare(FALSE)).to.equal('=');
            });
            
            it("should consider FALSE less than TRUE", () => {
                const TRUE = new Bool(true);
                const FALSE = new Bool(false);
                expect(TRUE.compare(FALSE)).to.equal('>');
                expect(FALSE.compare(TRUE)).to.equal('<');
            });
        });
    });

    describe("Numb", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Numb(10);
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Numb(10);
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([10]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Numb(10);
                expect(Array.from(item)).to.deep.equal([10]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Numb(10);
                const item2 = new Numb(20);
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.Numb(10);
                expect(pairs[0][1]).to.be.Numb(20);
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Numb(10);
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List([10]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Numb(10);
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([10]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Numb(10);
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List([10]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Numb(10);
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([10]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true if the number is not null", () => {
                expect((new Numb(9)).toBoolean()).to.be.true;
                expect((new Numb(0)).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return the stringified value", () => {
                expect((new Numb(-1.23)).toString()).to.equal("-1.23");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new Numb(10).typeName).to.equal("Numb");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new Numb(10).isNothing()).to.be.false;
                expect(new Numb( 0).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Numb(10);
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                expect(new Numb(10).unwrap()).to.equal(10);
                expect(new Numb( 0).unwrap()).to.equal( 0);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should return the sum of the two numbers", () => {
                const item1 = new Numb(10);
                const item2 = new Numb(20);
                expect(item1.sum(item2)).to.be.Numb(30);
            });
        });
        
        describe(".negate()", () => {
            
            it("should return the negation of the item", () => {
                const item = new Numb(10);
                expect(item.negate()).to.be.Numb(-10);
            });
        });
        
        describe(".isNull()", () => {
            
            it("should return true if the item is 0", () => {
                expect(new Numb(10).isNull()).to.be.false;
                expect(new Numb( 0).isNull()).to.be.true;
            });
        });
        
        describe("Numb.null", () => {
            
            it("should return 0", () => {
                expect(Numb.null).to.be.Numb(0);
            });
        });
        
        describe(".mul(other)", () => {

            it("should return the product of the two numbers", () => {
                const item1 = new Numb(10);
                const item2 = new Numb(20);
                expect(item1.mul(item2)).to.be.Numb(200);
            });
        });
        
        describe(".invert()", () => {
            
            it("should return the reciprocal of the Numb item", () => {
                const item = new Numb(10);
                expect(item.invert()).to.be.Numb(0.1);
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should return true if the item is 1", () => {
                expect(new Numb(1).isUnit()).to.be.true;
                expect(new Numb(0).isUnit()).to.be.false;
            });
        });
        
        describe("Numb.unit", () => {
            
            it("should return 1", () => {
                expect(Numb.unit).to.be.Numb(1);
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should return the exponentiation of the two numbers", () => {
                const item1 = new Numb(10);
                const item2 = new Numb(3);
                expect(item1.pow(item2)).to.be.Numb(1000);
            });
        });
        
        describe(".compare(other)", () => {
            
            it("should compare the two numbers according to the real numbers order rules", () => {
                const item1 = new Numb(10);
                const item2 = new Numb(20);
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('<');
                expect(item2.compare(item1)).to.equal('>');
            });
        });
    });
    
    describe("Text", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Text("abc");
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Text("abc");
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal(["abc"]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Text("abc");
                expect(Array.from(item)).to.deep.equal(["abc"]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Text("abc");
                const item2 = new Text("def");
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.Text("abc");
                expect(pairs[0][1]).to.be.Text("def");
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Text("abc");
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List(["abc"]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Text("abc");
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List(["abc"]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Text("abc");
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List(["abc"]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Text("abc");
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List(["abc"]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true if the string value is not empty", () => {
                expect((new Text("abc")).toBoolean()).to.be.true;
                expect((new Text("")).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return the text value as it is", () => {
                expect((new Text("abc")).toString()).to.equal("abc");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new Text("abc").typeName).to.equal("Text");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new Text("abc").isNothing()).to.be.false;
                expect(new Text(""   ).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Text("abc");
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                expect(new Text("abc").unwrap()).to.equal("abc");
                expect(new Text(""   ).unwrap()).to.equal("");
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should concatenate the two strings", () => {
                const item1 = new Text("abc");
                const item2 = new Text("def");
                expect(item1.sum(item2)).to.be.Text("abcdef");
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new Text("abc");
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should return true if the string is empty", () => {
                expect(new Text("abc").isNull()).to.be.false;
                expect(new Text(""   ).isNull()).to.be.true;
            });
        });
        
        describe("Text.null", () => {
            
            it("should return an empty Text item", () => {
                expect(Text.null).to.be.Text("");
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const item = new Text("abc");
                expect(item.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new Text("abc");
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const item = new Text("abc");
                expect(item.isUnit).to.be.undefined;
            });
        });
        
        describe("Text.unit", () => {
            
            it("should not be defined", () => {
                expect(Text.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new Text("abc");
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should compare the two strings alphabetically", () => {
                const item1 = new Text("abc");
                const item2 = new Text("def");
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('<');
                expect(item2.compare(item1)).to.equal('>');
                
                expect(new Text("aaa").compare(new Text("aa"))).to.equal('>');
            });
        });
        
        describe(".domain", () => {
            
            it("should return the array of integers between 0 and the string length minus one", () => {
                expect(new Text("abc").domain).to.deep.equal([0,1,2]);
                expect(new Text(""   ).domain).to.deep.equal([]);
            });
        });

        describe(".vget(i)", () => {
            
            it("should return i-th character of the string", () => {
                expect(new Text("abc").vget(1)).to.equal('b')
            });

            it("should return undefined if i is not in the Text domain", () => {
                const item = new Text("abc");
                expect(item.vget(-1)).to.be.undefined;
                expect(item.vget(10)).to.be.undefined;
                expect(item.vget('xx')).to.be.undefined;
            });
        });
        
        describe(".size", () => {
            
            it("should contain the number of characters of the string", () => {
                expect(new Text("abc").size).to.equal(3);
                expect(new Text("").size).to.equal(0);
            });
        });
        
        describe(".image", () => {
            
            it("should return the tuple of characters of the string", () => {
                const item = new Text("abc");
                expect(item.image).to.be.List(['a','b','c']);
            });
        });
        
        describe(".apply(...X)", () => {
            
            it("should return the tuple of Text characters mapped to the arguments", () => {
                const item = new Text("abcdef");
                expect(item.apply(1,3,5)).to.be.Tuple(['b','d','f']);
            });
            
            it("should normalize the returned tuple", () => {
                const item = new Text("abcdef");
                expect(item.apply(1)).to.be.Text('b');
            });
            
            it("should return Undefined Mapping if the index is not in the Text item domain", () => {
                const item = new Text("abcdef");
                expect(item.apply(-1)).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                
                const tuple = item.apply(1, -1, 3);
                expect(tuple).to.be.instanceof(Tuple);
                expect(Array.from(tuple)[0]).to.equal('b');
                expect(Array.from(tuple)[1]).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                expect(Array.from(tuple)[2]).to.equal('d');
            });
        })
    });

    describe("List", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new List([10,20,30]);
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new List([10,20,30]);
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([[10,20,30]]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new List([10,20,30]);
                expect(Array.from(item)).to.deep.equal([[10,20,30]]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new List([10,20,30]);
                const item2 = new List([40,50,60]);
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.List([10,20,30]);
                expect(pairs[0][1]).to.be.List([40,50,60]);
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new List([10,20,30]);
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List([[10,20,30]]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new List([10,20,30]);
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([[10,20,30]]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new List([10,20,30]);
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List([[10,20,30]]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new List([10,20,30]);
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([[10,20,30]]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true if the array value is not empty", () => {
                expect((new List([10,20,30])).toBoolean()).to.be.true;
                expect((new List([        ])).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return '[[List of n items]]'", () => {
                expect(new List([10,20,30]).toString()).to.equal("[[List of 3 items]]");
                expect(new List([10      ]).toString()).to.equal("[[List of 1 item]]");
                expect(new List([        ]).toString()).to.equal("[[List of 0 items]]");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new List([10,20,30]).typeName).to.equal("List");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new List([10,20,30]).isNothing()).to.be.false;
                expect(new List([        ]).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new List([10,20,30]);
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                expect(new List([10,20,30]).unwrap()).to.deep.equal([10,20,30]);
                expect(new List([        ]).unwrap()).to.deep.equal([]);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should concatenate the two lists", () => {
                const item1 = new List([10,20,30]);
                const item2 = new List([40,50,60]);
                expect(item1.sum(item2)).to.be.List([10,20,30,40,50,60]);
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new List([10,20,30]);
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should return true if the list is empty", () => {
                expect(new List([10,20,30]).isNull()).to.be.false;
                expect(new List([        ]).isNull()).to.be.true;
            });
        });
        
        describe("List.null", () => {
            
            it("should return an empty Text item", () => {
                expect(List.null).to.be.List([]);
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const item = new List([10,20,30]);
                expect(item.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new List([10,20,30]);
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const item = new List([10,20,30]);
                expect(item.isUnit).to.be.undefined;
            });
        });
        
        describe("List.unit", () => {
            
            it("should not be defined", () => {
                expect(List.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new List([10,20,30]);
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should compare the two lists lexicographically", () => {
                const item1 = new List([10,20,30]);
                const item2 = new List([40,50,60]);
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('<');
                expect(item2.compare(item1)).to.equal('>');
                
                expect(new List([10,10,10]).compare(new List([10,10]))).to.equal('>');
            });
        });
        
        describe(".domain", () => {
            
            it("should return the array of integers between 0 and the list length minus one", () => {
                expect(new List([10,20,30]).domain).to.deep.equal([0,1,2]);
                expect(new List([        ]).domain).to.deep.equal([]);
            });
        });

        describe(".vget(i)", () => {
            
            it("should return i-th value of the list", () => {
                expect(new List([10,20,30]).vget(1)).to.equal(20)
            });

            it("should return undefined if i is not in the List domain", () => {
                const item = new List([10,20,30]);
                expect(item.vget(-1)).to.be.undefined;
                expect(item.vget(10)).to.be.undefined;
                expect(item.vget('xx')).to.be.undefined;
            });
        });
        
        describe(".size", () => {
            
            it("should contain the number of items of the list", () => {
                expect(new List([10,20,30]).size).to.equal(3);
                expect(new List([        ]).size).to.equal(0);
            });
        });
        
        describe(".image", () => {
            
            it("should return the tuple of characters of the string", () => {
                const item = new List([10,20,30]);
                expect(item.image).to.be.List([10,20,30]);
            });
        });
        
        describe(".apply(...X)", () => {
            
            it("should return the tuple of List items mapped to the arguments", () => {
                const item = new List([10,20,30,40,50,60]);
                expect(item.apply(1,3,5)).to.be.Tuple([20,40,60]);
            });
            
            it("should normalize the returned tuple", () => {
                const item = new List([10,20,30,40,50,60]);
                expect(item.apply(1)).to.be.Numb(20);
            });
            
            it("should return Undefined Mapping if the index is not in the List item domain", () => {
                const item = new List([10,20,30,40,50,60]);
                expect(item.apply(-1)).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                
                const tuple = item.apply(1, -1, 3);
                expect(tuple).to.be.instanceof(Tuple);
                expect(Array.from(tuple)[0]).to.equal(20);
                expect(Array.from(tuple)[1]).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                expect(Array.from(tuple)[2]).to.equal(40);
            });
        })
    });

    describe("Namespace", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([{k1:1, k2:2, k3:3}]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(Array.from(item)).to.deep.equal([{k1:1, k2:2, k3:3}]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Namespace({k1:1, k2:2, k3:3});
                const item2 = new Namespace({k4:4, k5:5, k6:6});
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.Namespace({k1:1, k2:2, k3:3});
                expect(pairs[0][1]).to.be.Namespace({k4:4, k5:5, k6:6});
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List([{k1:1, k2:2, k3:3}]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([{k1:1, k2:2, k3:3}]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List([{k1:1, k2:2, k3:3}]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([{k1:1, k2:2, k3:3}]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true if the namespace value is not empty", () => {
                expect((new Namespace({a:1})).toBoolean()).to.be.true;
                expect((new Namespace({})).toBoolean()).to.be.false;
            });
            
            it("should consider empty a namespace containing only non-valid identifiers", () => {
                expect((new Namespace({$key:1})).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should retun '[[Namespace of n items]]'", () => {
                expect((new Namespace({key1:1, key2:2, key3:3, $key4:4})).toString()).to.equal("[[Namespace of 3 items]]");
                expect((new Namespace({key1:1                         })).toString()).to.equal("[[Namespace of 1 item]]");
                expect((new Namespace({                               })).toString()).to.equal("[[Namespace of 0 items]]");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).typeName).to.equal("Namespace");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).isNothing()).to.be.false;
                expect(new Namespace({                }).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).unwrap()).to.deep.equal({k1:1, k2:2, k3:3});
                expect(new Namespace({                }).unwrap()).to.deep.equal({});
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should concatenate the two lists", () => {
                const item1 = new Namespace({k1:1, k2:2, k3:3});
                const item2 = new Namespace({k3:4, k4:5, k5:6});
                expect(item1.sum(item2)).to.be.Namespace({k1:1, k2:2, k3:4, k4:5, k5:6});
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should return true if the list is empty", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).isNull()).to.be.false;
                expect(new Namespace({                }).isNull()).to.be.true;
            });
        });
        
        describe("Namespace.null", () => {
            
            it("should return an empty Text item", () => {
                expect(Namespace.null).to.be.Namespace({});
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.isUnit).to.be.undefined;
            });
        });
        
        describe("Namespace.unit", () => {
            
            it("should not be defined", () => {
                expect(Namespace.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new Namespace({k1:1, k2:2, k3:3});
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should return equal if two namespace have the same identifiers and equal values", () => {
                const item1 = new Namespace({k1:1, k2:2, k3:3});
                const item2 = new Namespace({k4:4, k5:5, k6:6});
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('#');
                expect(item2.compare(item1)).to.equal('#');
                
                expect(new Namespace({k1:1, k2:2, $k3:3}).compare(new Namespace({k1:1, k2:2}))).to.equal('=');
            });
        });
        
        describe(".domain", () => {
            
            it("should return the array of the namespace identifiers", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).domain).to.deep.equal(['k1','k2','k3']);
                expect(new Namespace({                }).domain).to.deep.equal([]);
            });
        });

        describe(".vget(key)", () => {
            
            it("should return the value mapped to the given identifier", () => {
                expect(new Namespace({k1:1, k2:2, k3:3}).vget('k2')).to.equal(2)
            });

            it("should return undefined if key is not in the Namespace domain", () => {
                const item = new Namespace({k1:1, k2:2, k3:3, $k4:4});
                expect(item.vget(10)).to.be.undefined;
                expect(item.vget('xx')).to.be.undefined;
                expect(item.vget('$k4')).to.be.undefined;
            });
        });
        
        describe(".size", () => {
            
            it("should contain the number of names in the namespace", () => {
                expect(new Namespace({x:10,y:20,z:30}).size).to.equal(3);
                expect(new Namespace({}).size).to.equal(0);
            });
            
            it("should ignore non-valid identifiers", () => {
                expect(new Namespace({x:10,y:20,$z:30}).size).to.equal(2);
            });
        });
        
        describe(".image", () => {
            
            it("should return the array of values of the namespace", () => {
                const item = new Namespace({k1:1, k2:2, k3:3, $k4:4});
                expect(item.image).to.be.List([1,2,3]);
            });
        });
        
        describe(".apply(...X)", () => {
            
            it("should return the tuple of values mapped to the arguments", () => {
                const item = new Namespace({k1:1, k2:2, k3:3, k4:4, k5:5, k6:6});
                expect(item.apply('k2','k4','k6')).to.be.Tuple([2,4,6]);
            });
            
            it("should normalize the returned tuple", () => {
                const item = new Namespace({k1:1, k2:2, k3:3, k4:4, k5:5, k6:6});
                expect(item.apply('k2')).to.be.Numb(2);
            });
            
            it("should return Undefined Mapping if the key is not in the Namespace domain", () => {
                const item = new Namespace({k1:1, k2:2, k3:3, k4:4, k5:5, k6:6});
                expect(item.apply(-1)).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                
                const tuple = item.apply('k2', -1, 'k4');
                expect(tuple).to.be.instanceof(Tuple);
                expect(Array.from(tuple)[0]).to.equal(2);
                expect(Array.from(tuple)[1]).to.be.Undefined('Mapping', arg0 => {
                    expect(arg0).to.equal(-1);
                });
                expect(Array.from(tuple)[2]).to.equal(4);
            });
        })        
    });
    
    describe("Func", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Func(x=>x);
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Func(x=>x);
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([item.unwrap()]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Func(x=>x);
                expect(Array.from(item)).to.deep.equal([item.unwrap()]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Func(x=>x);
                const item2 = new Func(x=>x);
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.equal(item1);
                expect(pairs[0][1]).to.equal(item2);
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Func(x=>x);
                const fn = item => [item.unwrap()];
                expect(item.imapSync(fn)).to.be.List([item.unwrap()]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Func(x=>x);
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([item.unwrap()]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Func(x=>x);
                const fn = async item => [item.unwrap()];
                expect(await item.imapAsync(fn)).to.be.List([item.unwrap()]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Func(x=>x);
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([item.unwrap()]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true", () => {
                expect((new Func(x=>x)).toBoolean()).to.be.true;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return '[[Func]]'", () => {
                expect((new Func(x=>x)).toString()).to.equal("[[Func]]");
            });
        });

        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                expect(new Func(x=>x).typeName).to.equal("Func");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                expect(new Func(x=>x).isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Func(x=>x);
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item value", () => {
                const fn = x => x;
                expect(new Func(fn).unwrap()).to.equal(fn);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.sum).to.be.undefined;
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.isNull).to.be.undefined;
            });
        });
        
        describe("Func.null", () => {
            
            it("should not be defined", () => {
                expect(Func.null).to.be.undefined;
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.isUnit).to.be.undefined;
            });
        });
        
        describe("Func.unit", () => {
            
            it("should not be defined", () => {
                expect(Func.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new Func(x=>x);
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should return equal if two Func items wrap the same function", () => {
                const item1 = new Func(x=>x);
                const item2 = new Func(x=>x);
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('#');
                expect(item2.compare(item1)).to.equal('#');
            });
        });        
    });

    describe("Undefined", () => {
        
        describe(".items()", () => {
            
            it("should yield the item itself", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.items()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.items())).to.deep.equal([item]);
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item value", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.values()[Symbol.iterator]).to.be.a("function");
                expect(Array.from(item.values())).to.deep.equal([item]);
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(Array.from(item)).to.deep.equal([item]);
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const item1 = new Undefined("TestOperation1", 10, 20);
                const item2 = new Undefined("TestOperation2", 10, 20);
                expect(item1.iterPairs(item2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(item1.iterPairs(item2));
                expect(pairs.length).to.equal(1);
                expect(pairs[0][0]).to.be.Undefined("TestOperation1");
                expect(pairs[0][1]).to.be.Undefined("TestOperation2");
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to the item and return the wrapped output", () => {
                const item = new Undefined("TestOperation", 10, 20);
                const fn = item => [item];
                expect(item.imapSync(fn)).to.be.List([item]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to the item value and return the wrapped output", () => {
                const item = new Undefined("TestOperation", 10, 20);
                const fn = value => [value];
                expect(item.vmapSync(fn)).to.be.List([item]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item and return the wrapped output", async () => {
                const item = new Undefined("TestOperation", 10, 20);
                const fn = async item => [item];
                expect(await item.imapAsync(fn)).to.be.List([item]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to the item value and return the wrapped output", async () => {
                const item = new Undefined("TestOperation", 10, 20);
                const fn = async value => [value];
                expect(await item.vmapAsync(fn)).to.be.List([item]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true", () => {
                expect((new Undefined()).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return '[[Undefined <type-name>]]'", () => {
                expect((new Undefined("TestOperation")).toString()).to.equal("[[Undefined TestOperation]]");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return the item class name", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.typeName).to.equal("Undefined");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return false", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.isNothing()).to.be.false;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the item as it is", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.normalize()).to.equal(item);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return the item as it is", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.unwrap()).to.equal(item);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.sum).to.be.undefined;
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.isNull).to.be.undefined;
            });
        });
        
        describe("Undefined.null", () => {
            
            it("should not be defined", () => {
                expect(Undefined.null).to.be.undefined;
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.isUnit).to.be.undefined;
            });
        });
        
        describe("Undefined.unit", () => {
            
            it("should not be defined", () => {
                expect(Undefined.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should return equal if two Undefined items are the same item", () => {
                const item1 = new Undefined("TestOperation", 10, 20);
                const item2 = new Undefined("TestOperation", 10, 20);
                expect(item1.compare(item1)).to.equal('=');
                expect(item2.compare(item2)).to.equal('=');
                expect(item1.compare(item2)).to.equal('#');
                expect(item2.compare(item1)).to.equal('#');
            });
        });  
        
        describe(".type", () => {
            
            it("should contain the undefined operation type name", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.type).to.equal("TestOperation");
            });
        })      
        
        describe(".args", () => {
            
            it("should contain the array of the undefined operation operands", () => {
                const item = new Undefined("TestOperation", 10, 20);
                expect(item.args).to.deep.equal([10,20]);
            });
        })      
    });

    describe("Tuple", () => {
        
        describe(".items()", () => {
            
            it("should yield the items of the tuple", () => {
                const tuple = new Tuple(10, 20, 'abc');
                expect(tuple.items()[Symbol.iterator]).to.be.a("function");
                const items = Array.from(tuple.items());
                expect(items[0]).to.be.Numb(10);
                expect(items[1]).to.be.Numb(20);
                expect(items[2]).to.be.Text('abc');
            });
        });
        
        describe(".values()", () => {
            
            it("should yield the item values of the the tuple", () => {
                const tuple = new Tuple(10, 20, 'abc');
                expect(tuple.values()[Symbol.iterator]).to.be.a("function");
                const values = Array.from(tuple.values());
                expect(values[0]).to.equal(10);
                expect(values[1]).to.equal(20);
                expect(values[2]).to.equal('abc');
            });
        });
        
        describe("[Symbol.iterator]()", () => {
            
            it("should yield the item value", () => {
                const tuple = new Tuple(10, 20, 'abc');
                const values = Array.from(tuple);
                expect(values[0]).to.equal(10);
                expect(values[1]).to.equal(20);
                expect(values[2]).to.equal('abc');
            });
        });
        
        describe(".iterPairs(other)", () => {
            
            it("should yield corresponding pairs of the two terms", () => {
                const tuple1 = new Tuple(11,12,13);
                const tuple2 = new Tuple(21,22,23);
                expect(tuple1.iterPairs(tuple2)[Symbol.iterator]).to.be.a("function");
                const pairs = Array.from(tuple1.iterPairs(tuple2));
                expect(pairs.length).to.equal(3);
                
                expect(pairs[0][0]).to.be.Numb(11);
                expect(pairs[0][1]).to.be.Numb(21);

                expect(pairs[1][0]).to.be.Numb(12);
                expect(pairs[1][1]).to.be.Numb(22);

                expect(pairs[2][0]).to.be.Numb(13);
                expect(pairs[2][1]).to.be.Numb(23);
            });
            
            it("should pair items with Nothing when the two tuples do not have the same length", () => {
                var tuple1 = new Tuple(11,12,13);
                var tuple2 = new Tuple(21,22);
                var pairs = Array.from(tuple1.iterPairs(tuple2));                
                expect(pairs[0][0]).to.be.Numb(11);
                expect(pairs[0][1]).to.be.Numb(21);
                expect(pairs[1][0]).to.be.Numb(12);
                expect(pairs[1][1]).to.be.Numb(22);
                expect(pairs[2][0]).to.be.Numb(13);
                expect(pairs[2][1]).to.be.Tuple([]);

                var tuple1 = new Tuple(11,12);
                var tuple2 = new Tuple(21,22,23);
                var pairs = Array.from(tuple1.iterPairs(tuple2));                
                expect(pairs[0][0]).to.be.Numb(11);
                expect(pairs[0][1]).to.be.Numb(21);
                expect(pairs[1][0]).to.be.Numb(12);
                expect(pairs[1][1]).to.be.Numb(22);
                expect(pairs[2][0]).to.be.Tuple([]);
                expect(pairs[2][1]).to.be.Numb(23);
            });
        });
        
        describe(".imapSync(fn)", () => {
            
            it("should synchronously apply fn to all the items of the tuple", () => {
                const tuple = new Tuple(10,20,30);
                const fn = item => 2*item.unwrap();
                expect(tuple.imapSync(fn)).to.be.Tuple([20,40,60]);
            });
        });

        describe(".vmapSync(fn)", () => {
            
            it("should synchronously apply fn to all the item values of the tuple", () => {
                const tuple = new Tuple(10,20,30);
                const fn = value => 2*value;
                expect(tuple.vmapSync(fn)).to.be.Tuple([20,40,60]);
            });
        });

        describe(".imapAsync(fn)", () => {
            
            it("should asynchronously apply fn to all the items of the tuple", async () => {
                const tuple = new Tuple(10,20,30);
                const fn = async item => 2*item.unwrap();
                expect(await tuple.imapAsync(fn)).to.be.Tuple([20,40,60]);
            });
        });

        describe(".vmapAsync(fn)", () => {
            
            it("should asynchronously apply fn to all the item values of the tuple", async () => {
                const tuple = new Tuple(10,20,30);
                const fn = async value => 2*value;
                expect(await tuple.vmapAsync(fn)).to.be.Tuple([20,40,60]);
            });
        });

        describe(".toBoolean()", () => {
            
            it("should return true if at least one item booleanizes to true", () => {
                expect((new Tuple(1,2,3)).toBoolean()).to.be.true;
                expect((new Tuple(1)).toBoolean()).to.be.true;

                expect((new Tuple(0,"",[])).toBoolean()).to.be.false;
                expect((new Tuple(0)).toBoolean()).to.be.false;
                expect((new Tuple()).toBoolean()).to.be.false;
            });
        });
        
        describe(".toString()", () => {
            
            it("should return the concatenation of the stringified items", () => {
                expect((new Tuple("abc",0,true)).toString()).to.equal("abc0TRUE");
                expect((new Tuple()).toString()).to.equal("");
            });
        });
        
        describe(".typeName", () => {
            
            it("should return 'Nothing' if the tuple is empty", () => {
                const tuple = new Tuple();
                expect(tuple.typeName).to.equal("Nothing");
            });

            it("should return the item typeName if the tuple contains only than one element", () => {
                const tuple = new Tuple(1);
                expect(tuple.typeName).to.equal("Numb");
            });

            it("should return the 'Tuple' if the tuple contains more than one element", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.typeName).to.equal("Tuple");
            });
        });
        
        describe(".isNothing()", () => {
            
            it("should return true if the tuple is empty", () => {
                expect(new Tuple(1,2,3).isNothing()).to.be.false;
                expect(new Tuple().isNothing()).to.be.true;
            });
        });
        
        describe(".normalize()", () => {
            
            it("should return the tuple as it is if it has no items", () => {
                const tuple = new Tuple();
                expect(tuple.normalize()).to.equal(tuple);
            });
            
            it("should return the item if the tuple has only one item", () => {
                expect(new Tuple(true   ).normalize()).to.be.Bool(true);
                expect(new Tuple(10     ).normalize()).to.be.Numb(10);
                expect(new Tuple('abc'  ).normalize()).to.be.Text('abc');
                expect(new Tuple([1,2,3]).normalize()).to.be.List([1,2,3]);
                expect(new Tuple({a:1}  ).normalize()).to.be.Namespace({a:1});
            });

            it("should return the tuple as it is if it has more than one item", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.normalize()).to.equal(tuple);
            });
        });
        
        describe(".unwrap()", () => {
            
            it("should return null if it has no items", () => {
                const tuple = new Tuple();
                expect(tuple.unwrap()).to.equal(null);
            });
            
            it("should return the item value if the tuple has only one item", () => {
                expect(new Tuple(true).unwrap()).to.equal(true);
                expect(new Tuple(10).unwrap()).to.equal(10);
                expect(new Tuple('abc').unwrap()).to.equal('abc');
                expect(new Tuple([1,2,3]).unwrap()).to.deep.equal([1,2,3]);
                expect(new Tuple({a:1}).unwrap()).to.deep.equal({a:1});
            });

            it("should return the tuple as it is if it has more than one item", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.unwrap()).to.equal(tuple);
            });
        });
        
        describe(".sum(other)", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.sum).to.be.undefined;
            });
        });
        
        describe(".negate()", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.negate).to.be.undefined;
            });
        });
        
        describe(".isNull()", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.isNull).to.be.undefined;
            });
        });
        
        describe("Tuple.null", () => {
            
            it("should not be defined", () => {
                expect(Tuple.null).to.be.undefined;
            });
        });
        
        describe(".mul(other)", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.mul).to.be.undefined;
            });
        });
        
        describe(".invert()", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.invert).to.be.undefined;
            });
        });
        
        describe(".isUnit()", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.isUnit).to.be.undefined;
            });
        });
        
        describe("Tuple.unit", () => {
            
            it("should not be defined", () => {
                expect(Tuple.unit).to.be.undefined;
            });
        });
        
        describe(".pow(other)", () => {
            
            it("should not be defined", () => {
                const tuple = new Tuple(1,2,3);
                expect(tuple.pow).to.be.undefined;
            });
        });
        
        describe(".compare(other)", () => {
                        
            it("should compare the two tuple lexicographically", () => {
                const tuple1 = new Tuple(10,20,30);
                const tuple2 = new Tuple(40,50,60);
                expect(tuple1.compare(tuple1)).to.equal('=');
                expect(tuple2.compare(tuple2)).to.equal('=');
                expect(tuple1.compare(tuple2)).to.equal('<');
                expect(tuple2.compare(tuple1)).to.equal('>');
                
                expect(new Tuple(10,10,10).compare(new Tuple(10,10))).to.equal('>');
                expect(new Tuple(10,10,10).compare(new Numb(10))).to.equal('>');
            });
        });  
    });
    
    describe("wrap", () => {
        
        it("should convert a javascript object to its corresponding swan type", () => {
            
            expect(wrap(null)).to.be.Tuple([]);
            expect(wrap(undefined)).to.be.Tuple([]);

            expect(wrap(NaN)).to.be.Undefined("Number");
            
            expect(wrap(true)).to.be.Bool(true);
            expect(wrap(10)).to.be.Numb(10);
            expect(wrap('abc')).to.be.Text('abc');
            expect(wrap([1,2,3])).to.be.List([1,2,3]);
            expect(wrap({a:1})).to.be.Namespace({a:1})
            
            let fn = x => x;
            expect(wrap(fn)).to.be.instanceof(Func);
            expect(wrap(fn).unwrap()).to.equal(fn);
            
            expect(wrap(new Boolean(true))).to.be.Bool(true);
            expect(wrap(new Number(10))).to.be.Numb(10);
            expect(wrap(new String('abc'))).to.be.Text('abc');
            expect(wrap(new Array(1,2,3))).to.be.List([1,2,3]);

            fn = new Function(x => x);
            expect(wrap(fn)).to.be.instanceof(Func);
            expect(wrap(fn).unwrap()).to.equal(fn);
        });

        it("should return an already wrapped type as it is", () => {
            for (let term of [
                new Bool(true), new Numb(10), new Text('abc'), new List([1,2,3]),
                new Namespace({a:1}), new Undefined(), new Tuple(1,2,3)
            ]) {
                expect(wrap(term)).to.equal(term);
            }
        });
    });

    describe("unwrap", () => {
        
        it("should convert a swan type to its corresponding javascript value", () => {
            
            expect(unwrap(new Bool(true))).to.equal(true);
            expect(unwrap(new Numb(10))).to.equal(10);
            expect(unwrap(new Text('abc'))).to.equal('abc');
            expect(unwrap(new List([1,2,3]))).to.deep.equal([1,2,3]);
            
            const fn = x => x;
            expect(unwrap(new Func(fn))).to.equal(fn);
            
            expect(unwrap(new Tuple(1,2,3))).to.be.Tuple([1,2,3]);
            expect(unwrap(new Tuple(1))).to.equal(1);
            expect(unwrap(new Tuple())).to.equal(null);
        });

        it("should return an already unwrapped value as it is", () => {
            
            for (let value of [null, true, 10, 'abc', [1,2,3], {a:1}, new Undefined(), new Tuple(1,2,3)]) {
                expect(unwrap(value)).to.equal(value);
            }
        });
    });
});