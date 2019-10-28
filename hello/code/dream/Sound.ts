class Sound{
    private static items=[];
    private static context;
    private static bufferHash={};
    public static muted=false;
    public static init(){
        window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.msAudioContext;
        if(window.AudioContext) Sound.context=new window.AudioContext();
    }
    public static play(name:string){
        if(Sound.muted) return;
        var url="sound/"+name+".mp3";
        if(Sound.context){
            Sound.playContext(url);
            return;
        }
        var audio=document.createElement("audio");
        Sound.items.push(audio);
        audio.src=url;
        audio.play();
    }
    public static stopAll(){
        for(var i=0;i<Sound.items.length;i++){
            var obj=Sound.items[i];
            if(obj.pause) obj.pause();
            if(obj.stop) obj.stop();
        }
    }
    private static playContext(url:string){
        var buffer=Sound.bufferHash[url];
        if(buffer==false) return;
        if(buffer==null){
            Sound.load(url,[Sound.playContext,url]);
            return;
        }
        var source=Sound.context.createBufferSource();
        Sound.items.push(source);
        source.buffer=buffer;
        source.connect(Sound.context.destination);
        source.start();
        Sound.context.resume();
    }
    public static load(url:string,doLoad){
        if(!window.AudioContext){
            call(doLoad);
            return;
        }
        Sound.bufferHash[url]=false;
        var xhr=new window.XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.responseType="arraybuffer";
        xhr.send();
        xhr.onload=function(){
            Sound.context.decodeAudioData(xhr.response,function(buffer){
                Sound.bufferHash[url]=buffer;
                call(doLoad);
            });
        }
    }
}