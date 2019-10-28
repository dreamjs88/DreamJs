class Main extends Box{
    public static aspect=1;
    public static bridge="laya";
    public static bridgeSite="web";
    constructor(){
        super();
        var label=this.addChild(new Label()) as Label;
        label.fontSize=60;
        label.text="Hello,DreamJs!";
        label.setPos("c",300);
    }
}