class Roll extends Box{
	public relative=true;
	public scrollMax=0;

	private _scroll=0;
	private pressScroll=0;
	private dragPaths:any[];
	private dragSpeed=0;

	public container:Box;
	private scroller:Box;

	constructor(){
        super();
		this.setSize("f","f");
		this.cropped=true;
		this.addUI([
			{e:Box,dim:"container",size:"f"},
			{e:Box,dim:"scroller",pos:[0,0,4,10],bgColor:"#000000",alpha:0,visible:false}
		])
	}
	public render(){
		if(this.renderLocked) return;
		if(!this.container) return;
		while(this.children.length>2){
			this.container.addChild(this.children[2]);
		}
		if(this.relative){
			var y=!this.margins?0:this.margins[1];
			for(var i=0;i<this.container.children.length;i++){
				var child=this.container.children[i];
				if(!child.visible) continue;
				if(child.margins){
					y+=int(child.margins[1]);
				}
				child.y=y;
				y+=child.height;
				if(child.margins){
					y+=int(child.margins[3]);
				}
			}
		}
		var cell=this.container.children[this.container.children.length-1];
		var height=!cell?0:cell.y+cell.height;
		if(this.margins) height+=this.margins[3];
		this.container.setSize(this.width,height);

		this.scrollMax=Math.max(height-this.height,0);
		this.scroller.x=this.width-6;
		this.scroller.visible=this.scrollMax>0;
		var clientH=this.height+this.scrollMax;
		this.scroller.height=(this.height-20)*this.height/clientH;
	}
	/**滚动步骤 1-拖动中 2-回弹中 3-滑行中*/
	private runDrag(step=0){
		if(step==0){
			this.dragPaths=[];
			Tween.clear(this.scroller);
			Timer.clear(this,this.runDrag);
			Timer.addLoop([this,this.runDrag,1]);
		}
		else if(step==1){
			//拖动中
			var evt=TouchEvt.self;
			if(!evt.target){
				Timer.clear(this,this.runDrag);
				this.runDrag(this.scroll<0||this.scroll>this.scrollMax?2:3);
				return;
			}
			if(evt.x!=evt.pressX||evt.y!=evt.pressY){
				this.scroller.alpha=0.5;
			}
			var y=this.pressScroll-(evt.y-evt.pressY);
			if(y<0) y/=5;
			if(y>this.scrollMax){
				y=this.scrollMax+(y-this.scrollMax)/5;
			}
			this.scroll=y;
			this.dragPaths.push(y);
			if(this.dragPaths.length>5) this.dragPaths.shift();
		}
		else if(step==2){
			//回弹中
			var scroll=this.scroll<0?0:this.scrollMax;
			Tween.to(this,{scroll:scroll},300,Ease.strongOut);
			Timer.addLate([this,this.runDrag,5],300)
		}
		else if(step==3){
			//滑行中
			var a=this.dragPaths;
			this.dragSpeed=a.length<=1?0:0.04*(a[a.length-1]-a[0])/a.length;
			if(this.dragSpeed!=0){
				Timer.addLoop([this,this.runDrag,4]);
			}
			else{
				this.runDrag(5);
			}
		}
		else if(step==4){
			var dir=this.dragSpeed>0?-1:1;
			var diff=Math.abs(this.dragSpeed)>1.5?0.01:0.03;
			this.dragSpeed+=diff*dir;
			var y=this.scroll+2*this.dragSpeed*16;
			this.scroll=y;
			var isEnd=Math.abs(this.dragSpeed)<diff;
			if(this.scroll<=0){
				isEnd=true;
				this.scroll=0;
			}
			if(this.scroll>=this.scrollMax){
				isEnd=true;
				this.scroll=this.scrollMax;
			}
			if(isEnd){
				Timer.clear(this,this.runDrag);
				this.runDrag(5);
			}
		}
		else if(step==5){
			Tween.to(this.scroller,{alpha:0},1000);
		}
	}
	public clear(){
		this.container.removeChildren();
		this.render();
		this.scroll=0;
	}
	public scrollTo(v:number){
		this.scroll=Math.min(Math.max(v,0),this.scrollMax);
	}
	private get scroll(){
		return this._scroll;
	}
	private set scroll(v){
		this._scroll=v;
		this.container.y=-v;
		var per=v==0||this.scrollMax==0?0:v/this.scrollMax;
		this.scroller.y=(this.height-this.scroller.height-20)*Math.max(Math.min(per,1),0)+10;
	}
	private onTouchStart(evt){
		this.pressScroll=this.scroll;
		this.runDrag();
	}
}