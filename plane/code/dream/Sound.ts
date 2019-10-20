class Sound{
    public static bgm:Sound;
    public static play(name:string,loop=false){
        var sound=new Sound();
        sound.src="sound/"+name+".mp3";
        sound.loop=loop;
        sound.play();
        if(loop) Sound.bgm=sound;
        return sound;
    }

    public node;
    public playing=false;
    constructor(){
        this.node=document.createElement("audio");
    }
    public play(){
        this.playing=true;
        this.node.play();
    }
    public pause(){
        this.playing=false;
        this.node.pause();
    }
    public stop(){
        this.pause();
        this.currentTime=0;
    }
    public get src():string{
        return this.node.src;
    }
    public set src(v){
        this.node.src=v;
    }
    public get loop():boolean{
        return this.node.loop;
    }
    public set loop(v:boolean){
        this.node.loop=v;
    }
    public get duration():number{
        return this.node.duration;
    }
    public get currentTime():number{
        return this.node.currentTime;
    }
    public set currentTime(v){
        this.node.currentTime=v;
    }
    public get paused(){
        return this.node.paused||false;
    }
    public get muted():boolean{
        return this.node.muted;
    }
    public set muted(v){
        this.node.muted=v;
    }
}