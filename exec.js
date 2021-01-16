const ast=require("./ast.js");
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
    return function(){
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