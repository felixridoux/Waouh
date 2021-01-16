
const pu=require("./parserUtils.js");
const ast=require("./ast.js");

var CONStok = new pu.ParserRE("cons",/\s*cons\b/).fgt();
var NILtok = (new pu.ParserRE("nil",/\s*nil\b/)).fgt();
var SPtok = (new pu.ParserRE("space",/\s+/)).fgt();
var LPtok = (new pu.ParserRE("left par",/\s*\(\s*/)).fgt();
var RPtok = (new pu.ParserRE("right par",/\s*\)\s*/)).fgt();
var EQtok = (new pu.ParserRE("right par",/\s*\=\?\s*/)).fgt();
var HDtok = (new pu.ParserRE("head",/\s*hd\b/)).fgt();
var TLtok = (new pu.ParserRE("tail",/\s*tl\b/)).fgt();
var VARtok = (new pu.ParserRE("var",/[A-Z]\w*/));
var CSTtok = (new pu.ParserRE("symb",/[a-z]\w*/));
var EXP = pu.parserDecl("expression");
var EXPsimple = pu.parserDecl("simple expression");
var EXPeq = pu.parserDecl("equality expression");
var NILexp=pu.parserDecl("nil expression");
var VARexp=pu.parserDecl("var expression");
var CSTexp=pu.parserDecl("symb expression");
var CONSexp = pu.parserDecl("cons expression");
var HDexp = pu.parserDecl("head expression");
var TLexp = pu.parserDecl("tail expression");
pu.parserOr(EXPsimple, [NILexp, VARexp, CSTexp, CONSexp, HDexp, TLexp] );
pu.parserOpt(EXPeq, [EQtok, EXP], function(resultList) {return resultList});
pu.parserSeq(EXP, [EXPsimple, EXPeq],
    function(resultList){
        if (resultList.length == 1) {return [resultList[0]]}
        else {return [new ast.EqExpr(resultList[0], resultList[1])]}
    } );
pu.parserSeq(CONSexp, [LPtok, CONStok, SPtok.opt(), EXP, SPtok.opt(), EXP, RPtok], 
    function(resultList){return [new ast.ConsExpr(resultList[0],resultList[1])]} );
pu.parserSeq(HDexp, [LPtok, HDtok, SPtok.opt(), EXP, RPtok],  
    function(resultList){return [new ast.HdExpr(resultList[0])]} );
pu.parserSeq(TLexp, [LPtok, TLtok, SPtok.opt(), EXP, RPtok], 
    function(resultList){return [new ast.TlExpr(resultList[0])]} );
pu.parserSeq(NILexp,[NILtok],function(resultList){return [new ast.NlExpr()]} );
pu.parserSeq(VARexp,[VARtok],function(resultList){return [new ast.VarExpr(resultList[0])]} );
pu.parserSeq(CSTexp,[CSTtok],function(resultList){return [new ast.CstExpr(resultList[0])]} );
var test1=EXP.parser.apply("(cons nil        Grtr) ")
console.log("EXPR",test1);
console.log("EXPRPrettyPrint",test1.results[0].prettyPrint());
var test2=EXP.parser.apply("(cons (tl err)        (hd nil  )) ")
console.log("EXPR",test2);
console.log("EXPRPrettyPrint",test2.results[0].prettyPrint());
var test3=EXP.parser.apply("(cons (tl err)        (hd nil  )) =? (cons nil nil) ")
console.log("EXPR",test3);
console.log("EXPRPrettyPrint",test3.results[0].prettyPrint());

var NOPtok = (new pu.ParserRE("nop",/\s*nop\b/)).fgt();
var ASSIGNtok = (new pu.ParserRE("assign",/\s*:=\s*/)).fgt();
var IFtok = (new pu.ParserRE("if",/if\b/)).fgt();
var THENtok = (new pu.ParserRE("then",/\s*then\b/)).fgt();
var ELSEtok = (new pu.ParserRE("else",/\s*else\b/)).fgt();
var FItok = (new pu.ParserRE("fi",/\s*fi\b/)).fgt();
var WHILEtok = (new pu.ParserRE("while",/\s*while\b/)).fgt();
var DOtok = (new pu.ParserRE("do",/\s*do\b/)).fgt();
var ODtok = (new pu.ParserRE("od",/\s*od\b/)).fgt();
var FORtok = (new pu.ParserRE("for",/\s*for\b/)).fgt();
var SCtok = (new pu.ParserRE("semicolon",/\s*\;\s*/)).fgt();
var NOP = pu.parserDecl("nop command");
var ASSIGN = pu.parserDecl("assign command");
var WHILE = pu.parserDecl("while commands");
var FOR = pu.parserDecl("for command");
var IF = pu.parserDecl("if command");
var COMM = pu.parserDecl("command");
var COMMS = pu.parserDecl("list of commands");
pu.parserSeq(NOP, [NOPtok], function(resultList){return [new ast.NopCmmd()]} );
pu.parserSeq(ASSIGN, [VARexp, ASSIGNtok, EXP], 
    function(resultList){return [new ast.SetCmmd(resultList[0],resultList[1])]})
pu.parserSeq(WHILE, [WHILEtok, SPtok.opt(), EXP, SPtok.opt(), 
                  DOtok, SPtok.opt(), COMMS, SPtok.opt(), ODtok], 
    function(resultList){return [new ast.WhileCmmd(resultList[0],resultList[1])]})
pu.parserSeq(FOR, [FORtok, SPtok.opt(), EXP, SPtok.opt(), 
                DOtok, SPtok.opt(), COMMS, SPtok.opt(), ODtok], 
    function(resultList){return [new ast.ForCmmd(resultList[0],resultList[1])]})
pu.parserSeq(IF, [IFtok, SPtok.opt(), EXP, SPtok.opt(), 
               THENtok, SPtok.opt(), COMMS, SPtok.opt(), 
               ELSEtok, SPtok.opt(), COMMS, SPtok.opt(), FItok], 
    function(resultList){return [new ast.IfCmmd(resultList[0],resultList[1],resultList[2])]})
pu.parserOr(COMM, [NOP, ASSIGN, WHILE, FOR, IF])
pu.parserSeq(COMMS, [COMM.plussep(SCtok)], function(resultList){return [resultList]} );
console.log("COMMANDS");
var test4=COMM.parser.apply("while C do while X do if X then R := (cons X Y) else R := (cons X Z) fi od; while Y do F := REE;T:=   e od od")
console.log("COMM",test4);
console.log("COMM",test4.results[0]);
console.log("COMMPrettyPrint",test4.results[0].prettyPrint());
    
var READtok = (new pu.ParserRE("read",/\s*read\b/)).fgt();
var WRITEtok = (new pu.ParserRE("write",/\s*write\b/)).fgt();
var CMtok = (new pu.ParserRE("comma",/\s*\,\s*/)).fgt();
var PCtok = (new pu.ParserRE("percent",/\s*\%\s*/)).fgt();
var READ = pu.parserDecl("input statement");
var WRITE = pu.parserDecl("output statement");
var PROG = pu.parserDecl("program");
pu.parserSeq(READ, [READtok, SPtok, VARexp.plussep(CMtok)], 
    function(resultList){return [{type: "read", read:resultList}]})
pu.parserSeq(WRITE, [WRITEtok, SPtok.opt(), VARexp.plussep(CMtok)], 
    function(resultList){return [{type: "write", write:resultList}]})
pu.parserSeq(PROG, [READ, PCtok, COMMS, PCtok, WRITE], 
    function(resultList){return [new ast.Progr(resultList[0].read,resultList[1],resultList[2].write)]})
var test5=PROG.parser.apply("read X % nop % write X ")
console.log("PROG",test5.results[0].prettyPrint() )
console.log("PROG",PROG.parser.apply("read X, Y % X := (cons Y nil) % write Y, X ").results[0].prettyPrint())
console.log("PROG",PROG.parser.apply("read X, Y % for X do Y := (cons nil Y) od % write Y ").results[0].prettyPrint())
console.log("PROG",PROG.parser.apply("read X % for X do for X do X := (cons nil X) od od % write X ").results[0].prettyPrint())
console.log("PROG",PROG.parser.apply("read X, Y, Z % if X then R := (cons X Y) else R := (cons X Z) fi % write R ").results[0].prettyPrint())
console.log("PROG",PROG.parser.apply("read   X,Y%while  X   do  X:=(tl(hd(cons X nil))); R0:=nil;Y:=(cons R0 Y)od%write R ").results[0].prettyPrint())
console.log("PROG",PROG.parser.apply("read   X , Y % while  X   do  X := ( tl ( hd ( cons X nil ) ) ) ; nop ; R0 := nil ; Y := ( cons R0 Y ) od % write R ").results[0].prettyPrint())
var parserProgram=function(program){
    return PROG.parser.apply(program).results[0];
}

var parserExpression=function(expression){
    var result=EXP.parser.apply(expression)
    if(result instanceof pu.Failure){
        return new ast.NlExpr()
    }
    else{
        return result.results[0];
    }
}

module.exports.parserProgram=parserProgram;
module.exports.parserExpression=parserExpression;