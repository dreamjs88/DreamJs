class Main extends Box{
    public static aspect=1;
    constructor(){
        super();
        var label=this.addChild(new Label()) as Label;
        label.setPos(100,100);
        label.fontSize=50;
        label.color="#00c000";
        label.text="Hello,world";
    }
}