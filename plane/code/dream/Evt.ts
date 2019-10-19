class Evt{
    public static listeners=[];
    public type:string;
    public target:Box;
    public method:string;
    public args;
    public static init(){
        TouchEvt.init();
    }
}