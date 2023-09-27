const assert = require('assert')

module.exports = eva =>{
    assert.strictEqual(eva.eval([
        'begin',
        ['var','xy',10],
        'xy'
    ]),10)
    
    assert.strictEqual(eva.eval([
        'begin',
        ['var','x',10],
        ['begin',
            ['var','x',20],
            'x'
        ],
        'x'
    
    ]),10)
    
    assert.strictEqual(eva.eval([
        'begin',
        ['var','x',10],
        ['var','result',['begin',
            ['var','y',['+','x',10]],
            'y'
        ]],
        'result'
    
    
    ]),20)
    
    assert.strictEqual(eva.eval([
        'begin',
        ['var','x',10],
        ['begin',
        ['set','x',20]
    ],
    'x'
    ]),20)
}