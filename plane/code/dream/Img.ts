class Img extends Box{
    public static resItems:any[];
    public static resHash;
    private static loadHash={};
    public url:string;
    private _src:string;
    public static init(){
		var text=IO.readFile("img/-pack.json");
		Img.resItems=JSON.parse(text);
		Img.resHash={};
		for(var i=0;i<Img.resItems.length;i++){
			var arr=Img.resItems[i];
			Img.resHash[arr[0]]=arr;
		}
    }
    public static load(url:string,target?:any){
        var loadArr:any[]=Img.loadHash[url];
        if(!loadArr){
            Core.loadTexture(url,null,Img.loadOk);
            loadArr=Img.loadHash[url]=[];
        }
        if(loadArr.indexOf(target)==-1) loadArr.push(target);

        if(Core.textureHash[url]) Img.loadOk(url);
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

    constructor(){
        super();
        this["_isImg"]=true;
        this.enabled=false;
    }
    public get src(){
        return this._src;
    }
    public set src(v){
        this._src=v;
        this.url=v;
        var width=0;
        var height=0;
        this["_pivotX2"]=0;
        this["_pivotY2"]=0;
        var resArr:any[]=Img.resHash[this._src];
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
        var tex=Core.textureHash[this.url];
        if(!tex){
            Img.load(this.url,this);
            return;
        }
        var p:any[]=Img.resHash[this._src];
        var width=this.width;
        var height=this.height;
        if(!p||p.length==4){
            if(!p&&width==0) width=tex.width;
            if(!p&&height==0) height=tex.height;
             this.drawImage(this.url,width,height,tex.width,tex.height);
        }
        else if(p.length==6){
            this.drawImage(this.url,width,height,tex.width,tex.height,p[4],p[5],p[2],p[3]);
        }
        else if(p.length==10){
            this.drawImage(this.url,width,height,tex.width,tex.height,p[4],p[5],p[6],p[7]);
        }
    }
}