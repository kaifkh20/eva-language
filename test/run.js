const tests = [
    require('./blockTest'),
    require('./mathTest'),
    require('./selfEvalTest'),
    require('./blockTest'),
    require('./ifTest'),
    require('./whileTest'),
    require('./builtInFn'),
    require('./userDefinedFunction'),
    require('./lambdaFunctionTest'),
    require('./switchTest'),
    require('./forTest'),
    require('./incTest'),
    require('./incValTest'),
    require('./decTest'),
    require('./decValTest'),
    require('./classTest'),
    require('./moduleTest'),
    require('./importTest')

]

const Eva = require('../eva')
const Environment = require('../env')

const eva = new Eva()
// console.log(eva);
eva.eval(['print','"Hello World"'])

tests.forEach(test=>test(eva))