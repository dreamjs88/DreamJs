class Sound{
    private node;
    private startTime=0;
    private playing=false;
    public static play(src:string){
        var sound=new Sound();
        sound.src=src;
        sound.play();
    }
    constructor(){
        this.node=this.createNode();
    }
    private createNode(){
        var audio=document.createElement("audio");
        audio.load2=function(src,funcProgress){
            var step=0;
            var begin=function(){
                audio.src=src;
                audio.muted=true;
                audio.play();
            }
            var onProgress=function(time){
                if(step<2&&time==audio.duration) time*=0.99;
                funcProgress.call(null,time,audio.duration);
            }
            audio.oncanplaythrough=function(){
                step++
                if(step==2) onProgress(audio.duration);
            }
            audio.onprogress=function(){
                if(audio.buffered.length==0) return;
                var time=audio.buffered.end(audio.buffered.length-1);
                if(time>=audio.duration) step++;
                onProgress(time);
            }
            audio.onerror=audio.onabort=function(){
                setTimeout(begin,1000);
            }
            begin();
        }
        return audio;
    }
    public play(){
        this.startTime=this.node.currentTime;
        this.playing=true;
        this.node.play();
    }
    public pause(){
        this.playing=false;
        this.node.pause();
    }
    public load(src:string,doLoading){
        this.node.load2(src,function(time,duration){
            call(doLoading,time,duration);
        });
    }
    public get src():string{
        return this.node.src;
    }
    public set src(v){
        this.node.src=v;
    }
    public get duration():number{
        return this.node.duration;
    }
    public get currentTime():number{
        if(Dream.isIPhone){
            var minTime=this.playing?this.startTime:0;
            return Math.max(this.node.currentTime,minTime);
        }
        return this.node.currentTime;
    }
    public set currentTime(v){
        this.node.currentTime=v;
    }
    public get muted():boolean{
        return this.node.muted;
    }
    public set muted(v){
        this.node.muted=v;
    }
}