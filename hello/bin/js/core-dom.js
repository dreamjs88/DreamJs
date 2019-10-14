(function(){
    window.Core=function(){};
    Core.textureHash={};
    Core.stageScale=1;
    Core.rootDiv;
    Core.rootX=0;
    Core.rootY=0;
    Core.start=function(){
        Core.initWeb();
        Core.initSprite();
    }
    Core.initWeb=function(){
        var style=document.createElement("style");
        var head=document.getElementsByTagName("head").item(0);
        head.appendChild(style);
        style.innerHTML="*::-webkit-scrollbar{width:10px;height:10px;background:transparent}\n"
            +"*::-webkit-scrollbar-thumb{background:#535353}\n"
            +"*::-webkit-scrollbar-corner{background:transparent}"

        document.body.style.margin="0";
        document.body.style.overflow="hidden";

        Core.rootDiv=document.createElement("div");
        document.body.appendChild(Core.rootDiv);
        Core.rootDiv.style.cssText="position:absolute;left:0;top:0;transform-origin:0 0";
    }
    Core.getTouchTarget=function(target,x,y){
        return target.box;
    }
    Core.showStat=function(){
        
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
    Core.loadTexture=function(url,caller,func){
        var image=new Image();
        image.src=url;
        image.reload=function(){
            image.src=url;
        }
        image.onload=function(){
            Core.textureHash[url]=image;
            func.call(caller,url);
        }
        image.onerror=function(){
            setTimeout(image.reload,1000);
        }
    }
    Core.initSprite=function(){
        window.Sprite=function(){
            this.ctor();
        }
        var proto=Sprite.prototype;

        proto.children;

        proto.ctor=function(){
            this.children=[];
            this.node=document.createElement("div");
            this.node.box=this;
            this.style=this.node.style;
            this.node.style.cssText="position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;"
                +"box-sizing:border-box;-webkit-user-select:none;outline:none;cursor:default";
        }
        proto.initAsStage=function(aspect){
            var width=innerWidth;
            var height=innerHeight;
            var scale=1;
            if(aspect==1){
                width=640;
                if(innerWidth<innerHeight){
                    height=parseInt(640*innerHeight/innerWidth);
                    scale=innerWidth/640;
                }
                else{
                    height=1138;
                    scale=innerHeight/height;
                    Core.rootX=parseInt((innerWidth-width*scale)/2);
                    Core.rootDiv.style.left=Core.rootX+"px";
                }
            }
            else if(aspect==2){
                height=640;
                if(innerWidth>innerHeight){
                    width=parseInt(640*innerWidth/innerHeight);
                    scale=innerHeight/640;
                }
                else{
                    width=1138;
                    scale=innerWidth/width;
                    Core.rootY=parseInt((innerHeight-height*scale)/2);
                    Core.rootDiv.style.top=Core.rootY+"px";
                }
            }
            
            Core.rootDiv.style.transform="scale("+scale+","+scale+")";
            Core.rootDiv.style.overflow="hidden";
            Core.rootDiv.style.width=width+"px";
            Core.rootDiv.style.height=height+"px";
            Core.rootDiv.appendChild(this.node);
            
            this.set_width(width,true);
            this.set_height(height);
            Core.stageScale=scale;
        }
        proto.addChild=function(child){
            if(child.parent) child.removeSelf();
            this.children.push(child);
            child.parent=this;
            this.node.appendChild(child.node);
            return child;
        }
        proto.removeSelf=function(){
            if(!this.parent) return;
            var n=this.parent.children.indexOf(this);
            this.parent.children.splice(n,1);
            this.parent.node.removeChild(this.node);
            this.parent=null;
        }
        proto.removeChildren=function(){
            while(this.children.length>0){
                var child=this.children[0];
                child.removeSelf();
            }
        }
        proto.setBgColor=function(v){
            if(this._isImg) return;
            this.node.style.background=v;
        }
        proto.drawImage=function(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH){
            if(!url) width=height=0;
            this._width=width;
            this.node.style.width=width+"px";
            this._height=height;
            this.node.style.height=height+"px";
            if(texX==null) texX=0;
            if(texY==null) texY=0;
            if(!texW) texW=baseTexW;
            if(!texH) texH=baseTexH;
            if(this._cropped){
                texW=width;
                texH=height;
            }
            var scaleX=this._cropped?1:width/texW;
            var scaleY=this._cropped?1:height/texH;
            this.node.style.backgroundRepeat="no-repeat";
            this.node.style.backgroundImage=!url?"":"url("+url+")";
            this.node.style.backgroundPosition=(-scaleX*texX)+"px "+(-scaleY*texY)+"px";
            this.node.style.backgroundSize=(scaleX*baseTexW)+"px "+(scaleY*baseTexH)+"px";
        }
        proto.drawText=function(text,color,fontSize,width,align,spacing,leading){
            this.node.style.fontFamily="Arial";
            this.node.style.color=color||"#000000";
            this.node.style.fontSize=fontSize||24;

            this.node.style.width=!width?"":width+"px";
            this.node.style.height="";
            this.node.style.textAlign=align||"left";
            this.node.style.letterSpacing=(spacing||0)+"px";
            this.node.style.lineHeight=parseInt(fontSize*1.3+leading)+"px"
            this.node.style.whiteSpace=width==0?"nowrap":"normal";
            this.node.innerText=text;
            var width=this.node.clientWidth;
            var height=this.node.clientHeight;
            if(width==0){
                var div=Core.measureDiv;
                if(!div){
                    div=Core.measureDiv=document.createElement("div");
                    document.body.appendChild(div);
                }
                div.style.cssText=this.node.style.cssText;
                div.style.left="0px";
                div.style.top="9000px";
                div.innerText=this.node.innerText;
                width=div.clientWidth+3;
                height=div.clientHeight;
            }
            else{
                width+=3;
            }
            this.set_width(width,true);
            this.set_height(height,true);
        }

        proto._x=0;
        proto.get_x=function(){
            return this._x;
        }
        proto.set_x=function(v){
            this._x=v;
            this.node.style.left=(this._x-this._pivotX-this._pivotX2)+"px";
        }

        proto._y=0;
        proto.get_y=function(){
            return this._y;
        }
        proto.set_y=function(v){
            this._y=v;
            this.node.style.top=(this._y-this._pivotY-this._pivotY2)+"px";
        }

        proto._width=0;
        proto._autoWidth=true;
        proto.get_width=function(){
            return this._width;
        }
        proto.set_width=function(v,isCore){
            this._width=v;
            this.node.style.width=v+"px";
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
            this.node.style.height=v+"px";
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
            this.node.style.opacity=v;
        }

        proto._visible=true;
        proto.get_visible=function(){
            return this._visible;
        }
        proto.set_visible=function(v){
            this._visible=v;
            this.node.style.visibility=v?"inherit":"hidden";
        }

        proto._enabled=true;
        proto.get_enabled=function(){
            return this._enabled;
        }
        proto.set_enabled=function(v){
            this._enabled=v;
            this.node.style.pointerEvents=v?"auto":"none";
        }

        proto._cropped=false;
        proto.get_cropped=function(){
            return this._cropped;
        }
        proto.set_cropped=function(v){
            this._cropped=v;
            this.node.style.overflow=v?"hidden":"visible";
        }

        proto._gray=false;
        proto.get_gray=function(){
            return this._gray;
        }
        proto.set_gray=function(v){
            this._gray=v;
            this.node.style.filter=!v?"":"grayscale(100%)";
        }

        proto._scaleX=1;
        proto.get_scaleX=function(){
            return this._scaleX;
        }
        proto.set_scaleX=function(v){
            this._scaleX=v;
            this.node.style.transform="rotate("+this._rotation+"deg)"
            +" scale("+this._scaleX+","+this._scaleY+")";
        }

        proto._scaleY=1;
        proto.get_scaleY=function(){
            return this._scaleY;
        }
        proto.set_scaleY=function(v){
            this._scaleY=v;
            this.node.style.transform="rotate("+this._rotation+"deg)"
            +" scale("+this._scaleX+","+this._scaleY+")";
        }

        proto._rotation=0;
        proto.get_rotation=function(){
            return this._rotation;
        }
        proto.set_rotation=function(v){
            this._rotation=v;
            this.node.style.transform="rotate("+this._rotation+"deg)"
            +" scale("+this._scaleX+","+this._scaleY+")";
        }

        proto._pivotX=0;
        proto._pivotX2=0;
        proto.get_pivotX=function(){
            return this._pivotX;
        }
        proto.set_pivotX=function(v){
            this._pivotX=v;
            this.resetPivot();
        }

        proto._pivotY=0;
        proto._pivotY2=0;
        proto.get_pivotY=function(){
            return this._pivotY;
        }
        proto.set_pivotY=function(v){
            this._pivotY=v;
            this.resetPivot();
        }

        proto.resetPivot=function(){
            var pivotX=this._pivotX+this._pivotX2;
            var pivotY=this._pivotY+this._pivotY2;
            this.node.style.transformOrigin=pivotX+"px "+pivotY+"px";
            this.node.style.left=(this._x-pivotX)+"px";
            this.node.style.top=(this._y-pivotY)+"px";
        }

        Core.bindGetterSetter(proto);
    }
})();
Core.start();