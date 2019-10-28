(function(){
    window.Build={};
    Build.electron;
    Build.fs;
    Build.path;
    Build.aspect=0;
    Build.start=function(funcBack){
        Build.electron=require("electron");
        Build.fs=require("fs");
        Build.path=__dirname.replace(/\\/g,"/").replace(/[^\/]+$/,"");

        var code=Build.fs.readFileSync(Build.path+"build/BuildCode.js")+"";
        eval(code);
        code=Build.fs.readFileSync(Build.path+"build/BuildRes.js")+"";
        eval(code);

        BuildCode.start();
        Build.bin();
        BuildRes.start(funcBack);
    }
    Build.bin=function(){
        if(!Build.fs.existsSync(Build.path+"bin/js")){
            Build.fs.mkdirSync(Build.path+"bin/js");
        }
        if(!Build.fs.existsSync(Build.path+"bin/js/bridge")){
            Build.fs.mkdirSync(Build.path+"bin/js/bridge");
        }

        var code=Build.fs.readFileSync(Build.path+"code/Main.ts")+"";
        code=code.replace(/\r/g,"").replace(/\s*=\s*/g,"=");
        var m=code.match(/\n[\s\w]+\baspect=(\d+)/);
        Build.aspect=!m?0:parseInt(m[1]);
        
        m=code.match(/\n[\s\w]+\bbridge=\"(\w+)\"/);
        var bridge=!m?"dom":m[1];
        if(bridge!="dom"&&!Build.fs.existsSync(Build.path+"build/"+bridge)){
            bridge="dom";
        }
        m=code.match(/\n[\s\w]+\bbridgeSite=\"(\w+)\"/);
        var bridgeSite=!m?"web":m[1];
        if(bridgeSite!="web"&&!Build.fs.existsSync(Build.path+"build/"+bridge+"/"+bridgeSite)){
            bridgeSite="web";
        }
        
        var files=Build.fs.readdirSync(Build.path+"bin/js/bridge");
        for(var i=0;i<files.length;i++){
            var file=files[i];
            Build.fs.unlinkSync(Build.path+"bin/js/bridge/"+file);
        }
        
        var imports=[];
        if(bridge!="dom"){
            var fileData=Build.fs.readFileSync(Build.path+"build/"+bridge+"/core-"+bridge+".js");
            Build.fs.writeFileSync(Build.path+"bin/js/bridge/core-"+bridge+".js",fileData);
            imports.push("js/bridge/core-"+bridge+".js?"+fileData.length);
        }
        var fileData=Build.fs.readFileSync(Build.path+"build/"+bridge+"/bridge-"+bridge+".js");
        Build.fs.writeFileSync(Build.path+"bin/js/bridge/bridge-"+bridge+".js",fileData);
        imports.push("js/bridge/bridge-"+bridge+".js?"+fileData.length);

        var attachPath=Build.path+"bin/js/attach/";
        var queues=[""];
        while(queues.length>0){
            var queue=queues.shift();
            if(queue==""&&!Build.fs.existsSync(attachPath)) break;
            var files=Build.fs.readdirSync(attachPath+queue);
            for(var i=0;i<files.length;i++){
                var file=files[i]+"";
                var stat=Build.fs.statSync(attachPath+queue+file);
                if(stat.isDirectory()){
                    queues.push(queue+file+"/");
                    continue;
                }
                if(!file.match(/\.js$/)) continue;
                imports.push("js/attach/"+queue+file+"?"+stat.size);
            }
        }
        imports.push("js/code.js?"+parseInt(new Date().valueOf()/1000));
        var code="window.imports=[\n"
        for(var i=0;i<imports.length;i++){
            var url=imports[i];
            code+="\t\""+url+"\",\n";
        }
        code=code.replace(/,\n$/,"\n");
        code+="]";
        Build.fs.writeFileSync(Build.path+"bin/js/imports.js",code);
        
        Build.binSite(bridge,bridgeSite);
    }
    Build.binSite=function(bridge,bridgeSite){
        if(bridgeSite=="web") return;
        var files=Build.fs.readdirSync(Build.path+"bin");
        for(var i=0;i<files.length;i++){
            var file=files[i];
            var stat=Build.fs.statSync(Build.path+"bin/"+file);
            if(stat.isDirectory()) continue;
            if(file.indexOf(".")==0) continue;
            if(file=="index.html") continue;
            Build.fs.unlinkSync(Build.path+"bin/"+file);
        }

        var fromPath=Build.path+"build/"+bridge+"/"+bridgeSite+"/";
        var files=Build.fs.readdirSync(fromPath);
        for(var i=0;i<files.length;i++){
            var file=files[i];
            var stat=Build.fs.statSync(fromPath+file);
            if(stat.isDirectory()) continue;
            var fileData=Build.fs.readFileSync(fromPath+file);
            Build.fs.writeFileSync(Build.path+"bin/"+file,fileData);
        }

        if(bridgeSite=="wx"&&Build.fs.existsSync(Build.path+"bin/game.json")){
            var code=Build.fs.readFileSync(Build.path+"bin/game.json")+"";
            var dirName=Build.aspect==2?"landscape":"portrait";
            var code2=code.replace(/(\"deviceOrientation\" *: *\")(\w+)/,"$1"+dirName);
            if(code!=code2){
                Build.fs.writeFileSync(Build.path+"bin/game.json",code2);
            }
        }
        
    }
}());
Build.start();