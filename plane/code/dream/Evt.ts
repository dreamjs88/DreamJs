class Evt{
    public static listeners=[];
    public type:string;
    public target:Box;
    public method:string;
    public args:any[];
    public static init(){
        TouchEvt.init();
    }
}