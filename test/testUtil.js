const assert = require('assert')
const evaParser = require('../parser/evaParser')

function test(eva,code,expected){
    const exp = evaParser.parse(`(begin ${code})`)
//     console.log(eva.eval(evaParser.parse( `
//     (lambda (x) (* x x)) 

//   `)));
    assert.strictEqual(eva.evalGlobal(exp),expected)
}

module.exports = {
    test
}