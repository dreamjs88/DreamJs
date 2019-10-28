(function(){
    window.Bridge=function(){};
    Bridge.type="laya";
    Bridge.textureHash={};
    Bridge.root;
    Bridge.start=function(){
        Bridge.initSprite();
        Bridge.initRoot();
    }
    Bridge.initRoot=function(){
        Laya.init(innerWidth,innerHeight,Laya.WebGL);

        Laya.stage.scaleMode="showall";
        Laya.stage.bgColor="#ffffff";
        Laya.stage.screenAdaptationEnabled=false;

        Bridge.root=new Sprite();
        Laya.stage.addChild(Bridge.root.node);
        Bridge.root.width=innerWidth;
        Bridge.root.height=innerHeight;
    }
    Bridge.render=function(){
        
    }
    Bridge.createClass=function(className,baseClass){
        if(className=="Box") baseClass=Sprite;
        var classObj=window[className]=function(){
            if(this instanceof Box){
                Sprite.prototype.ctor.call(this);
                Box.prototype.ctor.call(this);
            }
            if(this.className=="Main") return;
            if(classObj!=Box&&classObj.prototype.ctor){
                classObj.prototype.ctor.apply(this,arguments);
            }
        }
        if(baseClass) classObj.prototype=Object.create(baseClass.prototype);
        classObj.prototype.className=className;
        return classObj.prototype;
    }
    Bridge.bindGetterSetter=function(proto){
        for(var k in proto){
            if(k.indexOf("get_")!=0) continue;
            var name=k.slice(4);
            Object.defineProperty(proto,name,{get:proto["get_"+name],set:proto["set_"+name]});
        }
    }
    Bridge.setBgColor=function(color){
        Laya.stage.bgColor=color;
    }
    Bridge.getTouchTarget=function(target,x,y){
        return target.box;
    }
    Bridge.showStat=function(){
        Laya.Stat.show(Bridge.root.x+(Bridge.root.width-250)*Bridge.root.scaleX,0);        
    }
    Bridge.loadTexture=function(url,funcBack){
        Laya.loader.load(url,Laya.Handler.create(null,function(tex){
            if(!tex){
                setTimeout(Bridge.loadTexture,1000,url,funcBack);
                return;
            }
            Bridge.textureHash[url]=tex;
            if(funcBack) funcBack.call(null,url);
        }),null,"image");
    }
    Bridge.initSprite=function(){
        window.Sprite=function(){
            this.ctor();
        }
        var proto=Sprite.prototype;

        Sprite.tempCanvas=Laya.Browser.createElement("canvas");

        proto.children;

        proto.ctor=function(){
            this.children=[];
            this.node=new Laya.Sprite();
            this.node.box=this;
            this.node.mouseEnabled=true;
            this.style={};
        }
        proto.addChild=function(child){
            if(child.parent) child.removeSelf();
            this.children.push(child);
            child.parent=this;
            this.node.addChild(child.node);
            return child;
        }
        proto.removeSelf=function(){
            if(!this.parent) return;
            var n=this.parent.children.indexOf(this);
            this.parent.children.splice(n,1);
            this.node.removeSelf();
            this.parent=null;
        }
        proto.renderCore=function(){
        }
        proto.drawImage=function(url,baseTexW,baseTexH,texX,texY,texW,texH){
            var width=this._width;
            var height=this._height;
            if(!url){
                this.node.graphics.clear();
                return;
            }
            if(url.match(/^\d*#/)){
                var w=width;
                var h=height;
                var a=url.split("#");
                var r=Math.min(parseInt(a[0]||0),w/2,h/2);
                var color=!a[1]?null:"#"+a[1];
                var bdColor=!a[2]?null:"#"+a[2];
                var bdSize=!bdColor?0:parseInt(a[3]||2);
                if(r==0&&bdSize==0){
                    this.node.graphics.clear();
                    this.node.graphics.drawRect(0,0,width,height,color);
                    return;
                }
                Sprite.tempCanvas.width=w;
                Sprite.tempCanvas.height=h;
                var ctx=Sprite.tempCanvas.getContext("2d");
                ctx.fillStyle=color;
                ctx.strokeStyle=bdColor;
                ctx.lineWidth=bdSize;
                var x=bdSize/2;
                var y=bdSize/2;
                w-=bdSize+1;
                h-=bdSize+1;
                ctx.moveTo(x+r,y);
                ctx.lineTo(x+w-r,y);
                ctx.arcTo(x+w,y,x+w,y+r,r);
                ctx.lineTo(x+w,y+h-r);
                ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
                ctx.lineTo(x+r,y+h);
                ctx.arcTo(x,y+h,x,y+h-r,r);
                ctx.lineTo(x,y+r);
                ctx.arcTo(x,y,x+r,y,r);
                if(color) ctx.fill();
                if(bdColor) ctx.stroke();
                var url=Sprite.tempCanvas.toDataURL("image/png");
                return url;
            }
            var self=this;
            var baseTex=Bridge.textureHash[url];
            if(!baseTex){
                Bridge.loadTexture(url,function(){
                    self.drawImage(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH);
                });
                return;
            }
            this.node.graphics.clear();
            if(!baseTexW) baseTexW=width;
            if(!baseTexH) baseTexH=height;
            if(texX==null) texX=0;
            if(texY==null) texY=0;
            if(!texW) texW=baseTexW;
            if(!texH) texH=baseTexH;
            if(this._cropped){
                texW=width;
                texH=height;
            }
            if(texW==baseTexW&&texH==baseTexH){
                this.node.graphics.drawTexture(baseTex,0,0,width,height);
                return;
            }
            var key=url+"-"+texX+"-"+texY+"-"+texW+"-"+texH;
            var tex=Bridge.textureHash[key];
            if(!tex){
                tex=Bridge.textureHash[key]=Laya.Texture.createFromTexture(baseTex,texX,texY,texW,texH);
            }
            this.node.graphics.drawTexture(tex,0,0,width,height);
        }
        proto.drawText=function(text,color,fontSize,width,align,spacing,leading){
            this.node.graphics.clear();
            if(!text){
                this.set_width(width,true);
                return;
            }
            if(!align) align="left";
            if(!spacing) spacing=0;
            if(!leading) leading=0;
            var lineH=parseInt(fontSize*1.3)+leading;
            var font=fontSize+"px Arial";
            var items=[];
            var x=0;
            var y=0;
            var maxW=0;
            for(var i=0;i<=text.length;i++){
                var s=text.charAt(i);
                var w=Laya.Browser.measureText(s,font).width;
                if(s==""||s=="\n"||(width&&x+w>width)){
                    if(width&&align!="left"){
                        var shiftX=align=="center"?(width-x)/2:(width-x);
                        for(var j=items.length-1;j>=0;j--){
                            var a=items[j];
                            if(a[2]!=y) break;
                            a[1]+=shiftX;
                        }
                    }
                    x=0;
                    y+=lineH;
                    if(s==""||s=="\n") continue;
                }
                items.push([s,x,y]);
                maxW=Math.max(x+w,maxW);
                x+=w+spacing+1;
            }
            if(!width) width=maxW;
            var height=int(y-Math.ceil(fontSize*0.15));
            this.set_width(width,true);
            this.set_height(height,true);
            for(var i=0;i<items.length;i++){
                var a=items[i];
                this.node.graphics.fillText(a[0],a[1],a[2],fontSize+"px Arial",color);
            }
        }

        proto._x=0;
        proto.get_x=function(){
            return this._x;
        }
        proto.set_x=function(v){
            this._x=v;
            this.node.x=v;
        }

        proto._y=0;
        proto.get_y=function(){
            return this._y;
        }
        proto.set_y=function(v){
            this._y=v;
            this.node.y=v;
        }

        proto._width=0;
        proto._autoWidth=true;
        proto.get_width=function(){
            return this._width;
        }
        proto.set_width=function(v,isCore){
            this._width=v;
            this.node.width=v;
            if(!isCore){
                this._autoWidth=v==0;
                if(this.render) this.render();
            }
        }

        proto._height=0;
        proto.get_height=function(){
            return this._height;
        }
        proto.set_height=function(v,isCore){
            this._height=v;
            this.node.height=v;
            if(!isCore){
                if(this.render) this.render();
            }
        }

        proto._alpha=1;
        proto.get_alpha=function(){
            return this._alpha;
        }
        proto.set_alpha=function(v){
            this._alpha=v;
            this.node.alpha=v;
        }

        proto._visible=true;
        proto.get_visible=function(){
            return this._visible;
        }
        proto.set_visible=function(v){
            this._visible=v;
            this.node.visible=v;
        }

        proto._enabled=true;
        proto.get_enabled=function(){
            return this._enabled;
        }
        proto.set_enabled=function(v){
            this._enabled=v;
            this.node.mouseEnabled=v;
        }

        proto._cropped=false;
        proto.get_cropped=function(){
            return this._cropped;
        }
        proto.set_cropped=function(v){
            this._cropped=v;
            this.node.scrollRect=!v?null:new Laya.Rectangle(0,0,this.width,this.height);
        }

        proto._gray=false;
        proto.get_gray=function(){
            return this._gray;
        }
        proto.set_gray=function(v){
            this._gray=v;
            this.node.filters=!v?null:[new Laya.ColorFilter([
                0.3086,0.6094,0.0820,0,0,0.3086,0.6094,0.0820,0,0,0.3086,0.6094,0.0820,0,0,0,0,0,1,0
            ])];
        }

        proto._scaleX=1;
        proto.get_scaleX=function(){
            return this._scaleX;
        }
        proto.set_scaleX=function(v){
            this._scaleX=v;
            this.node.scaleX=v;
        }

        proto._scaleY=1;
        proto.get_scaleY=function(){
            return this._scaleY;
        }
        proto.set_scaleY=function(v){
            this._scaleY=v;
            this.node.scaleY=v;
        }

        proto._rotation=0;
        proto.get_rotation=function(){
            return this._rotation;
        }
        proto.set_rotation=function(v){
            this._rotation=v;
            this.node.rotation=v;
        }

        proto._pivotX=0;
        proto._pivotX2=0;
        proto.get_pivotX=function(){
            return this._pivotX;
        }
        proto.set_pivotX=function(v){
            this._pivotX=v;
            this.node.pivotX=v;
        }

        proto._pivotY=0;
        proto._pivotY2=0;
        proto.get_pivotY=function(){
            return this._pivotY;
        }
        proto.set_pivotY=function(v){
            this._pivotY=v;
            this.node.pivotY=v;
        }
        Bridge.bindGetterSetter(proto);
    }
})();
Bridge.start();