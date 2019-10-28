class Math2{
    public static distance(x1:number,y1:number,x2:number,y2:number){
        return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    }
    public static createGuid(){
		var str=(new Date()["valueOf"]())+"";
		str=int((1+Math.random())*10000)+str;
		var str=parseFloat(str).toString(36);
		var guid=str.slice(-10);
        return guid;
    }
    public static angle(x1:number,y1:number,x2:number,y2:number){
        var dx=x2-x1;
        var dy=y2-y1;
        var r=Math.sqrt(dx*dx+dy*dy);
        var angle=180*Math.acos(dx/r)/Math.PI; 
        if(dy<0) return -angle;
        if(dy==0&&dx<0) return 180;
        return angle;
    }
    public static getParabolaPath(x1:number,y1:number,x2:number,y2:number,a=1){
        var path=[];
        x2-=x1;
        y2-=y1;
        a/=1000;
        var distance=Math2.distance(x1,y1,x2,y2);
        var b=(y2-a*x2*x2)/x2;
        var dir=x2>0?1:-1;
        var x=0;
        var y=0;
        while(x!=x2){
            var tangent=2*a*x+b;
            x+=dir*Math.sqrt(0.1*distance/(tangent*tangent+1));
            if((dir==1&&x>x2)||(dir==-1&&x<x2)){
                x=x2;
            }
            y=a*x*x+b*x;
            path.push([x1+x,y1+y]);
        }
        return path;
    }
    public static getParabolaPath2(x:number,y:number,angle:number,v:number,g:number){
        var path=[];
        var angle=angle*Math.PI/180;
        for(var t=0;t<100;t++){
            var x2=v*t*Math.cos(angle);
            var y2=v*t*Math.sin(angle)+g*t*t;
            path.push([x+x2,y+y2]);
        }
        return path;
    }
}