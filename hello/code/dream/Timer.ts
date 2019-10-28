class Timer{
    public static interval=17;
    public static now=0;
    public static scale=1;
    public static items=[];
    private static startTime=0;
    private static frameTime=0;
    private static lastBgColor:string;
    public static init(){
        window.requestAnimationFrame(Timer.onEnterFrame);
        Timer.startTime=new Date().valueOf();
    }
    public static addLate(foo,time=0,autoClear=true){
        Timer.items.push([foo,Timer.now+time,false,autoClear]);
    }
    public static addLoop(foo,autoClear=true){
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo2=arr[0];
            if(foo[0]==foo2[0]&&foo[1]==foo2[1]){
                Timer.items[i]=[foo,-1,false,autoClear];
                return;
            }
        }
        Timer.items.push([foo,-1,false,autoClear]);
    }
    public static clear(caller,func){
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo=arr[0];
            var finished=arr[2];
            if(foo[0]==func||(foo[0]==caller&&foo[1]==func)){
                finished=arr[2]=true;
            }
        }
    }
    private static onEnterFrame(){
        window.requestAnimationFrame(Timer.onEnterFrame);
        Timer.now=new Date().valueOf()-Timer.startTime;
        if(Timer.now-Timer.frameTime<0.75*Timer.interval){
            return;
        }
        Timer.scale=Math.min((Timer.now-Timer.frameTime)/Timer.interval,3);
        Timer.frameTime=Timer.now;
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo=arr[0];
            var time=arr[1]
            var finished=arr[2];
            var autoClear=arr[3];
            var caller=foo[0];
            if(autoClear&&caller instanceof Box&&!Dream.stage.contains(caller)){
                finished=arr[2]=true;
            }
            if(finished) continue;
            if(time==-1){
                call(foo);
            }
            else{
                if(Timer.now>=time){
                    finished=arr[2]=true;
                    call(foo);
                }
            }
        }
		for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var finished=arr[2];
            if(!finished) continue;
            Timer.items.splice(i,1);
            i--;
        }
        if(Timer.lastBgColor!=Dream.bgColor){
            Timer.lastBgColor=Dream.bgColor;
            Bridge.setBgColor(Dream.bgColor);
        }
        Bridge.render();
    }
}