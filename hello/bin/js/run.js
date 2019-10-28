(function(){
    window.Run={};
    Run.importIndex=0;
    Run.start=function(){
        if(navigator.userAgent.match(/\belectron\b/i)){
            Run.loadJs("../build/Build.js",Run.import);
        }
        else{
            Run.import();
        }
    }
    Run.import=function(){
        var r=parseInt(new Date().valueOf()/1000);
        Run.loadJs("js/imports.js?"+r,Run.importSub);
    }
    Run.importSub=function(){
        if(Run.importIndex>=window.imports.length){
            return;
        }
        var url=window.imports[Run.importIndex];
        Run.loadJs(url,Run.importSub);
        Run.importIndex++;
    }
    Run.loadJs=function(url,funcBack){
        var script=document.createElement("script");
        document.body.appendChild(script);
        if(navigator.userAgent.match(/\belectron\b/i)){
            url=url.replace(/\?.*$/,"");
        }
        script.src=url;
        script.onload=funcBack;
    }
})();
Run.start();
