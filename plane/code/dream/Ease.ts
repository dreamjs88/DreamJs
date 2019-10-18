class Ease{
    public static linear(t:number,b:number,c:number,d:number):number{
        c=c-b;
        return c*t/d+b;
    }
    public static strongOut(t:number,b:number,c:number,d:number):number{
        c=c-b;
        t=t/d-1;
        return c*(t*t*t+1)+b;
    }
    public static strongIn(t:number,b:number,c:number,d:number):number{
        c=c-b;
        t=t/d;
        return c*t*t*t+b;
    }
    public static backOut(t:number,b:number,c:number,d:number,s:number=1.70158):number{
        c=c-b;
        t=t/d-1;
        return c*(t*t*((s+1)*t+s)+1)+b;
    }
    public static backIn(t:number,b:number,c:number,d:number,s:number=1.70158){
        c=c-b;
        t=t/d;
        return c*t*t*((s+1)*t-s)+b;
    }
    public static strongInOut(t:number,b:number,c:number,d:number):number{
        c=c-b;
        t=t/(d*0.5);
        if(t<1)return c*0.5*t*t*t+b;
        t-=2;
        return c*0.5*(t*t*t+2)+b;
    }
}