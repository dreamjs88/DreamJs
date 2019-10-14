start();
function start(){
    var script=document.createElement("script");
    document.body.appendChild(script);
    if(navigator.userAgent.match(/\belectron\b/i)){
        script.src="../build/Build.js";
    }
    else{
        var xh=new XMLHttpRequest();
        var r=parseInt(new Date().valueOf()/1000);
        xh.open("GET","js/code-ver.txt?"+r,false);
        xh.send(null);
		r=xh.responseText;
        script.src="js/code.js?"+r;
    }
}
