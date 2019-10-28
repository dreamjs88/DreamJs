class Box{
	private static poolHash={};
    private static listeners=[];

    public id=0;
    public name="";
    public className:string;
    public node;
    public children:Box[];
    public parent:Box;
    public style;
    public renderLocked=false;

    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public scaleX:number;
    public scaleY:number;
    public rotation:number;
    public gray:boolean;
    public alpha;
    public enabled:boolean;
    public cropped:boolean;
    public margins:number[];
    public pivotX:number;
    public pivotY:number;
    public visible:boolean;
    private relativePos:number[];

    constructor(){
        this.relativePos=[];
    }
    public render(){
        if(this.renderLocked) return;
        for(var i=0;i<this.children.length;i++){
            var child=this.children[i];
            child.resetRelavite();
        }
        this["renderCore"]();
    }
    public removeChildren(begin=0){
        while(this.children.length>begin){
            var child=this.children[begin];
            child.removeSelf();
        }
    }
    public drawText(text:string,color="#000000",fontSize=24,width=0,align="left",spacing=0,leading=0){
        Sprite.prototype.drawText.apply(this,arguments);
    }
    public drawImage(url:string,baseTexW?:number,baseTexH?:number,texX?:number,texY?:number,texW?:number,texH?:number):string{
        return Sprite.prototype.drawImage.apply(this,arguments);
    }
    public addUI(items:any[]):Box{
        this.addUIHandle(this,items);
        return this.children[this.children.length-1];
    }
    private addUIHandle(box:Box,items:any[]){
        var i0=box==this?0:1;
        for(var i=i0;i<items.length;i++){
            var item=items[i];
            var obj=item instanceof Array?item[0]:item;
            var child:Box=obj.pool?this.createPool(obj.e,obj.pool):new obj.e();
            box.addChild(child);
            child.renderLocked=true;

            for(var k in obj){
                if(k=="pos"||k=="size"||k=="pivot") continue;
                child[k]=obj[k];
            }
            if(obj.dim) this[obj.dim]=child;
            if(obj.pos&&!(obj.pos instanceof Array)) obj.pos=[obj.pos,obj.pos];
            if(obj.pos&&obj.pos.length>=3) child.setSize(obj.pos[2],obj.pos[3]);
            if(obj.size&&!(obj.size instanceof Array)) obj.size=[obj.size,obj.size];
            if(obj.size) child.setSize(obj.size[0],obj.size[1]);
            if(obj.pos) child.setPos(obj.pos[0],obj.pos[1]);
            if(obj.pivot){
                child.pivotX=obj.pivot[0];
                child.pivotY=obj.pivot[1];
            }

            if(item instanceof Array) this.addUIHandle(child,item);
            child.renderLocked=false;
            child.render();
        }
    }
    private createPool(classObj,key?:string){
		if(!key) key=classObj._name;
		var arr=Box.poolHash[key];
		if(!arr) arr=Box.poolHash[key]=[];
		var box;
		for(var i=0;i<arr.length;i++){
			var box2=arr[i];
			if(!box2.parent){
				box=box2;
				break;
			}
		}
		if(!box){
			box=new classObj();
            arr.push(box);
		}
		return box;
    }
    public setPos(x,y,isCore=false){
        var parentW=!this.parent?Dream.stage.width:this.parent.width;
        var parentH=!this.parent?Dream.stage.height:this.parent.height;
        var isRelativeX=typeof(x)=="string";
        var isRelativeY=typeof(y)=="string";
        if(!isCore){
            this.relativePos[0]=isRelativeX?x:null;
            this.relativePos[1]=isRelativeY?y:null;
        }
		if(isRelativeX){
            var t=x.slice(0,1);
            x=int(int(t)>0?x:x.slice(1));
            if(t=="c") x+=(parentW-this.width)/2;
            if(t=="r") x+=parentW-this.width;
		}
		if(isRelativeY){
            if(!isCore) this.relativePos[1]=y;
            var t=y.slice(0,1);
            y=int(int(t)>0?y:y.slice(1));
            if(t=="c") y+=(parentH-this.height)/2;
            if(t=="b") y+=parentH-this.height;
		}
        Sprite.prototype.set_x.call(this,x);
        Sprite.prototype.set_y.call(this,y);
    }
    public setSize(w,h,isCore=false){
        var parentW=!this.parent?Dream.stage.width:this.parent.width;
        var parentH=!this.parent?Dream.stage.height:this.parent.height;
        var isRelativeW=typeof(w)=="string";
        var isRelativeH=typeof(h)=="string";
        if(!isCore){
            this.relativePos[2]=isRelativeW?w:null;
            this.relativePos[3]=isRelativeH?h:null;
        }
		if(isRelativeW){
            var t=w.slice(0,1);
            w=int(int(t)>0?w:w.slice(1));
            if(t=="f") w+=parentW;
		}
		if(isRelativeH){
            var t=h.slice(0,1);
            h=int(int(t)>0?h:h.slice(1));
            if(t=="f") h+=parentH;
        }
        if(h!=null) Sprite.prototype.set_height.call(this,h,true);
        Sprite.prototype.set_width.call(this,w,isCore);
    }
    public resetRelavite(isCore=false){
        var p=this.relativePos;
        if(p[2]||p[3]) this.setSize(p[2]||this.width,p[3]||this.height,isCore);
        if(p[0]||p[1]) this.setPos(p[0]||this.x,p[1]||this.y,isCore);
    }
    public on(type:string,caller,func:Function,args?:any){
        Box.listeners.push([this,type,caller,func,args]);
    }
    public off(type:string,caller,func:Function){
        for(var i=0;i<Box.listeners.length;i++){
            var a:any[]=Box.listeners[i];
            if(a[0]==this&&a[1]==type&&a[2]==caller&&a[3]==func){
                Box.listeners.splice(i,1);
                i--;
            }
        }
    }
	public dispatchEvent(evt){
        var box=this as Box;
		while(box){
			if(box[evt.method]) box[evt.method](evt);
            for(var i=0;i<Box.listeners.length;i++){
                var a:any[]=Box.listeners[i];
                if(box==a[0]&&evt.type==a[1]){
                    var caller=a[2];
                    var func=a[3];
                    evt.args=a[4];
                    func.call(caller,evt);
                }
            }
			box=box.parent;
        }
	}
    public contains(child:Box){
		while(child){
			if(child==this) return true;
			child=child.parent;
		}
		return false;
	}
    public getChild(name:string):Box{
        for(var i=0;i<this.children.length;i++){
            var child=this.children[i];
            if(child.name==name) return child;
        }
        for(var i=0;i<this.children.length;i++){
            var child=this.children[i];
            var child2=this.getChild.call(child,name);
            if(child2) return child2;
        }
        return null;
    }
    public addChild(child:Box):Box{
        return Sprite.prototype.addChild.call(this,child);
    }
    public removeSelf(){
        Sprite.prototype.removeSelf.call(this);
    }
    public get scale():number{
        return this["_scaleX"];
    }
    public set scale(v){
        Sprite.prototype.set_scaleX.call(this,v);
        Sprite.prototype.set_scaleY.call(this,v);
    }
    public toString(){
        var name=this.name||this['dim']||"";
        return "["+this.className+(!name?"":" "+name)+"]";
    }
}