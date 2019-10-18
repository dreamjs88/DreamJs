class ImgClip extends Img{
    public playing=false;
    public duration=100;
    public loop=false;
    private baseSrc;
    private count=0;
    private index=0;
    private doEnd;
    public play(doEnd?:any){
        this.baseSrc=this.src;
        if(!this.baseSrc) return;
        this.baseSrc=this.baseSrc.replace(/(\d+)\.(\w+)$/g,"*.$2");
        if(Img.resHash[this.src]){
            var index=0;
            while(Img.resHash[this.baseSrc.replace(/\*/g,index+1)]){
                index++;
            }
            this.count=index;
        }
        if(this.count<=1) return;
        this.playing=true;
        this.doEnd=doEnd;
        var m=this.src.match(/(\d+)\.\w+$/);
        this.index=!m?0:int(m[1]);
        if(this.index>=this.count) this.index=0;
        Timer.clear(this,this.playHandle);
        this.playHandle();
    }
    private playHandle(){
        if(this.index>=this.count){
            this.playEnd();
            return;
        }
        this.index++;
        this.src=this.baseSrc.replace(/\*/g,this.index);
        Timer.addLate([this,this.playHandle],this.duration);
    }
    private playEnd(){
        if(this.loop){
            this.index=0;
            this.playHandle();
            return;
        }
        this.playing=false;
        if(this.doEnd) call(this.doEnd);
    }
}