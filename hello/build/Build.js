(function(){
    window.Build={};
    Build.electron;
    Build.fs;
    Build.path;
    Build.start=function(){
        Build.electron=require("electron");
        Build.fs=require("fs");
        Build.path=__dirname.replace(/[^\/]+$/,"");

        var code=Build.fs.readFileSync(Build.path+"build/BuildRes.js")+"";
        eval(code);

        BuildRes.start(Build.start2);
    }
    Build.start2=function(){
        Build.buildCode();

        var script=document.createElement("script");
        document.body.appendChild(script);
        script.src="js/code.js";
    }
    Build.buildCode=function(){
        var items=[];
        var baseHash={};
        var queues=[""];
        while(queues.length>0){
            var queue=queues.shift();
            var files=Build.fs.readdirSync(Build.path+"code/"+queue);
            for(var i=0;i<files.length;i++){
                var file=files[i]+"";
                var stat=Build.fs.statSync(Build.path+"code/"+queue+file);
                if(stat.isDirectory()){
                    queues.push(queue+file+"/");
                    continue;
                }
                var name=file.replace(/\..+/,"");
                var ext=file.replace(/.+\./,"");
                if(name=="Core") continue;
                if(ext!="ts") continue;
                var code=Build.fs.readFileSync(Build.path+"code/"+queue+file)+"";
                if(!code.match(/\bclass\b/)) continue;
                var m=code.match(/ extends +(\w+) *\{/);
                var baseName=!m?null:m[1];
                baseHash[name]=baseName;
                items.push([queue+file,name,0]);
            }
        }
        for(var i=0;i<items.length;i++){
            var arr=items[i];
            var name=arr[1];
            var baseName=baseHash[name];
            while(baseName){
                arr[2]++;
                baseName=baseHash[baseName];
            }
        }
        items.sort(function(a1,a2){
            return a1[2]==a2[2]?0:(a1[2]>a2[2]?1:-1);
        })
        var code="";
        for(var i=0;i<items.length;i++){
            var file=items[i][0];
            var ext=file.replace(/.+\./,"");
            var text=Build.fs.readFileSync(Build.path+"code/"+file)+"";
            text=text.replace(/\r/g,"");
            if(ext=="ts") text=Build.convertTs(text);
            code+=text+"\n";
        }
        code+="Dream.init();";
        Build.fs.writeFileSync(Build.path+"bin/js/code.js",code);

        var url=Build.path+"bin/js/code-ver.txt";
        var ver=0;
        if(Build.fs.existsSync(url)) ver=parseInt(Build.fs.readFileSync(url));
        ver++;
        Build.fs.writeFileSync(Build.path+"bin/js/code-ver.txt",ver+"");
    }
    Build.convertTs=function(text){
        var code="";
        var className;
        var arr=text.replace(/\r/g,"").split("\n");
        var isComment=false;
        for(var i=0;i<arr.length;i++){
            var str=arr[i];
            var m=str.match(/^\s+/);
            var tab=!m?"":m[0];
            str=str.replace(/^\s+/g,"");
            if(str.indexOf("//")==0){
                code+="\n";
                continue;
            }
            if(str.indexOf("/*")==0) isComment=true;
            if(isComment){
                if(str.indexOf("*/")>-1) isComment=false;
                code+="\n";
                continue;
            }
            str=Build.enString(str);
            str=str.replace(/  +/g," ");
            str=str.replace(/ as [\w\[\]]+/g,"");
            str=str.replace(/^private /,"public ");
            str=str.replace(/^constructor\b/,"public ctor");
            str=str.replace(/ (get|set) /g," $1_");
            str=str.replace(/\?:/g,":");
            var m=str.match(/\w+/g);
            var word1=!m?"":m[0]||"";
            var word2=!m?"":m[1]||"";
            if(word1=="class"){
                className=word2;
                m=str.match(/ extends (\w+)/);
                var baseName=!m?null:m[1];
                str="(function(){"
                    +"var proto=Core.createClass(\""+className+"\""+(!baseName?"":","+baseName)+");"
            }
            else if((word1=="static"||word2=="static")&&str.indexOf("(")==-1){
                str=str.replace(/:[\w\[\]]+/g,"");
                str=str.replace(/^\w+ \w+ /,className+".");
            }
            else if((word1=="static"||word2=="static")&&str.indexOf("(")>-1){
                str=str.replace(/:[\w\[\]]+/g,"");
                str=str.replace(/.+ (\w+)\s*\(/,className+".$1=function(");
            }
            else if(word1=="public"&&str.indexOf("(")==-1){
                str=str.replace(/:[\w\[\]]+/g,"");
                str=str.replace(/^\w+ /,"proto.");
            }
            else if(word1=="public"&&str.indexOf("(")>-1){
                str=str.replace(/:[\w\[\]]+/g,"");
                str=str.replace(/.+ (\w+)\s*\(/,"proto.$1=function(");
            }
            else if(word1=="var"){
                var n=str.indexOf("=");
                var str1=str.slice(0,n);
                var str2=str.slice(n);
                str1=str1.replace(/:[\w\[\]]+/g,"");
                str=str1+str2;
            }
            else if(word1=="super"){
                str="";
            }
            else if(word1=="for"){
                str=str.replace(/:[\w\[\]]+/g,"");
            }
            if(str.indexOf("=function(")>-1){
                var n=str.indexOf("(");
                var str1=str.slice(0,n);
                var str2=str.slice(n);
                var m=str2.match(/\w+=[^,\)]+/g);
                if(m){
                    var str3="";
                    str2=str2.replace(/(\w+)=[^,\)]+/g,"$1");
                    for(var j=0;j<m.length;j++){
                        var s=m[j];
                        var n=s.indexOf("=");
                        var s1=s.slice(0,n);
                        var s2=s.slice(n+1);
                        str3+="("+s1+"==null)?"+s1+"="+s2+":null;"
                    }
                    str=str1+str2+str3;
                }
            }
            str=tab+Build.deString(str);
            code+=str+"\n";
        }
        var n=code.lastIndexOf("}");
        code=code.slice(0,n);
        n=code.lastIndexOf("\n");
        code=code.slice(0,n+1);
        code+="    Core.bindGetterSetter(proto);\n"
        code+="})();"
        return code;
    }
    Build.enString=function(text){
        var str2="";
        for(var i=0;i<text.length;i++){
            var c=text.charAt(i);
            var c01=text.charAt(i-1);
            var c02=text.charAt(i-2);
            var q=null;
            if(c=="\"") q=c;
            if(c=="/"&&(c01=="("||c01=="=")) q=c;
            if(c=="/"&&c01==" "&&(c02=="("||c02=="=")) q=c;
            if(q){
                for(var j=i+1;j<text.length;j++){
                    var c2=text.charAt(j);
                    if(c2=="\\") j++;
                    if(c2==q) break;
                }
                var s=text.slice(i,j+1);
                s=s.replace(/ /g,"[#a]").replace(/:/g,"[#b]")
                s=s.replace(/,/g,"[#c]").replace(/\(/g,"[#d]");
                str2+=s;
                i=j;
                continue;
            }
            str2+=c;
        }
        return str2;
    }
    Build.deString=function(text){
        var str2="";
        for(var i=0;i<text.length;i++){
            var c=text.charAt(i);
            var c01=text.charAt(i-1);
            var c02=text.charAt(i-2);
            var q=null;
            if(c=="\"") q=c;
            if(c=="/"&&(c01=="("||c01=="=")) q=c;
            if(c=="/"&&c01==" "&&(c02=="("||c02=="=")) q=c;
            if(q){
                for(var j=i+1;j<text.length;j++){
                    var c2=text.charAt(j);
                    if(c2=="\\") j++;
                    if(c2==q) break;
                }
                var s=text.slice(i,j+1);
                s=s.replace(/\[#a\]/g," ").replace(/\[#b\]/g,":");
                s=s.replace(/\[#c\]/g,",").replace(/\[#d\]/g,"(");
                str2+=s;
                i=j;
                continue;
            }
            str2+=c;
        }
        return str2;
    }
}());
Build.start();