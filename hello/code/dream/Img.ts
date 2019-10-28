class Img extends Box{
    public static resItems:any[];
    public static resHash;
    private static preloadItems:any[];
    private static preloadIndex=0;
    private static loadHash={};
    private static shapeHash={};
    public static init(){
		var text=IO.readFile("img/-pack.json");
		Img.resItems=JSON.parse(text);
		Img.resHash={};
		for(var i=0;i<Img.resItems.length;i++){
			var arr=Img.resItems[i];
			Img.resHash[arr[0]]=arr;
		}
    }
    public static loadAll(doLoading:any[]){
        Img.preloadItems=[];
        Img.preloadIndex=0;
        for(var i=0;i<Img.resItems.length;i++){
            var resArr=Img.resItems[i] as any[];
            if(resArr.length>=6) continue;
            var url=resArr[0] as string;
            if(url.indexOf("./")==0) continue;
            Img.preloadItems.push("img/"+url+"?"+resArr[1]);
        }
        Img.loadAllHandler(doLoading);
    }
    private static loadAllHandler(doLoading){
        call(doLoading,Img.preloadIndex,Img.preloadItems.length);
        if(Img.preloadIndex>=Img.preloadItems.length){
            return;
        }
        var url=Img.preloadItems[Img.preloadIndex];
        Img.load(url,[Img.loadAllHandler,doLoading]);
        Img.preloadIndex++;
    }
    public static load(url:string,target?:any){
        var loadArr:any[]=Img.loadHash[url];
        if(!loadArr){
            Bridge.loadTexture(url,Img.loadOk);
            loadArr=Img.loadHash[url]=[];
        }
        if(loadArr.indexOf(target)==-1) loadArr.push(target);
        
        if(Bridge.textureHash[url]) Img.loadOk(url);
    }
    private static loadOk(url:string){
        var loadArr:Img[]=Img.loadHash[url];
        for(var i=0;i<loadArr.length;i++){
            var target=loadArr[i];
            if(target instanceof Array){
                call(target);
            }
            else{
                target.render();
            }
        }
        loadArr.splice(0);
    }

    public url:string;
    private _src:string;

    constructor(){
        super();
        this.enabled=false;
    }
    public get src(){
        return this._src;
    }
    public set src(src){
        this._src=src;
        this.url=src;
        if(!src){
            this.setSize(0,0,true);
            this.drawImage(src);
            return;
        }
        if(src.match(/^\d*#/)){
            this.render();
            return;
        }
        var width=0;
        var height=0;
        this["_pivotX2"]=0;
        this["_pivotY2"]=0;
        var resArr:any[]=Img.resHash[src];
        if(resArr){
            width=resArr[2];
            height=resArr[3];
        }
        if(this.url.indexOf("./")==0){
            this.url=this.url.slice(2);
        }
        else if(this.url.indexOf(":")>-1){
            this.url=this.url;
        }
        else{
            if(!resArr){
                this.url=null;
                return;
            }
            if(resArr.length==4){
                this.url="img/"+this.url.replace(/\//g,"-")+"?"+resArr[1];
            }
            else if(resArr.length==6){
                var resArr2=Img.resHash["-pack.png"];
                this.url="img/-pack.png?"+resArr2[1];
            }
            else if(resArr.length==10){
                width=resArr[6];
                height=resArr[7];
                this["_pivotX2"]=-resArr[8];
                this["_pivotY2"]=-resArr[9];
                if(this["resetPivot"]) this["resetPivot"]();
                for(var i=0;i<Img.resItems.length;i++){
                    var resArr2=Img.resItems[i];
                    var url2=resArr2[0];
                    if(url2.indexOf("-pack-")!=0) continue;
                    var s1=url2.replace(/^\-pack\-/,"").replace(/\.png/,"-");
                    var s2=this._src.replace(/\//g,"-");
                    if(s2.indexOf(s1)==0){
                        this.url="img/"+url2+"?"+resArr2[1];
                        break;
                    }
                }
            }
        }
        this.setSize(width,height);
        this.render();
    }
    public render(){
        if(this.renderLocked) return;
        if(!this.url) return;
        if(this.url.match(/^\d*#/)){
            if(this.width==0||this.height==0){
                this.setSize(100,100,true);
            }
            var shapeKey=this.src+"-"+this.width+"-"+this.height;
            if(Img.shapeHash[shapeKey]){
                this.url=Img.shapeHash[shapeKey];
            }
            else{
                var url=this.drawImage(this.url);
                if(!url) return;
                this.url=Img.shapeHash[shapeKey]=url;
            }
        }
        var tex=Bridge.textureHash[this.url];
        if(!tex){
            Img.load(this.url,this);
            return;
        }
        var p:any[]=Img.resHash[this.src];
        var width=this.width;
        var height=this.height;
        if(!p||p.length==4){
            if(!p&&width==0) width=tex.width;
            if(!p&&height==0) height=tex.height;
            this.setSize(width,height,true);
            this.drawImage(this.url,tex.width,tex.height);
        }
        else if(p.length==6){
            this.drawImage(this.url,tex.width,tex.height,p[4],p[5],p[2],p[3]);
        }
        else if(p.length==10){
            this.drawImage(this.url,tex.width,tex.height,p[4],p[5],p[6],p[7]);
        }
    }
}