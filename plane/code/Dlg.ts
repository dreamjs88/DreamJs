class Dlg extends Box{
    public static self:Dlg;
    public static start(title:string,doBack){
        if(!Dlg.self) new Dlg();
        Dlg.self.start(title,doBack);
    }
    private doBack;

    private cover:Box;
    private titleLabel:Label;
    private continueButton:Button;
    constructor(){
        super();
        Dlg.self=this;
        this.setSize("f","f");
        this.addUI([
            {e:Box,dim:"cover",size:"f",bgColor:"#000000",alpha:0.8},
            {e:Label,dim:"titleLabel",fontSize:60,color:"#ffffff",pos:["c",310]},
            {e:Button,dim:"continueButton",src:"Button-continue.png",pos:[170,610,300,70]},
        ]);
    }
    private start(title:string,doBack){
        this.doBack=doBack;
        Dream.stage.addChild(this);
        this.titleLabel.text=title;
        Tween.to(this.cover,{alpha:[0,0.8]});
    }
    private onButtonClick(evt){
        if(evt.target==this.continueButton){
            this.removeSelf();
            call(this.doBack);
        }
    }
}