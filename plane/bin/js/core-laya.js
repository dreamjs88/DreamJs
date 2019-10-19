(function(){
    window.Core=function(){};
    Core.type="laya";
    Core.textureHash={};
    Core.root;
    Core.start=function(){
        Core.initSprite();
        Core.initRoot();
    }
    Core.initRoot=function(){
        Laya.init(innerWidth,innerHeight,Laya.WebGL);

        Laya.stage.scaleMode="fixedwidth";
        Laya.stage.bgColor="#ffffff";
        Laya.stage.screenAdaptationEnabled=false;

        Core.root=new Sprite();
        Laya.stage.addChild(Core.root.node);
        Core.root.width=innerWidth;
        Core.root.height=innerHeight;
    }
    Core.getTouchTarget=function(target,x,y){
        return target.box;
    }
    Core.showStat=function(){
        Laya.Stat.show((Core.root.width-250)*Core.root.scaleX,0);        
    }
    Core.render=function(){
        
    }
    Core.createClass=function(className,baseClass){
        if(className=="Box") baseClass=Sprite;
        var classObj=window[className]=function(){
            if(this instanceof Box) Sprite.prototype.ctor.call(this);
            if(classObj.prototype.ctor&&this.className!="Main"){
                classObj.prototype.ctor.apply(this,arguments);
            }
        }
        if(baseClass) classObj.prototype=Object.create(baseClass.prototype);
        classObj.prototype.className=className;
        return classObj.prototype;
    }
    Core.bindGetterSetter=function(proto){
        for(var k in proto){
            if(k.indexOf("get_")!=0) continue;
            var name=k.slice(4);
            Object.defineProperty(proto,name,{get:proto["get_"+name],set:proto["set_"+name]});
        }
    }
    Core.loadTexture=function(url,funcBack){
        Laya.loader.load(url,Laya.Handler.create(null,function(tex){
            if(!tex){
                setTimeout(Core.loadTexture,1000,url,funcBack);
                return;
            }
            Core.textureHash[url]=tex;
            if(funcBack) funcBack.call(null,url);
        }),null,"image");
    }
    Core.initSprite=function(){
        window.Sprite=function(){
            this.ctor();
        }
        var proto=Sprite.prototype;

        proto.children;
        proto._boxColor;

        proto.ctor=function(){
            this.children=[];
            this.node=new Laya.Sprite();
            this.node.box=this;
            this.node.mouseEnabled=true;
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
        proto.renderBox=function(){
            if(this._boxColor&&this._width>0&&this._height>0){
                this.node.graphics.clear();
                this.node.graphics.drawRect(0,0,this._width,this._height,this._boxColor);
            }
        }
        proto.setBgColor=function(v){
            if(this.parent==Core.root){
                Laya.stage.bgColor=v;
                return;
            }
            this._boxColor=v;
            this.renderBox();
        }
        proto.drawImage=function(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH){
            this.node.graphics.clear();
            if(!url){
                this.width=this.height=0;
                return;
            }
            var self=this;
            var baseTex=Core.textureHash[url];
            if(!baseTex){
                Core.loadTexture(url,function(){
                    self.drawImage(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH);
                });
                return;
            }
            this.set_width(width,true);
            this.set_height(height,true);
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
                this.node.graphics.drawTexture(baseTex);
                return;
            }
            var key=url+"-"+texX+"-"+texY+"-"+texW+"-"+texH;
            var tex=Core.textureHash[key];
            if(!tex){
                tex=Core.textureHash[key]=Laya.Texture.createFromTexture(baseTex,texX,texY,texW,texH);
            }
            this.node.graphics.drawTexture(tex);
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
        Core.bindGetterSetter(proto);
    }
})();
Core.start();