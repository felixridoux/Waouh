(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

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
    },{"./exec.js":2,"./parserWhile.js":4}],2:[function(require,module,exports){
    console.log("aled");
    const ast=require("./ast.js");
    console.log("aled");
    var programs;
    var listBreakPoint;
    var memoryLine;
    var oldCurrent;
    var stopClicked=false;
    createMain("read X, L  % for (cons nil (cons nil nil)) do X:= (hd X); L := (cons X L) od; if X=?L then nop else X:=L fi; while X do X:=(tl X) od ; F:=nil  % write X, L ");
    
    function createMain(prog){
        $('ul:first').children().remove();
        programs=ast.stringToPrograms(prog)
        listBreakPoint=[];
        memoryLine=programs[1].getMemoryLine();
        oldCurrent="l"+memoryLine[1];
        for(var i=0;i<programs[0].length;i++){
            $('ul:first').append('<li id="l'+i+'" state="notCurrent" clicked="false"><p>'+programs[0][i]+'</p></li>');
        }
        for(var i=0;i<programs[0].length;i++){
            document.getElementById("l"+i).onclick = clickReact("l"+i);
        }
        update();
    }
    
    
    function update(){
        document.getElementById(oldCurrent).setAttribute("state","notCurrent");
        if(memoryLine[1]<programs[0].length){
            document.getElementById("l"+memoryLine[1]).setAttribute("state","current");
            oldCurrent="l"+memoryLine[1];
        }
        $('ul:last').children().remove();
        for(var i=0;i<memoryLine[0].length;i++){
            $('ul:last').append(memoryLine[0][i]);
            }
        }
    
    document.getElementById("back").onclick = function(){
        if(inJump){
            return stop()
        }
        else{
            return back()
        }
    }
    document.getElementById("step").onclick = function(){
        if(inJump){
            return stop()
        }
        else{
            return step()
        }
    };
    document.getElementById("stop").onclick = stop;
    document.getElementById("jump").onclick = function(){
        if(inJump){
            return stop()
        }
        else{
            return jump()
        };
    }
    document.getElementById("jump back").onclick = function(){
        if(inJump){
            return stop()
        }
        else{
            return jumpBack()
        }
    };
    document.getElementById("edit").onclick = function(){
        if(inJump){
            return stop()
        }
        else{
            return edit()
        }
    };
    document.getElementById("commit").onclick = commit;
    
    function back(){
        programs[1].back();
        memoryLine=programs[1].getMemoryLine();
        update();
    }
    
    function step(){
        programs[1].step();
        memoryLine=programs[1].getMemoryLine();
        update();
    }
    
    function stop(){
        stopClicked=true;
    }
    var inJump=false
    
    function jump(){
        inJump=true
        stopClicked=false;
        numberStep=0;
        document.getElementById("jump").setAttribute("pressed","true");
        step();
        setTimeout(execJump,500)
    }
    
    function jumpBack(){
        inJump=true
        stopClicked=false;
        numberStep=0;
        document.getElementById("jump back").setAttribute("pressed","true");
        back();
        setTimeout(execJumpBack,500)
    }
    
    function execJump(){
        console.log("l"+memoryLine[1],listBreakPoint);
        if(!stopClicked && numberStep<10000 && memoryLine[1]<programs[0].length && listBreakPoint.indexOf("l"+memoryLine[1])==-1){
            step();
            numberStep++;
            setTimeout(execJump,500);
        }
        else{
            update();
            document.getElementById("jump").setAttribute("pressed","false");
            inJump=false
        }
    }
    
    function execJumpBack(){
        console.log("l"+memoryLine[1],listBreakPoint);
        if(!stopClicked && numberStep<10000 && memoryLine[1]>0 && listBreakPoint.indexOf("l"+memoryLine[1])==-1){
            back();
            numberStep++;
            setTimeout(execJumpBack,500)
        }
        else{
            update();
            document.getElementById("jump back").setAttribute("pressed","false");
            inJump=false
        }
    }
    
    function edit(){
        document.getElementById("splitLeftMain").setAttribute("class","notVisible");
        document.getElementById("splitLeftText").setAttribute("class","visible");
        var prog="";
        for(var i=0;i<programs[0].length-1;i++){
            prog=prog+"    "+programs[0][i]+"\n";
        }
        prog=prog+"    "+programs[0][programs[0].length-1];
        document.getElementById("text").value=prog;
    }
    
    function commit(){
        stop()
        createMain(document.getElementById("text").value);
        update();
        document.getElementById("splitLeftMain").setAttribute("class","visible");
        document.getElementById("splitLeftText").setAttribute("class","notVisible");
    }
    
    function clickReact(id){
        console.log("aaaaaaa");
        return function(){
            console.log("eeeeeee");
            var value=document.getElementById(id).getAttribute("clicked");
            if(value=="true"){
                document.getElementById(id).setAttribute("clicked","false");
                var index = listBreakPoint.indexOf(id);
                if (index > -1) {
                    listBreakPoint.splice(index, 1);
                }
            }
            else{
                document.getElementById(id).setAttribute("clicked","true");
                listBreakPoint=listBreakPoint.concat([id]);
            }
        }
    }
    
    module.exports.stop=stop;
    },{"./ast.js":1}],3:[function(require,module,exports){
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
    },{}],4:[function(require,module,exports){
    
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
    },{"./ast.js":1,"./parserUtils.js":3}]},{},[2]);
    