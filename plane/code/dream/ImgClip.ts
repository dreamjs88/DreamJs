class ImgClip extends Img{
    public playing=false;
    public duration=100;
    public loop=false;
    public count=0;
    private _frame=0;
    private doEnd;
    public play(doEnd?:any){
        if(this.count<=1) return;
        this.playing=true;
        this.doEnd=doEnd;
        if(this.frame>=this.count) this._frame=1;
        Timer.clear(this,this.playHandle);
        Timer.addLate([this,this.playHandle],this.duration);
    }
    private playHandle(){
        if(this.frame>=this.count){
            this.playEnd();
            return;
        }
        this.frame++;
        Timer.addLate([this,this.playHandle],this.duration);
    }
    private playEnd(){
        if(this.loop){
            this.frame=1;
            this.playHandle();
            return;
        }
        this.playing=false;
        if(this.doEnd) call(this.doEnd);
    }
    public get src(){
        return this["_src"];
    }
    public set src(src:string){
        Img.prototype["set_src"].call(this,src);
        this.count=0;
        if(!Img.resHash[src]) return;
        var m=src.match(/(\d+)\.\w+$/);
        this._frame=!m?0:int(m[1]);
        if(this.frame==0) return;
        var n=0;
        while(Img.resHash[src.replace(/(\d+)\.(\w+)$/g,(n+1)+".$2")]){
            n++;
        }
        this.count=n;
    }
    public get frame(){
        return this._frame;
    }
    public set frame(v){
        this._frame=v;
        if(this.count==0) return;
        var src=this.src.replace(/(\d+)\.(\w+)$/g,v+".$2");
        Img.prototype["set_src"].call(this,src);
    }
}