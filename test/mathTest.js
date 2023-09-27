const assert = require('assert')

module.exports = eva =>{
    assert.strictEqual(eva.eval(['+',10,10]),20)
    assert.strictEqual(eva.eval(['-',10,10]),0)
    assert.strictEqual(eva.eval(['*',10,10]),100)
    assert.strictEqual(eva.eval(['/',10,10]),1)
}