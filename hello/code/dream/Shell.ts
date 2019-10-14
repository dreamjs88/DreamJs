class Shell{
    public static available=false;
    public static electron;
    public static nativeImage;
    private static fs;
    private static http;
    private static xlsx;
    private static zipper;
    private static traceDiv;
    public static init(){
        window.trace=Shell.trace;
        if(!Dream.userAgent.match(/\belectron\b/i)) return;
        Shell.available=true;
        Shell.electron=window.require("electron");
        Shell.fs=window.require("fs");
        Shell.http=window.require("http");
        Shell.nativeImage=Shell.electron.nativeImage;

        window.onerror=Shell.onError;
        window.addEventListener("keydown",Shell.onKeyDown);
    }
    public static trace(){
        var text="";
        for(var i=0;i<arguments.length;i++){
            var s=arguments[i];
            text+=s+" ";
        }
        if(!Dream.isWeb){
            console.log(text);
            return;
        }
        var div=Shell.traceDiv;
        if(!div){
            div=Shell.traceDiv=document.createElement("div");
            div.selectable=true;
            div.style.cssText="position:absolute;overflow:hidden;overflow-y:auto;"
                +"left:0;top:0;width:"+window.innerWidth+"px;height:30px;font-family:Arial;"
                +"background:rgba(0,0,0,0.7);color:#ffffff;font-size:20px;";
        }
        if(!div.parentNode){
            document.body.appendChild(div);
            div.innerHTML="";
        }
        div.style.height="";
        var row=document.createElement("div");
        div.appendChild(row);
        row.selectable=true;
        row.style.cssText="margin:5px;margin-left:10px;";
        if(text.match(/^ +$/)) text="　";
        row.innerText=text;
        var h=Math.min(div.clientHeight,300);
        div.style.height=h+"px";
        div.style.top=(window.innerHeight-h)+"px";
        div.scrollTop=div.scrollHeight;
    }
    public static getFileSize(path:string):number{
        if(!Shell.fs.existsSync(path)) return 0;
        var stat=Shell.fs.statSync(path);
        return stat.size;
    }
    public static getSubDir(path:string):string[]{
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        var items=[];
        var arr=Shell.fs.readdirSync(path);
        for(var i=0;i<arr.length;i++){
            var file=arr[i];
            var stat=Shell.fs.statSync(path+"/"+file);
            if(stat.isDirectory()) file+="/";
            items.push(file);
        }
        return items;
    }
    public static readFile(path:string){
        if(!Shell.fs.existsSync(path)) return null;
        return Shell.fs.readFileSync(path)+"";
    }
    public static writeFile(path:string,text:string){
        Shell.fs.writeFileSync(path,text);
    }
    public static createFolder(path){
        if(Shell.fs.existsSync(path)) return;
        Shell.fs.mkdirSync(path);
    }
    public static deleteFile(path){
        if(!Shell.fs.existsSync(path)) return;
        Shell.fs.unlinkSync(path);
    }
    public static copyFile(path:string,toPath:string){
        if(!Shell.fs.existsSync(path)) return;
        Shell.fs.writeFileSync(toPath,Shell.fs.readFileSync(path));
    }
    public static deleteFolder(path:string){
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        if(!Shell.fs.existsSync(path)) return;
        var files=Shell.fs.readdirSync(path);
        for(var i=0;i<files.length;i++){
            var path2=path+"/"+files[i];
            if(Shell.fs.statSync(path2).isDirectory()){
                Shell.deleteFolder(path2);
                continue;
            }
            Shell.fs.unlinkSync(path2);
        }
        Shell.fs.rmdirSync(path);
    }
    public static copyFolder(path:string,toPath:string){
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        if(toPath.slice(-1)=="/") toPath=toPath.slice(0,-1);
        if(!Shell.fs.existsSync(path)) return;
        if(!Shell.fs.existsSync(toPath)) Shell.fs.mkdirSync(toPath);
        var files=Shell.fs.readdirSync(path);
        for(var i=0;i<files.length;i++){
            var path2=path+"/"+files[i];
            var toPath2=toPath+"/"+files[i];
            if(Shell.fs.statSync(path2).isDirectory()){
                Shell.copyFolder(path2,toPath2);
                continue;
            }
            Shell.fs.writeFileSync(toPath2,Shell.fs.readFileSync(path2));
        }
    }
    public static createServer(){
        var http=window.require("http");
        var server=http.createServer(function(request,response){
            var s=request.path.replace(/\?.+/g,"");
            s=s.replace(/[^\/]*^\//g,"");
            var path="server/Server.js";
            if(!Shell.fs.existsSync(path)) return;
            var Server=window.require(path);
            Server.start(request,response);
         });
        server.listen(8000);
    }
    public static readExcel(path:string,tab=0){
        if(!Shell.xlsx) Shell.xlsx=require("node-xlsx");
        var obj=Shell.xlsx.parse(path);
        return obj[tab].data;
    }
    public static zipFolder(path:string,toPath:string){
        if(!Shell.zipper) Shell.zipper=require("zip-local");
        Shell.zipper.sync.zip(path).compress().save(toPath);
    }
    private static onError(msg:string,url:string,line:number){
        var file=url.replace(/.+\//g,"");
        if(file=="code.js"){
            var text=IO.readFile("js/code.js");
            var arr=text.replace(/\r/g,"").split("\n");
            for(var i=line;i>=0;i--){
                var str=arr[i];
                if(str.indexOf("Core.createClass")==-1) continue;
                var m=str.match(/\"(\w+)\"/)
                file=m[1]+".ts";
                line-=i;
                break;
            }
        }
        trace("Error in "+file+"("+line+")\n"+msg);
    }
    private static onKeyDown(evt){
        if(evt.keyCode==116) window.close();
    }
    private static onTouchStart(evt){
        var div=Shell.traceDiv;
        if(div&&div.parentNode){
            if(evt.target!=div&&evt.target.parentNode!=div){
                div.parentNode.removeChild(div);
            }
        }
    }
}