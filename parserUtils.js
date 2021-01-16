/**
 * @class
 * @summary Class representing a parse result.
 * @classdesc Class representing a parse result: 
 * either Success or Failure. 
 * In case of Success, result is a list of (lists of ...) individual result values, plus what remains of the input after the parsed prefix. 
 * In case of Failure, result is a message, plus the input that failed the parse.
 * @interface
 */
class ParseResult{
};

/**
 * @summary Class of successful parse results.
 * @extends {ParseResult}
 */
class Success extends ParseResult{
//    results;
//    out;
//    type="Success";
    /**
     * Summarizes a successful parse: list of individual results and remaining input
     * @param {Any[]} listResults Default to a list of (lists of ...) of sections of the parsed input. 
     * The actual type of listResult can be overriden by RefParser method yields.
     * @param {Any[]} restInput What remains of the input after the parsed section. 
     * @returns ParseResult
     */
    constructor(listResults,restInput){
        super();
        this.results=listResults;
        this.out=restInput;
    }
};

/**
 * @summary Class of failed parse results.
 * @extends {ParseResult}
 */
class Failure extends ParseResult{
//    msg;
//    out;
//    type="Failure";
    /**
     * Summarizes a failed parse: error message and input failing to parse.
     * @param {string} message Error message 
     * @param {Any[]} restInput The input that failed parse.
     */
    constructor(message,restInput){
        super();
        this.msg=message;
        this.out=restInput;
    }
};

/**
 * @class 
 * @summary Creates a new parser.
 * @interface
 */
class Parser{
    /**
     * An apply method to apply a parser to an input list. 
     * @abstract
     * @function
     * @param {Any[]} - A list of tokens to be parsed. 
     * Tokens can be characters, or proper tokens (e.g. produced by a lexical analyser).
     * @return ParseResult
     */
    constructor() {
        this.apply = function() {
        throw new Error('must be implemented by subclass!');};
    }
}

/**
 * @summary Creates a new reference to parser. 
 * @classdesc Offers several combinators to build complex parsers out of simple ones through references to parsers.
 * @interface
 */
class RefParser{
    constructor(){
    /**
     * @private
     */
    this.expected = "Must be defined using parserDecl()";
    /**
     * The parser referenced by this RefParser.
     */
    this.parser = new Parser;
    /**
     * Succeeds iff this parser and the second one succeed; fails otherwise.
     * @summary Sequential composition of this parser with a second one. 
     * @function
     * @param RefParser refSndParser Reference to second parser.
     * @returns RefParser
     * @example
     * rp1.then(rp2); // returns a reference to a parser that composes rp1, and then rp2
     */
    this.then = function(refSndParser){return then(this, refSndParser);};
    /**
     * Succeeds iff either this parser or the second one succeeds (tried in this order); fails otherwise.
     * @summary Alternative composition of this parser with a second one. 
     * @example
     * rp1.alt(rp2); // returns a reference to a parser that tries rp1, and then rp2 only if rp1 fails
     * @function
     * @param {RefParser} refSndParser Reference to second parser.
     * @returns RefParser
     */
    this.alt = function(refSndParser){return alt(this, refSndParser);};
    /**
     * Tries this parser, and succeeds if the parser succeeds; succeeds otherwise and leaves input intact; never fails.
     * @summary Renders this parser optional. 
     * @example
     * rp1.opt(); // returns a reference to a parser that tries rp1, and then succeeds if rp1 fails
     * @function
     * @returns RefParser
     */
    this.opt = function(){return alt(this,new ParserSuccess([]));};
    /**
     * Succeeds iff this parser succeeds, but forces Success.results to be []; fails otherwise.
     * @summary Forgets the results of this parser. 
     * @example
     * rp1.fgt(); // returns a reference to a parser that tries rp1 but returns nothing
     * @function
     * @returns RefParser
     */
    this.fgt = function(){return yields(this,function(result){return []});};
    /**
     * Succeeds iff this parser succeeds, but forces Success.results to be [defaultValue]; fails otherwise.
     * @summary Forces a default value to Success. 
     * @example
     * rp1.def(new Token()); // returns a reference to a parser that tries rp1 and returns a new Token
     * @function
     * @param {Any} defaultValue Default result value.
     * @returns RefParser
     */
    this.def = function(defaultValue){return yields(this, function(listResults){return [defaultValue]});};
    /**
     * Tries this parser, and again on the remaining input, until it fails; never fails.
     * @summary Iterates zero or more times this parser. 
     * @example
     * rp1.star(); // returns a reference to a parser that accepts rp1*
     * @function
     * @returns RefParser
     */
    this.star = function(){return plussep(this,new ParserSuccess([])).opt();};
    /**
     * Tries this parser, if it succeeds tries the separator parser, and again on the remaining input, until the separator parser or this parser fails; never fails.
     * @summary Iterates zero or more times this parser including a parser for separators between successive tries. 
     * @function
     * @param {RefParser} refSepParser Reference to separator parser.
     * @returns RefParser
     */
    this.starsep = function(refSepParser){return plussep(this, refSepParser).opt();};
    /**
     * Tries this parser, and again on the remaining input, until it fails; fails iff first try fails.
     * @summary Iterates one or more times this parser. 
     * @function
     * @returns RefParser
     */
    this.plus = function(){return plussep(this,new ParserSuccess([]));};
    /**
     * Tries this parser, if it succeeds tries the separator parser, and again on the remaining input, until the separator parser or this parser fails; fails iff first try fails.
     * @summary Iterates one or more times this parser including a parser for separators between successive tries. 
     * @function
     * @param {RefParser} refSepParser Reference to separator parser.
     * @returns RefParser
     */
    this.plussep = function(refSepParser){return plussep(this, refSepParser);};
    /**
     * Succeeds iff this parser succeeds. The new form of result *must be* a list of something, but not necessarily a list of lists of ...
     * @summary Converts the default form of results, a list of (lists of ...) of segments of the parsed input into another form. 
     * @function
     * @param {Any[]} funYields - Conversion function
     * @returns RefParser
     */
    this.yields = function(funYields){return yields(this, funYields)};
    };
}

/**
 * They are specified by a test function that applies to the first element of the input. Succeeds iff the first element passes the test. Only the first element of the input is consumed.
 * @summary Class of references to elementary parsers. 
 * @example
 * new ParserElem("dollar sign", function(letter){return (letter == '$')}) 
 * // returns a reference to a parser that accepts "$"
 * @extends RefParser 
 */
class ParserElem extends RefParser{
    /**
     * @param {string} expected - Informal description of what is expected.
     * @param {*} predicate - A function that specifies what is expected.
     */
    constructor(expected,predicate){
        super();
        this.parser = new Parser();
        this.parser.apply = function(input){
        if(predicate(input[0])){ 
        return new Success([input[0]],input.slice(1)); }
        else{
        return new Failure(expected+" expected",input); } }
    };}

/**
 * The regexp is passed as a parameter. Succeeds iff a prefix of the input matches the regexp. This prefix is consumed from the input.
 * @summary Class of references to regexp parsers. 
 * @example
 * var ID = new ParserRE("identifier", /[a-z]\w*\b/);         
 * // returns a reference to a parser that accepts identifier notations
 * var NUM = new ParserRE("number", /[0-9][0-9]*\b/);     
 * // returns a reference to a parser that accepts number notations
 * var LP = new ParserRE("left parenthesis", /[0-9][0-9]* /);        
 * // returns a reference to a parser that accepts left parentheses
 * var RP = new ParserRE("right parenthesis", /[0-9][0-9]* /);        
 * // returns a reference to a parser that accepts right parentheses
 * var PLUS = new ParserRE("addition sign", /[0-9][0-9]* /);      
 * // returns a reference to a parser that accepts addition signs
 * var TIMES = new ParserRE("multiplication sign", /[0-9][0-9]* /);     
 * // returns a reference to a parser that accepts multiplication signs
 * var SP = new ParserRE("white space", /\s* /);                
 // returns a reference to a parser that accepts space signs
 * @extends RefParser
 */
class ParserRE extends RefParser{
    /**
     * @param {string} expected - Informal escription of what is expected. 
     * @param {*} regExp - The regexp that describes formally what is expected.
     */
    constructor(expected,regExp){
        super();
        this.parser = new Parser();
        this.parser.apply = function(input){
        var obj=regExp.exec(input);
        if(obj==null||obj.index!=0){ return new Failure(expected+" expected",input) }
        else{ return new Success([input.slice(0,obj[0].length)],input.slice(obj[0].length)); };}
    };}

/**
 * @summary Class of references to always successful parsers. 
 * @classdesc Never consumes anything.
 * @example
 * new ParserSuccess([a,b,c]) 
 * // returns a reference to a parser that always succeeds and returns 3 results: a, b, and c
 * @extends RefParser
 */
class ParserSuccess extends RefParser{
    /**
     * @param {Any[]} listResults - Specifies the Success result . 
     */
    constructor(listResults){
        super();
        this.parser = new Parser();
        this.parser.apply=function(input){return new Success(listResults,input);}
    }}

/**
 * @summary Class of references to always failing parsers. 
 * @classdesc Never consumes anything.
 * @example
 * new ParserFailure("Illegal identifier") 
 * // returns a reference to a parser that always fails and returns an error message
 * @extends RefParser
 */
class ParserFailure extends RefParser{
    /**
     * @param {string} message - An error message.
     */
    constructor(message){
        super();
        this.parser = new Parser();
        this.parser.apply=function(input){return new Failure(message,input);}
    }}    

/**
 * Function that implements sequential composition of parsers.
 * @private
 * @param {RefParser} refFstParser - A reference to a parser to be applied first. 
 * @param {RefParser} refSndParser - A reference to a parser to be applied to the input remaining after the first parser.
 * @returns {RefParser} - A reference to the resulting parser.
 */
var then = function(refFstParser,refSndParser){
    var refThenParser = new RefParser();
    refThenParser.parser = new Parser();
    refThenParser.parser.apply = function(input){
        var fstResult = refFstParser.parser.apply(input);
        if(fstResult instanceof Success){
            var sndResult=refSndParser.parser.apply(fstResult.out);
            if(sndResult instanceof Success){
                return new Success(fstResult.results.concat(sndResult.results),sndResult.out)}
            else{
            return new Failure(sndResult.msg,sndResult.out)}}
        else{
        return new Failure(fstResult.msg,fstResult.out)}}; 
    return refThenParser;};

/**
 * Function that implements alternative composition of parsers.
 * @private
 * @param {RefParser} refFstParser - A reference to a parser to be applied first. 
 * @param {RefParser} refSndParser - A reference to a parser to be applied to the initial input after the first parser failed.
 * @returns {RefParser} - A reference to the resulting parser.
 */
var alt = function(refFstParser, refSndParser){
            var refAltParser=new RefParser();
            refAltParser.parser = new Parser();
            refAltParser.parser.apply = function(input){
                var fstResult=refFstParser.parser.apply(input);
                if(fstResult instanceof Success){
                return fstResult;}
                else{
                return refSndParser.parser.apply(input)};};
            return refAltParser;}
                
/**
 * Function that transforms the default output of a parser.
 * @private
 * @param {RefParser} refOneParser - A reference to a parser. 
 * @param {*} funYields - A reference to a function that transforms the default success results. The result must be a list.
 * @returns {RefParser} - A reference to the resulting parser.
 */
var yields = function(refOneParser,funYields){
    if(funYields==null) {return refOneParser;}
    else{
        var refYieldsParser=new RefParser();
        refYieldsParser.parser = new Parser();
        refYieldsParser.parser.apply = function(input){
            var oneResult = refOneParser.parser.apply(input);
            if(oneResult instanceof Success){
                var newResult = new Success(funYields(oneResult.results),oneResult.out);
                return newResult
            }
            else{return oneResult}
        }
        return refYieldsParser;
    }}

/**
 * Function that implements at-least-one itération of parsers.
 * @private
 * @param {RefParser} refOneParser - A reference to a parser to be iterated. 
 * @param {RefParser} refSepParser - A reference to a parser to be interleaved between iterations.
 * @returns {RefParser} - A reference to the resulting parser.
 */
var plussep=function(refOneParser,refSepParser){
        var refPlussepParser = new RefParser();
        refPlussepParser.parser = new Parser();
        refPlussepParser.parser.apply = function(input){
            var resultFst = refOneParser.parser.apply(input);
            if(resultFst instanceof Success){
                var resultNxt=refSepParser.then(refOneParser).parser.apply(resultFst.out);
                while (resultNxt instanceof Success){
                    resultFst.results=resultFst.results.concat(resultNxt.results)
                    resultFst.out=resultNxt.out
                    resultNxt=refSepParser.then(refOneParser).parser.apply(resultFst.out);
                };}
            else { resultFst = new Failure("plussep error",resultFst.out)};
            return resultFst;
        };
        return refPlussepParser;
    }
    
/**
 * @summary Builds a failing parser with an error message.
 * @example
 * ERR("Invalid expression") // returns a failure parser
 * @param {string} message - The error message. 
 * @returns RefParser
 */
var ERR = function(message){return new ParserFailure(message)};
/**
 * The new parser is declared, but not yet defined.
 * @summary Declares a reference to a new parser with an informal description of what it expects. 
 * @example
 * var OP = parserDecl("operator");        // declares a parser that expects operator notationx
 * var EXPR = parserDecl("expression");    // declares a parser that expects expression notations
 * @param {string} expected Informal description of what is expected. 
 * @returns RefParser
 */
var parserDecl = function(expected){
    var refDefParser = new RefParser();
    refDefParser.expected = expected;
    return refDefParser;
};

/**
 * The reference to an error parser is built with the informal description of what is expected, and added as the last alternative.
 * @summary Gives a definition to a parser reference by composing an alternative of all elements of a list of references to parsers. 
 * @example
 * parserOr(OP, [PLUS, TIMES]);    // returns a reference to a new parser that tries PLUS then TIMES, 
 *                                 // or fails with an "Illegal operator" message
 * @param {RefParser} refOneParser The reference to an already declared parser. If it is already defined, the old definition will be replaced by the new one.
 * @param {RefParser[]} listRefParser A list of references to already declared parsers. They need not be actually defined, only declared. This allows to mutually recursive definitions of parsers.
 * @returns RefParser refOneParser. The definition is given to it as a side-effect.
 */
var parserOr = function(refOneParser,listRefParser){
    var refParser = new ParserFailure("alternative should not be empty");
    for (var i = 0; i < listRefParser.length; i++)
        refParser = refParser.alt(listRefParser[i]);
    refOneParser.parser = refParser.alt(ERR("invalid " + refOneParser.expected)).parser
};

/**
 * The reference to an error parser is built with the informal description of what is expected, and added as an alternative to the sequential composition.
 * @summary Gives a definition to a parser reference by a sequential composition of all elements of a list of references to parsers. 
 *  @example
 * parserSeq(EXP, [LP, OP, EXP.plussep(SP), RP], null);                              
 * // returns a reference to a new parser that accepts lisp-like forms
 * // In case of success, the result will look like ['(', '+', ['x', '12'], ')'].
 * parserSeq(EXP, [LP.fgt(), OP, EXP.plussep(SP.fgt()), RP.fgt()], null);            
 * // returns a reference to a new parser that accepts lisp-like forms
 * // In case of success, the result will look like ['+', ['x', '12']].
 * parserSeq(EXP, [LP.fgt(), OP, EXP.plussep(SP.fgt()), RP.fgt()],                   
 * // returns a reference to a new parser that accepts lisp-like forms
 *           function(r){return [{op: r[0], params: r[1]}]});            
 * // In case of success, the result will look like [{op: '+', params: ['x', '12']}].
 * @param {RefParser} refOneParser - The reference to an already declared parser.
 * @param {RefParser[]} listRefParser - A list of references to already declared parsers. They need not be actually defined, only declared. This allows to mutually recursive definitions of parsers.
 * @param {*} funYields - A conversion function for successful results.
 * @returns RefParser
 */
var parserSeq = function(refOneParser,listRefParser,funYields){
    var refParser = new ParserSuccess([]);
    for (var i = 0; i < listRefParser.length; i++)
        refParser = refParser.then(listRefParser[i]);
    refOneParser.parser = refParser.yields(funYields).alt(ERR("invalid " + refOneParser.expected)).parser
};

/**
 * The reference to an error parser is built with the informal description of what is expected, and added as an alternative to the sequential composition.
 * @summary Gives a definition to a parser reference by a sequential composition of all elements of a list of references to parsers. 
 *  @example
 * parserSeq(EXP, [LP, OP, EXP.plussep(SP), RP], null);                              
 * // returns a reference to a new parser that accepts lisp-like forms
 * // In case of success, the result will look like ['(', '+', ['x', '12'], ')'].
 * parserSeq(EXP, [LP.fgt(), OP, EXP.plussep(SP.fgt()), RP.fgt()], null);            
 * // returns a reference to a new parser that accepts lisp-like forms
 * // In case of success, the result will look like ['+', ['x', '12']].
 * parserSeq(EXP, [LP.fgt(), OP, EXP.plussep(SP.fgt()), RP.fgt()],                   
 * // returns a reference to a new parser that accepts lisp-like forms
 *           function(r){return [{op: r[0], params: r[1]}]});            
 * // In case of success, the result will look like [{op: '+', params: ['x', '12']}].
 * @param {RefParser} refOneParser - The reference to an already declared parser.
 * @param {RefParser[]} listRefParser - A list of references to already declared parsers. They need not be actually defined, only declared. This allows to mutually recursive definitions of parsers.
 * @param {*} funYields - A conversion function for successful results.
 * @returns RefParser
 */
var parserSeq = function(refOneParser,listRefParser,funYields){
    var refParser = new ParserSuccess([]);
    for (var i = 0; i < listRefParser.length; i++)
        refParser = refParser.then(listRefParser[i]);
    refOneParser.parser = refParser.yields(funYields).alt(ERR("invalid " + refOneParser.expected)).parser
};

/**
 * The reference to an error parser is built with the informal description of what is expected, and added as an alternative to the sequential composition.
 * @summary Gives a definition to a parser reference by an optional sequential composition of all elements of a list of references to parsers. 
 *  @example
 * parserOpt(EXP, [LP, OP, EXP.plussep(SP), RP], null);                              
 * // returns a reference to a new parser that accepts optional lisp-like forms
 * // In case of success, the result will look like ['(', '+', ['x', '12'], ')'] ou [].
 * @param {RefParser} refOneParser - The reference to an already declared parser.
 * @param {RefParser[]} listRefParser - A list of references to already declared parsers. They need not be actually defined, only declared. This allows to mutually recursive definitions of parsers.
 * @param {*} funYields - A conversion function for successful results.
 * @returns RefParser
 */
var parserOpt = function(refOneParser,listRefParser,funYields){
    var refParser = new ParserSuccess([]);
    for (var i = 0; i < listRefParser.length; i++)
        refParser = refParser.then(listRefParser[i]);
    refOneParser.parser = refParser.yields(funYields).opt().parser
};

module.exports.ParserElem=ParserElem;
module.exports.ParserRE=ParserRE;
module.exports.parserDecl=parserDecl;
module.exports.parserOr=parserOr;
module.exports.parserSeq=parserSeq;
module.exports.parserOpt=parserOpt;
module.exports.Failure=Failure;