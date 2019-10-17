class Sound{
    public node;
    public playing=false;
    public static play(src:string){
        var sound=new Sound();
        sound.src="sound/"+src;
        sound.play();
    }
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