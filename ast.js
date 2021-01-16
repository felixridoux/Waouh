
class Expr{};
class Value{};
class Command{};
class DoCommand{};
class Program{};
class DoProgram{};

class ConsExpr extends Expr{
    //arg1;
    //arg2;
    constructor(x,y){
        super();
        this.arg1=x;
        this.arg2=y;
    }
    prettyPrint(){
        return "(cons "+this.arg1.prettyPrint()+" "+this.arg2.prettyPrint()+")"; 
    }
    eval(memory){
        return new ConsValue(this.arg1.eval(memory),this.arg2.eval(memory));
    }
}

class EqExpr extends Expr{
    //arg1;
    //arg2;
    constructor(x,y){
        super();
        this.arg1=x;
        this.arg2=y;
    }
    prettyPrint(){
        return this.arg1.prettyPrint()+" =? "+this.arg2.prettyPrint(); 
    }
    eval(memory){
        if(this.arg1.eval(memory).equals(this.arg2.eval(memory))){
            return new ConsValue(new NlValue,new NlValue);
        }
        else{
            return new NlValue();
        }
    }
}

class HdExpr extends Expr{
    //arg;
    constructor(x){
        super();
        this.arg=x;
    }
    prettyPrint(){
        return "(hd "+this.arg.prettyPrint()+")";
    }
    eval(memory){
        var evaluation=this.arg.eval(memory);
        if(evaluation instanceof ConsValue){
            return evaluation.arg1;
        }
        else{
            return new NlValue();
        }
    }
}

class TlExpr extends Expr{
    //arg;
    constructor(x){
        super();
        this.arg=x;
    }
    prettyPrint(){
        return"(tl "+this.arg.prettyPrint()+")";
    }
    eval(memory){
        var evaluation=this.arg.eval(memory);
        if(evaluation instanceof ConsValue){
            return evaluation.arg2;
        }
        else{
            return new NlValue();
        }
    }
}

class CstExpr extends Expr{
    //arg;
    constructor(x){
        super();
        this.arg=x;
    }
    prettyPrint(){
        return this.arg;
    }
    eval(){
        return new CstValue(this.arg);
    }
}

class VarExpr extends Expr{
    //name;
    constructor(name){
        super();
        this.name=name;
    }
    equals(varexpr){
        return this.name==varexpr.name;
    }
    prettyPrint(){
        return this.name;
    }
    eval(memory){
        var value=memory.get(this.name);
        if(value==undefined){
            value=new NlValue();
        }
        return value;
    }
}

class NlExpr extends Expr{
    prettyPrint(){
        return "nil";
    }
    eval(){
        return new NlValue();
    }
}

class ConsValue extends Value{
    //arg1;
    //arg2;
    constructor(x,y){
        super();
        this.arg1=x;
        this.arg2=y;
    }
    prettyPrint(){
        return "(cons "+this.arg1.prettyPrint()+" "+this.arg2.prettyPrint()+")"; 
    }
    equals(value){
        if(value instanceof ConsValue && this.arg1.equals(value.arg1) && this.arg2.equals(value.arg2)){
            return Boolean(1);
        }
        else{
            return Boolean(0);
        }
    }
    toInt(){
        return 1+this.arg2.toInt();
    }
}

class CstValue extends Value{
    //arg;
    constructor(x){
        super();
        this.arg=x;
    }
    prettyPrint(){
        return this.arg;
    }
    equals(value){
        console.log(value,1);
        if(value instanceof CstValue && this.arg==value.arg){
            return Boolean(1);
        }
        else{
            return Boolean(0);
        }
    }
    toInt(){
        return 0;
    }
}

class NlValue extends Value{
    prettyPrint(){
        return "nil";
    }
    equals(value){
        return value instanceof NlValue;
    }
    toInt(){
        return 0;
    }
}

var appendStringBeforeAll=function(string,listString){
    for(var i=0;i<(listString).length;i++){
        listString[i]=string+listString[i]
    }
    return listString;
}

var appendStringAfterLast=function(string,listString){
    listString[listString.length-1]=listString[listString.length-1]+string;
    return listString;
}

class NopCmmd extends Command{
    prettyPrint(){
        return ["nop"];
    }
    compile(){
        return [new DoNop()];
    }
}

class DoNop extends DoCommand{
    step(memory,actionNumber,line){
        return [memory,line+1];
    }
    back(memory,actionNumber,line){
        return [memory,line-1];
    }
    resetJournal(){

    }
};

var prettyPrintCommands=function(listCommand){
    var result=[];
    for(var i=0;i<(listCommand.length)-1;i++){
        var tl=appendStringAfterLast(" ;",listCommand[i].prettyPrint());
        result=result.concat(tl);
    }
    result=result.concat(listCommand[listCommand.length-1].prettyPrint());
    return result;
}

class WhileCmmd extends Command{
    //condition;
    //body;
    constructor(condition,body){
        super();
        this.condition=condition;
        this.body=body;
    }
    prettyPrint(){
        var head=["while "+this.condition.prettyPrint()+" do"];
        var prettyPrintC=prettyPrintCommands(this.body);
        var body=appendStringBeforeAll("      ",prettyPrintC);
        var end=["od"];
        return head.concat(body).concat(end);
    }
    compile(compteur){
        var bodyCompil=compileList(this.body,compteur+1);
        var body=bodyCompil.concat([new OdWhile(compteur)]);
        var begin=compteur+1;
        var end=compteur+body.length+1;
        var hd=[new DoWhile(this.condition,begin,end)];
        return hd.concat(body);
    }
}

var compileList=function(body,ligneNumber){
    var result=[];
    var compteur=ligneNumber;
    for(var i=0;i<body.length;i++){
        var temp=body[i].compile(compteur)
        compteur+=temp.length;
        result=result.concat(temp); 
    }
    return result
}

class DoWhile extends DoCommand{
    //condition;
    //begin;
    //end;
    constructor(condition,begin,end){
        super();
        this.condition=condition;
        this.begin=begin;
        this.end=end;
        this.localJournal=new Map();
    }
    canIterate(memory){
        if(this.condition.eval(memory).toInt()<1){
            return false;
        }
        else{
            this.countEval=this.countEval-1;
            return true;
        }
    }
    step(memory,actionNumber,line,listCommand){
        var conditionVal=this.localJournal.get(actionNumber);
        if(conditionVal==undefined){
            conditionVal=this.condition.eval(memory).toInt();
            this.localJournal.set(actionNumber,conditionVal);
        }
        var nextLine;
        if(conditionVal==0){
            nextLine=this.end;
        }
        else{
            nextLine=this.begin;
        }
        return [memory,nextLine];
    }
    back(memory,actionNumber,line,listCommand){
        var nextLine;
        if(listCommand[this.end-1].canIterate()){
            nextLine=this.end-2;
        }
        else{
            nextLine=line-1;
        }
        return [memory,nextLine]
    }
    resetJournal(){
        this.localJournal=new Map();
    }
}

class OdWhile extends DoCommand{
    //goTo;
    constructor(goTo){
        super();
        this.localJournal=new Map();
        this.conditionJournal=new Map();
        this.count=0;
        this.goTo=goTo;
    }
    step(memory,actionNumber,line,listCommand){
        console.log("hhhhh",this.count);
        console.log(this.goTo+1,line);
        var nextLine;
        var condition=this.conditionJournal.get(actionNumber);
        if(condition==true){
            nextLine=this.goTo+1;
            this.count=this.count+1;
        }
        else if(condition==false){
            nextLine=line+1;
            this.localJournal.set(actionNumber,this.count)
            this.count=0;
        }
        else if(listCommand[this.goTo].canIterate(memory)){
            nextLine=this.goTo+1;
            this.count=this.count+1;
            this.conditionJournal.set(actionNumber,true);
        }
        else{
            nextLine=line+1;
            this.localJournal.set(actionNumber,this.count);
            this.conditionJournal.set(actionNumber,false);
            this.count=0;
        }
        return [memory,nextLine]
    }
    back(memory,actionNumber,line,listCommand){
        var nextLine;
        if(this.localJournal.get(actionNumber)==undefined){
            console.log("===================================")
            if(this.count>0){
                nextLine=line-1;
            }
            else{
                nextLine=this.goTo-1;
            }
            this.count=this.count-1;
        }
        else{
            this.count=this.localJournal.get(actionNumber);
            nextLine=line-1;
            }
        return [memory,nextLine];
    }
    canIterate(){
        console.log("===========================================================",this.count)
        if(this.count<=0){
            return false;
        }
        else{
            this.count=this.count-1;
            return true;
        }
    }
    resetJournal(){
        this.localJournal=new Map();
        this.conditionJournal=new Map();
        this.count=0;
    }
}

class ForCmmd extends Command{
    //count;
    //body;
    constructor(count,body){
        super();
        this.count=count;
        this.body=body;
    }
    prettyPrint(){
        var head=["for "+this.count.prettyPrint()+" do"];
        var prettyPrintC=prettyPrintCommands(this.body);
        var body=appendStringBeforeAll("      ",prettyPrintC);
        var end=["od"];
        return head.concat(body).concat(end);
    }
    compile(compteur){
        var bodyCompil=compileList(this.body,compteur+1);
        var body=bodyCompil.concat([new OdFor(compteur+1)]);
        var begin=compteur+1;
        var end=compteur+body.length+1;
        var hd=[new DoFor(this.count,begin,end)];
        return hd.concat(body);
    }
}

class DoFor extends DoCommand{
    //count;
    //begin;
    //end;
    //localJournal;
    constructor(count,begin,end){
        super();
        this.count=count;
        this.begin=begin;
        this.localJournal=new Map();
        this.end=end;
        this.countEval=null;
    }
    canIterate(){
        if(this.countEval<=0){
            return false;
        }
        else{
            this.countEval=this.countEval-1;
            return true;
        }
    }
    step(memory,actionNumber){
        var countEval=this.localJournal.get(actionNumber);
        if(countEval==undefined){
            countEval=this.count.eval(memory).toInt();
            this.localJournal.set(actionNumber,countEval);
        }
        this.countEval=countEval;
        var nextLine;
        if(this.countEval<=0){
            nextLine=this.end;
        }
        else{
            this.countEval=this.countEval-1;
            nextLine=this.begin;
        }
        return [memory,nextLine]
    }
    back(memory,actionNumber,line,listCommand){
        var nextLine;
        if(listCommand[this.end-1].canIterate(actionNumber)){
            nextLine=this.end-2;
        }
        else{
            nextLine=line-1;
        }
        return [memory,nextLine]
    }
    resetJournal(){
        this.localJournal=new Map();
        this.countEval=0;
    }
}

class OdFor extends DoCommand{
    //goTo;
    constructor(goTo){
        super();
        this.goTo=goTo-1;
        this.localJournal=new Map();
        this.conditionJournal=new Map();
        this.count=0;
    }
    step(memory,actionNumber,line,listCommand){
        var nextLine;
        var condition=this.conditionJournal.get(actionNumber);
        console.log("mangue",this.count);
        if(condition==true){
            nextLine=this.goTo+1;
            this.count=this.count+1;
        }
        else if(condition==false){
            nextLine=line+1;
            //this.count=this.count+1;
            console.log("patate",this.count)
            this.localJournal.set(actionNumber,this.count)
            this.count=0;
        }
        else if(listCommand[this.goTo].canIterate()){
            nextLine=this.goTo+1;
            this.count=this.count+1;
            this.conditionJournal.set(actionNumber,true);
        }
        else{
            nextLine=line+1;
            console.log("ananas",this.count)
            this.localJournal.set(actionNumber,this.count);
            this.conditionJournal.set(actionNumber,false);
            this.count=0;
        }
        return [memory,nextLine]
    }
    back(memory,actionNumber,line,listCommand){
        var nextLine;
        if(this.localJournal.get(actionNumber)==undefined){
            console.log("===================================")
            if(this.count>0){
                nextLine=line-1;
            }
            else{
                nextLine=this.goTo-1;
            }
            this.count=this.count-1;
        }
        else{
            this.count=this.localJournal.get(actionNumber);
            nextLine=line-1;
            }
        return [memory,nextLine];
    }
    canIterate(actionNumber){
        console.log("*******************************************%%%%%%%%%%%%%%%%%%%%%%",this.count,actionNumber)
        if(this.count<=0){
            return false;
        }
        else{
            this.count=this.count-1;
            return true;
        }
    }
    resetJournal(){
        this.localJournal=new Map();
        console.log(this.localJournal.entries())
        this.conditionJournal=new Map();
        this.count=0;
    }
}

class IfCmmd extends Command{
    //condition;
    //then_commands;
    //else_commands;
    constructor(condition,then_commands,else_commands){
        super();
        this.condition=condition;
        this.then_commands=then_commands;
        this.else_commands=else_commands;
    }
    prettyPrint(){
        var head1=["if "+this.condition.prettyPrint()+" then"]
        var prettyPrintC=prettyPrintCommands(this.then_commands);
        var body1=appendStringBeforeAll("      ",prettyPrintC);
        var head2=["else"]
        prettyPrintC=prettyPrintCommands(this.else_commands);
        var body2=appendStringBeforeAll("      ",prettyPrintC);
        var end=["fi"];
        return head1.concat(body1).concat(head2).concat(body2).concat(end);
    }
    compile(compteur){
        var thenBody=compileList(this.then_commands,compteur+1);
        var elseBody=compileList(this.else_commands,compteur+1+thenBody.length+1)
        var headerIf=[new DoIf(this.condition,compteur+1,compteur+1+thenBody.length+1)];
        var headerElse=[new DoElse(compteur-1,compteur+1+thenBody.length+1+elseBody.length+1)];
        var fi=[new Fi(compteur+thenBody.length)];
        return headerIf.concat(thenBody).concat(headerElse).concat(elseBody).concat(fi);
    }
}

class DoIf extends DoCommand{
    //condition;
    //ifTrue;
    //ifFalse;
    constructor(condition,ifTrue,ifFalse){
        super();
        this.condition=condition;
        this.ifTrue=ifTrue;
        this.ifFalse=ifFalse;
        this.backlocalJournal=new Map();
    }
    step(memory,actionNumber,line,listCommand){
        var nextLine;
        var direction=this.localJournal.get(actionNumber);
        if(direction!=undefined){
            if(direction){
                nextLine=this.ifTrue;
            }
            else{
                nextLine=this.ifFalse;
            }
        }
        else{
            if(this.condition.eval(memory).toInt()==0){
                nextLine=this.ifFalse;
                this.localJournal.set(actionNumber,false);
            }
            else{
                nextLine=this.ifTrue
                this.localJournal.set(actionNumber,true);
            }
        }
        return [memory,nextLine]
    }
    back(memory,actionNumber,line){
        return [memory,line-1]
    }
    resetJournal(){
        this.localJournal=new Map();
    }
}

class DoElse extends DoCommand{
    //upIf;
    //exit;
    //condition;
    constructor(upIf,exit){
        super();
        this.condition=false;
        this.upIf=upIf;
        this.exit=exit;
    }
    step(memory,actionNumber,line,listCommand){
        this.condition=true;
        return [memory,this.exit]
    }
    back(memory,actionNumber,line){
        if(this.condition){
            return [memory,line-1]
        }
        else{
            return [memory,this.upIf]
        }
    }
    resetJournal(){

    }
}

class Fi extends DoCommand{
    //upElse;
    constructor(upElse){
        super();
        this.upElse=upElse
        this.localJournal=new Map();
    }
    step(memory,actionNumber,line){
        this.localJournal.set(actionNumber,true);
        return [memory,line+1]
    }
    back(memory,actionNumber,line){
        var nextLine;
        if(this.localJournal.get(actionNumber)==undefined){
            nextLine=this.upElse;
        }
        else{
            nextLine=line-1
        }
        return [memory,nextLine]
    }
    resetJournal(){
        this.localJournal=new Map();
    }
};

class SetCmmd extends Command{
    //variable;
    //expression;
    constructor(variable, expression){
        super();
        this.variable=variable;
        this.expression=expression;
    }
    prettyPrint(){
        console.log("test setcmd ", this.variable, this.expression)
        return [this.variable.prettyPrint()+" := "+this.expression.prettyPrint()]
    }
    compile(){
        return [new DoSet(this.variable,this.expression)];
    }
}

class DoSet extends DoCommand{
    //variable;
    //expression;
    constructor(variable, expression){
        super();
        this.variable=variable;
        this.expression=expression;
        this.localJournal=new Map();
    }
    step(memory,actionNumber,line){
        var lookUpJournal=this.localJournal.get(actionNumber);
        if(lookUpJournal!=undefined){
            memory.set(this.variable.name,lookUpJournal[1]);
        }
        else{
            var oldValue=memory.get(this.variable.name);
            var newValue=this.expression.eval(memory);
            memory.set(this.variable.name,newValue);
            this.localJournal.set(actionNumber,[oldValue,newValue]);
        }
        return [memory,line+1,[this.variable.name]];        
    }
    back(memory,actionNumber,line){
        console.log(this.localJournal,actionNumber)
        var oldValue=this.localJournal.get(actionNumber)[0];
        console.log(this.localJournal,actionNumber)
        if(oldValue==undefined ){
            memory.delete(this.variable.name);
        }
        else{
            memory.set(this.variable.name,oldValue);
        }
        return [memory,line-1];
    }
    resetJournal(){
        this.localJournal=new Map();
    }
}

class Progr extends Program{ 
    //input;
    //body;
    //out;
    constructor(i,b,o){
        super();
        this.input=i;
        this.body=b;
        this.out=o;
    }
    prettyPrint(){
        console.log(this.input[0])
        var decl="read ";
        for(var i=0;i<this.input.length-1;i++){
            decl=decl+this.input[i].prettyPrint()+", ";
        }
        decl=decl+(this.input[this.input.length-1]).prettyPrint();
        var body=appendStringBeforeAll("      ",prettyPrintCommands(this.body))
        var result="write ";
        for(var i=0;i<this.out.length-1;i++){
            result=result+this.out[i].prettyPrint()+", ";
        }
        result=result+this.out[this.out.length-1].prettyPrint();
        var PC=["%"];
        return [decl].concat(PC).concat(body).concat(PC).concat([result]);
    }
    compile(){
        return new DoProgr([new DoRead(this.input),new PourcentBegin()].concat(compileList(this.body,2)).concat([new PourcentEnd,new DoWrite(this.out)]));
    }
}
module.exports.EqExpr=EqExpr;
module.exports.ConsExpr=ConsExpr;
module.exports.HdExpr=HdExpr;
module.exports.TlExpr=TlExpr;
module.exports.NlExpr=NlExpr;
module.exports.CstExpr=CstExpr;
module.exports.VarExpr=VarExpr;
module.exports.WhileCmmd=WhileCmmd;
module.exports.ForCmmd=ForCmmd;
module.exports.IfCmmd=IfCmmd;
module.exports.SetCmmd=SetCmmd;
module.exports.NopCmmd=NopCmmd;
module.exports.Progr=Progr;

const parserWhile=require("./parserWhile.js");
const abcd=require("./exec.js");

class DoRead extends DoCommand{
    //listVar;
    //listPrevious;
    constructor(listVar){
        super();
        this.listVar=listVar;
        this.listPrevious=[]
        for(var i=0;i<listVar.length;i++){
            this.listPrevious=this.listPrevious.concat(["nil "]);
        }
    }
    step(memory,actionNumber,line,listCommand){
        var lenVariable=this.listVar.length;
        var listVarName=[];
        var stopped=false;
        for(var i=0; i<lenVariable; i++){
            listVarName=listVarName.concat([this.listVar[i].name])
            var value=prompt("Please enter the value of "+this.listVar[i].name,this.listPrevious[i]);
            if (value==null){
                abcd.stop()
                stopped=true
            }
            else{
                this.listPrevious[i]=value;
                memory.set(this.listVar[i].name,parserWhile.parserExpression(value).eval());
            }
        }
        for(var i=1;i<listCommand.length-1;i++){
            listCommand[i].resetJournal();
        }
        if(stopped){
            return [memory,line,listVarName];
        }
        else{
            return [memory,line+1,listVarName];
        }
    }
    back(memory,actionNumber,line){
        memory=new Map();
        return [memory,line-1];
    }
}

class DoWrite extends DoCommand{
    //listVar;
    constructor(listVar){
        super();
        this.listVar=listVar;
    }
    step(memory,actionNumber,line){
        var listVarName=[]
        for(var i=0;i<this.listVar.length;i++){
            listVarName=listVarName.concat([this.listVar[i].name]);
        }
        return [memory,line+1,undefined,listVarName];
    }
    back(memory,actionNumber,line){
        return [memory,line-1]
    }
}

class PourcentBegin extends DoCommand{
    step(memory,actionNumber,line){
        return [memory,line+1];
    }
    back(memory,actionNumber,line){
        return [memory,line-1]
    }
    resetJournal(){

    }
}

class PourcentEnd extends DoCommand{
    step(memory,actionNumber,line){
        return [memory,line+1];
    }
    back(memory,actionNumber,line){
        return [memory,line-1]
    }
    resetJournal(){
        
    } 
}

class DoProgr extends DoProgram{
    //listCommand;
    //nextLine;
    //previousLine;
    //actionNumber;
    //lastModif;
    //varReturn;
    constructor(listCommand){
        super();
        this.listCommand=listCommand;
        this.nextLine=0;
        this.actionNumber=-2;
        this.memory=new Map();
        this.direction=true;
    }
    step(){
        if(this.nextLine<this.listCommand.length){
            console.log("step",this.nextLine)
            this.actionNumber=this.actionNumber+1;
            var content=this.listCommand[this.nextLine].step(this.memory,this.actionNumber,this.nextLine,this.listCommand);
            this.memory=content[0];
            console.log(this.listCommand[this.nextLine],this.memory);
            this.previousLine=this.nextLine
            this.nextLine=content[1];
            this.lastModif=content[2];
            this.varReturn=content[3];
        }
    }
    back(){
        if(this.previousLine>=0){
            console.log("back",this.actionNumber,this.listCommand[this.previousLine]);
            console.log(this.previousLine,this.nextLine);
            var content=this.listCommand[this.previousLine].back(this.memory,this.actionNumber,this.previousLine,this.listCommand);
            this.memory=content[0];
            console.log(this.listCommand[this.previousLine],this.memory);
            this.nextLine=this.previousLine;
            this.previousLine=content[1];
            this.actionNumber=this.actionNumber-1;
            this.lastModif=undefined;
            this.varReturn=undefined
        }
    }
    getMemoryLine(){
        var a=this.memory.entries();
        console.log(a);
        var t=a.next();
        var x=[];
        var y;
        while(!t.done){
            var y=t.value;
            if(this.lastModif!=undefined  && this.lastModif.indexOf(y[0])!=-1){
                x=x.concat(['<li id="lastModif"><p>'+y[0]+" := "+y[1].prettyPrint()+'</p></li>']);
            }
            else if(this.varReturn!=undefined  && this.varReturn.indexOf(y[0])!=-1){
                x=x.concat(['<li id="return"><p>'+y[0]+" := "+y[1].prettyPrint()+'</p></li>']);
            }
            else{
                x=x.concat(['<li><p>'+y[0]+" := "+y[1].prettyPrint()+'</p></li>']);
            }
            t=a.next();
        }
        return [x,this.nextLine];
    }
}

/*console.log(new Progr("trgrt","rgrtg","rgrtg"))
console.log(new SetCmmd("trgrt","rgrtg"))
console.log(new NopCmmd());
console.log(new IfCmmd("rrt","er","ef"))
console.log(new WhileCmmd("trgrt","rgrtg"))
console.log(new ForCmmd("trgrt","rgrtg"))

var test= new ConsExpr(new HdExpr(new ConsExpr(new NlExpr(),new NlExpr())),new TlExpr(new ConsExpr(new CstExpr("c"),new VarExpr("A"))));
var test1= new EqExpr(test,new NlExpr);
var test2= new ConsValue(new CstValue("c"),new NlValue)
var test3= new ConsExpr(new CstExpr("c"),new NlExpr)
var test4= new HdExpr(test3);
var test5= new TlExpr(test3);
var test6= new HdExpr(test4);
var test7= new TlExpr(test4);
console.log(test3)
var test8= new EqExpr(test3,test3);
var test9= new EqExpr(test3,test4);
console.log(test.prettyPrint());
console.log(test1.prettyPrint());
console.log(test2.prettyPrint());
console.log(test3.eval().prettyPrint());
console.log(test4.eval().prettyPrint(),1);
console.log(test5.eval().prettyPrint());
console.log(test6.eval().prettyPrint());
console.log(test7.eval().prettyPrint());
console.log(test8.eval().prettyPrint());
console.log(test9.eval().prettyPrint());
var test=parserWhile.parserProgram("read   X , Y %  R := X ; R:= Y; G:=(cons X Y ) % write R ");
console.log(test);
console.log(test.prettyPrint());
var test1=test.compile();
console.log(test1);
test1.initMemory([parserWhile.parserExpression("(cons nil nil)"), parserWhile.parserExpression("nil ")])

test1.step();
test1.step();
test1.step();
test1.back();
test1.back();
test1.back();
test1.step();
test1.step();
test1.step();

var test2 =parserWhile.parserProgram("read   X,Y  %  T := nil ; for X do Y := (cons nil Y ) od; B:=nil  % write R ");
console.log(2,test2);
test2=test2.compile();
console.log(3,test2);
test2.initMemory([parserWhile.parserExpression(" (cons nil (cons nil nil ) ) "), parserWhile.parserExpression("nil ")]);
test2.step();
test2.step();
test2.step();
test2.step();
test2.step();
test2.step();
test2.step();
test2.back();
test2.back();
test2.back();
test2.step();
test2.step();
test2.step();

var test3 =parserWhile.parserProgram("read   X,Y  %  T := nil ; while X do Y := (cons nil Y ); X:=(tl X) od; B:=nil  % write R ");
console.log(2,test3);
test3=test3.compile();
console.log(3,test3);
test3.initMemory([parserWhile.parserExpression(" (cons nil (cons nil nil ) ) "), parserWhile.parserExpression("nil ")]);
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
console.log("back===============");
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
console.log("back===============");
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();
test3.step();*/

/*test3.back();
test3.back();
test3.back();
test3.back();
test3.back();
test3.back();*/


/*var test4 =parserWhile.parserProgram("read   X,Y  % Y:=nil ; for X do X:= (tl X ) od ; J := (cons nil nil ); F:=nil  % write R");
console.log(2,test4);
test4=test4.compile();
console.log(3,test4);
test4.initMemory([parserWhile.parserExpression(" (cons nil (cons nil nil ) ) "), parserWhile.parserExpression("nil ")]);
test4.step();
console.log(1)
test4.step();
console.log(2)
test4.step();
console.log(3)
test4.step();
console.log(4)
test4.step();
console.log(5)
test4.step();
console.log(6)
test4.step();
console.log(7)
test4.step();
console.log(8)
test4.back();
console.log(9)
test4.back();
console.log(10)
test4.back();
console.log(11)
test4.back();
console.log(12)
test4.back();
console.log(13)
test4.back();
console.log(14)
test4.back();
console.log(15)
test4.back();
console.log(16)
test4.step();
console.log(17)
test4.step();
console.log(18)
test4.step();
console.log(19)
test4.step();
console.log(20)
test4.step();
console.log(21)
test4.step();
console.log(22)
test4.step();
console.log(23)
test4.step();
console.log(24)
test4.back();
console.log(25)
test4.back();
console.log(26)
test4.back();
console.log(27)
test4.back();
console.log(28)
test4.back();
console.log(29)
test4.back();
console.log(30)
test4.back();
console.log(31)
test4.back();
console.log(32)*/

var stringToPrograms=function(string){
    var program=parserWhile.parserProgram(string);
    var programList=program.prettyPrint();
    var doProgram=program.compile();
    return [programList,doProgram];
}

module.exports.stringToPrograms=stringToPrograms;