
const fs = require('fs')
const Environment = require('./env.js')
const Transformer = require('./tranformer/transformer.js')
const evaParser = require('./parser/evaParser.js')

class Eva{

    constructor(global = GlobalEnvironment){
        this.global = global
        this.tranfomer = new Transformer()
    }

    // Evalute The Global Code

    

    eval(exp,env=this.global){
        if(this._isNumber(exp)){
            return exp
        }
        if(this._isString(exp)){
            return exp.slice(1,-1)
        }
        if(this._isVariableName(exp)){
            
            return env.lookup(exp)
        }
        // Block Operations

        if(exp[0]==='var'){
            const [_,name,value] = exp;
            return env.define(name,this.eval(value,env))
        }

        
        
        if(exp[0]==='begin'){
            const blockEnv = new Environment({},env)
            return this.evalBlock(exp,blockEnv)
        }

        if(exp[0]==='set'){
            const [_,ref,value] = exp
            if(ref[0]==='prop'){
                const [_tag,instance,propName] = ref
                const instanceEnv = this.eval(instance,env)
                return instanceEnv.define(propName,this.eval(value,env))
            }

            return env.assign(ref,this.eval(value,env))
        }

        // If conditions

        if(exp[0]==='if'){
            const [_tag,condition,consquent,alternate] = exp
            if(this.eval(condition,env)){
                return this.eval(consquent,env)
            }
            return this.eval(alternate,env)
        }
        
        //  Switch Case

        if(exp[0]==='switch'){
            const ifExp = this.tranfomer.transformSwitchToIf(exp)
            // console.log(ifExp);
            return this.eval(ifExp,env)
        }

        //Loops Implementations
        
        if(exp[0]==='while'){
            let result
            const [_tag,condition,body] = exp
            while(this.eval(condition,env)){
                result = this.eval(body,env)
            }
            return result
        }

        if(exp[0]==='for'){
            const forExp = this.tranfomer.transformForToWhile(exp)
            // console.log(forExp);
            // console.log(this.eval(forExp,env));
            return this.eval(forExp,env)
        }

        // Function Declaration def square (x) (* x x)
        // Syntatic Sugar for: (var square (lambda (x) (* x x)))

        if(exp[0]==='def'){
            const [_tag,name,params,body] = exp
            
            // JIT-transpile to a variable declaration
            const varExp = this.tranfomer.transformDefToVarLambda(exp)

            return this.eval(varExp,env)
            
            // const fn = {
            //     params,body,env
            // }
            // return env.define(name,fn)
        }

        // Lambda Function

        if(exp[0]==='lambda'){
            const [_tag,params,body] = exp
            // console.log(exp);
            return {
                params,
                body,
                env
            }
        }

        // Incrememnt and Decrement Operator
        if(exp[0]==='++'){
            const incExp = this.tranfomer.transformIncToSet(exp)
            return this.eval(incExp,env)
        }
        if(exp[0]==='--'){
            const decExp = this.tranfomer.transformDecToSet(exp)
            return this.eval(decExp,env)
        }
        if(exp[0]==='+='){
            const nExp = this.tranfomer.transformIncValToSet(exp)
            return this.eval(nExp,env)
        } 
        if(exp[0]==='-='){
            const nExp = this.tranfomer.transformDecValToSet(exp)
            return this.eval(nExp,env)
        }

        // Class Implementation
        if(exp[0]==='class'){
            const [_tag,name,parent,body] = exp

            const parentEnv = this.eval(parent,env) || env
            const classEnv = new Environment({},parentEnv)
            
            this._evalBody(body,classEnv)
            
            return env.define(name,classEnv)
            // console.log(classEnv.parent);
        } 

        // New Constructor

        if(exp[0]==='new'){
            // console.log();
            const classEnv = this.eval(exp[1],env)

            const instanceEnv = new Environment({},classEnv)
            // console.log(classEnv.parent);
            const args = exp
            .slice(2)
            .map(arg=>this.eval(arg,env))
            
            this._callUserDefinedFunction(classEnv.lookup('constructor'),[instanceEnv,...args])
            return instanceEnv
        }

        // Property Access 
        if(exp[0]==='prop'){
            const [_tag,instance,name] = exp
            const instanceEnv = this.eval(instance,env)
            return instanceEnv.lookup(name)
        }

        // Super Call Constructor of Parent

        if(exp[0]==='super'){
            const [_tag,className] = exp
            return this.eval(className,env).parent
        }

        // Module

        if(exp[0]==='module'){
            const [_tag,name,body] = exp
            const moduleEnv = new Environment({},env)
            this._evalBody(body,moduleEnv)
            // console.log(moduleEnv);
            return env.define(name,moduleEnv)
        }

        // Import Module
        if(exp[0]==='import'){
            const [_tag,name] = exp
            
            const moduleSrc = fs.readFileSync(`${__dirname}/modules/${name}.eva`,'utf-8')
            const body = evaParser.parse(`(begin ${moduleSrc})`)
            const moduleExp = ['module',name,body]
            
            return this.eval(moduleExp,this.global)
           
        }

        // Function Call

        if(Array.isArray(exp)){
            
            const fn = this.eval(exp[0],env)
            
            const args = exp.slice(1).map(arg=>{
                return this.eval(arg,env)
            })

            if(typeof fn === 'function'){
                return fn(...args)
            }

            // UserDefined Function Call
            return this._callUserDefinedFunction(fn,args)
         }

         throw new Error(`Unimplemented ${JSON.stringify(exp)}`)

    }

   _callUserDefinedFunction(fn,args){
        const activationRecord = {}
                
        fn.params.forEach((param,index)=>{
            activationRecord[param] = args[index]
        })
        
        const activationEnv = new Environment(activationRecord,fn.env)
        return this._evalBody(fn.body,activationEnv)
   }
    
   //Evaluate Global body as a block without using begin
   
   evalGlobal(exp){
    return this._evalBody(exp,this.global)
   }
    
    _evalBody(block,env){
        if(block[0]==='begin'){
            return this.evalBlock(block,env)
        }
        return this.eval(block,env)
    }

    evalBlock(block,env){
        let result 
        const [_tag,...expression] = block
        expression.forEach(exp=>{
            result = this.eval(exp,env)
        })
        return result
    }

    _isNumber(exp){
        return typeof exp === 'number'
    }
    _isString(exp){
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1)==='"'
    }
    _isVariableName(exp){
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]+$/.test(exp)
    }
}

const GlobalEnvironment = new Environment({
    version : "0.0.1",
    null : null,
    true : true,
    false : false,

    // Built in Functions
    '+'(op1,op2){
        return op1+op2
    },
    '-'(op1,op2){
        if(op2==null){
            return -op1
        }
        return op1-op2
    },
    '*'(op1,op2){
        return op1*op2
    },
    '/'(op1,op2){
        return op1/op2
    },
    
    //Comparision Operators
    '>'(op1,op2){
        return op1>op2
    }
    ,'<'(op1,op2){
        return op1<op2
    },
    '>='(op1,op2){
        return op1>=op2
    },
    '<='(op1,op2){
        return op1<=op2
    },
    '='(op1,op2){
        return op1===op2
    },
    // Print
    print(...args){
        console.log(args[0]);
    }
})



module.exports = Eva


