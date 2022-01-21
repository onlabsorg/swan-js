const chai = require("chai")
const expect = module.exports = chai.expect;

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

chai.use(function (chai, utils) {
    
    chai.Assertion.addMethod('Bool', function (value) {
        let item = utils.flag(this, 'object').normalize();
        expect(item).to.be.instanceof(Bool)
        expect(unwrap(item)).to.equal(value);
    });
    
    chai.Assertion.addMethod('Numb', function (value) {
        let item = utils.flag(this, 'object').normalize();
        expect(item).to.be.instanceof(Numb)
        expect(unwrap(item)).to.equal(value);
    });
    
    chai.Assertion.addMethod('Text', function (value) {
        const item = utils.flag(this, 'object').normalize();
        expect(item).to.be.instanceof(Text)
        expect(unwrap(item)).to.equal(value);
    });
    
    chai.Assertion.addMethod('List', function (array) {
        const item = utils.flag(this, 'object').normalize();
        expect(item).to.be.instanceof(List)
        expect(unwrap(item)).to.deep.equal(array);
    });

    chai.Assertion.addMethod('Namespace', function (object) {
        const item = utils.flag(this, 'object').normalize();
        expect(item).to.be.instanceof(Namespace)
        expect(Object.assign({}, unwrap(item))).to.deep.equal(object);
    });
    
    chai.Assertion.addMethod('Tuple', function (itemArray) {
        var obj = utils.flag(this, 'object');
        expect(obj).to.be.instanceof(Tuple);
        expect(Array.from(obj.items()).map(unwrap)).to.deep.equal(itemArray);
    });
    
    chai.Assertion.addMethod('Undefined', function (type, test) {
        var obj = utils.flag(this, 'object').normalize();
        expect(obj).to.be.instanceof(Undefined);
        expect(obj.type).to.equal(type);
        if (typeof test === "function") test(...obj.args);
    });
    
    chai.Assertion.addMethod('UndefinedSyntax', function (errorMessage) {
        var obj = utils.flag(this, 'object');
        expect(obj).to.be.instanceof(Undefined);
        expect(obj.type).to.equal("Syntax");
        expect(obj.value).to.be.instanceof(Error);
        expect(obj.value.message).to.equal(errorMessage);
    });    
});
