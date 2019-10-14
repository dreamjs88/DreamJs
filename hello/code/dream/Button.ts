class Button extends Box{
    public delay=false;
    public zoom=false;
    public img:Img;
    private baseContainer:Box;
    public container:Box;
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
    public set src(v){
        this._src=v;
        var resArr=Img.resHash[v];
        if(!resArr) return;
        var src2=v.replace(/\./,"@.");
        this.src2=Img.resHash[src2]?src2:v;

        var w=resArr[2];
        var h=resArr[3];
        this.setSize(w,h);
        this.baseContainer.setPos(w/2,h/2);
        this.img.src=this._src;
        this.img.setPos(-w/2,-h/2);
        this.container.setPos(-w/2,-h/2);
        this.container.setSize(w,h);
    }
    public render(){
        if(this.renderLocked) return;
        while(this.children.length>1){
            var child=this.children[1];
            this.container.addChild(child);
        }
    }
    private onTouchStart(){
        Timer.clear(this,this.onTouchEnd2);
        if(this.src!=this.src2) this.img.src=this.src2;
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
        if(this.zoom){
            this.baseContainer.scale=1;
        }
        else{
            this.container.setPos(-this.width/2,-this.height/2);
        }
        var evt={target:this,method:"onButtonClick"};
        this.dispatch(evt);
    }
}