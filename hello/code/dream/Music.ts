class Music{
    private static audio;
    private static playing=false;
    public static init(){
        Music.audio=document.createElement("audio");
        Dream.stage.on("touchstart",null,Music.onTouchStart);
    }
    public static play(name:string,doEnd?:any[]){
        Music.playing=true;
        Music.audio.src="sound/"+name+".mp3";
        Music.audio.loop=!doEnd;
        Music.audio.play();
        Music.audio.onended=!doEnd?null:function(){
            call(doEnd);
        }
    }
    public static pause(){
        Music.playing=false;
        Music.audio.pause();
    }
    public static resume(){
        Music.playing=true;
        Music.audio.play();
    }
    public static stop(){
        Music.playing=false;
        Music.audio.currentTime=0;
        Music.audio.play();
    }
    private static onTouchStart(){
        if(Music.audio&&Music.playing&&Music.audio.paused){
            Music.audio.play();
        }
    }
}