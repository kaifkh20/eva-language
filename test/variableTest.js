const assert = require('assert')

module.exports = eva =>{
    assert.strictEqual(eva.eval(['var','x',10]),10)
    assert.strictEqual(eva.eval('x'),10)
    assert.strictEqual(eva.eval('true'),true)
}