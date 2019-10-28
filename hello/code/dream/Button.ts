class Button extends Box{
    public delay=false;
    public zoom=false;
    public img:Img;
    private baseContainer:Box;
    public container:Box;
    private cover:Img;
    private _src:string;
    private src2:string;
    constructor(){
        super();
        this.delay=Dream.isMobile;
        this.addUI([
            [{e:Box,dim:"baseContainer"},
                {e:Img,dim:"img"},
                {e:Box,dim:"container"}
            ]
        ])
    }
    public get src(){
        return this._src;
    }
    public set src(src){
        this._src=src;
        var resArr=Img.resHash[src];
        if(src.match(/^\d*#/)){
            this.setSize(180,60,true);
        }
        else if(resArr){
            this.setSize(resArr[2],resArr[3]);
        }
        this.render();
    }
    public render(){
        if(this.renderLocked) return;
        var src=this._src;
        if(!src) return;
        while(this.children.length>1){
            var child=this.children[1];
            this.container.addChild(child);
        }
        var w=this.width;
        var h=this.height;
        if(src.match(/^\d*#/)){
            this.img.setSize(w,h,true);
            this.img.src=src;
            this.src2=src;
            if(!this.cover) this.cover=this.baseContainer.addChild(new Img()) as Img;
            this.cover.setPos(-w/2,-h/2);
            this.cover.setSize(w,h);
            this.cover.src=src.replace(/#.+/,"#000");
            this.cover.alpha=0.3;
            this.cover.visible=false;
        }
        else{
            var resArr=Img.resHash[src];
            if(!resArr) return;
            var src2=src.replace(/\./,"@.");
            this.src2=Img.resHash[src2]?src2:src;
        }
        this.baseContainer.setPos(w/2,h/2);
        this.img.src=this._src;
        this.img.setPos(-w/2,-h/2);
        this.container.setPos(-w/2,-h/2);
        this.container.setSize(w,h);
    }
    private onTouchStart(){
        Timer.clear(this,this.onTouchEnd2);
        if(this.src!=this.src2) this.img.src=this.src2;
        if(this.cover) this.cover.visible=true;
        if(this.zoom){
            this.baseContainer.scale=(this.width+10)/this.width;
        }
        else{
            this.container.setPos(-this.width/2,-this.height/2+2);
        }
    }
    private onTouchEnd(evt){
        var isClick=Math.abs(evt.x-evt.pressX)+Math.abs(evt.y-evt.pressY);
        Timer.addLate([this,this.onTouchEnd2,isClick],this.delay?200:1,false);
    }
    private onTouchEnd2(isClick:boolean){
        if(this.src!=this.src2) this.img.src=this.src;
        if(this.cover) this.cover.visible=false;
        if(this.zoom){
            this.baseContainer.scale=1;
        }
        else{
            this.container.setPos(-this.width/2,-this.height/2);
        }
        var evt=new Evt();
        evt.type="buttonclick";
        evt.method="onButtonClick";
        evt.target=this;
        this.dispatchEvent(evt);
    }
}