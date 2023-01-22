
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
