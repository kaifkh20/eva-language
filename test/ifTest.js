const assert = require('assert')
const test = require('./testUtil')


module.exports = eva=>{
    assert.strictEqual(eva.eval(
        ['begin',
        ['var','x',10],
        ['var','y',20],
        ['if',['>','x',10],
            ['set','x',20],
            ['set','y',30]
        ],
        'y'
    ]
    ),30)

    test.test(eva,
        `(begin
            (var x 10)
            (var y 10)
            (+(* x 10)y))`,110)
}