(function(){
    window.Bridge=function(){};
    Bridge.type="three";
    Bridge.isWeb=true;
    Bridge.textureHash={};
    Bridge.rootDiv;
    Bridge.root;
    Bridge.camera;
    Bridge.scene;
    Bridge.renderer;
    Bridge.stage;
    Bridge.stat;
    Bridge.start=function(){
        window.miniCanvas=window.canvas;
        Bridge.isWeb=document.forms!=null;

        Bridge.initSprite();
        Bridge.initRoot();
    }
    Bridge.initRoot=function(){
        if(Bridge.isWeb){
            var style=document.createElement("style");
            var head=document.getElementsByTagName("head").item(0);
            head.appendChild(style);
            style.innerHTML="*::-webkit-scrollbar{width:10px;height:10px;background:transparent}\n"
                +"*::-webkit-scrollbar-thumb{background:#535353}\n"
                +"*::-webkit-scrollbar-corner{background:transparent}"

            document.body.style.margin="0";
            document.body.style.overflow="hidden";

            Bridge.rootDiv=document.createElement("div");
            document.body.appendChild(Bridge.rootDiv);
            Bridge.rootDiv.style.cssText="position:absolute;left:0;top:0;transform-origin:0 0";
        }
        Bridge.renderer=new THREE.WebGLRenderer({canvas:miniCanvas,precision:"highp"});
        if(Bridge.rootDiv) Bridge.rootDiv.appendChild(Bridge.renderer.domElement);

        Bridge.renderer.setPixelRatio(window.devicePixelRatio);
        Bridge.renderer.setSize(innerWidth,innerHeight);
        Bridge.renderer.sortObjects=false;

        Bridge.scene=new THREE.Scene();
        Bridge.scene.background=Bridge.toColor("#ffffff");

        Bridge.camera=new THREE.OrthographicCamera(0,innerWidth,0,-innerHeight);
        Bridge.camera.position.set(0,0,1);

        Bridge.root=new Sprite();
        Bridge.scene.add(Bridge.root.node);
        Bridge.root.width=innerWidth;
        Bridge.root.height=innerHeight;

        Bridge.render();
    }
    Bridge.render=function(){
        if(Bridge.stat) Bridge.stat.begin();
        if(Bridge.renderer) Bridge.renderer.render(Bridge.scene,Bridge.camera);
        if(Bridge.stat) Bridge.stat.end();
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
        Bridge.scene.background=Bridge.toColor(color);
    }
	Bridge.toColor=function(color){
        if(!color) return new THREE.Color("#000000");
        if(color.length==4) color=color.replace(/(\w)/g,"$1$1");
        return new THREE.Color(!color?0:parseInt("0x"+color.slice(1)));
    }
    Bridge.showStat=function(){
        if(!Bridge.isWeb) return;
        Bridge.stat=new Stats();
        Bridge.rootDiv.appendChild(Bridge.stat.dom);
        Bridge.stat.dom.style.left=(Bridge.root.x+Bridge.root.width*Bridge.root.scaleX-80)+"px";
    }
    Bridge.loadTexture=function(url,funcBack){
        var tex=Bridge.textureHash[url];
        if(tex){
            if(funcBack) funcBack.call(null,url);
            return tex;
        }
        tex=new THREE.TextureLoader().load(url,function(tex){
            Bridge.textureHash[url]=tex;
            tex.width=tex.image.width;
            tex.height=tex.image.height;
            if(funcBack) funcBack.call(null,url);
        });
        tex.minFilter=tex.magFilter=THREE.LinearFilter;
        return tex;
    }

    Bridge.hitRay=new THREE.Raycaster();
    Bridge.hitRayPos=new THREE.Vector2();
    Bridge.getTouchTarget=function(target,x,y){
        var stage=Bridge.root.children[0];
        Bridge.hitRayPos.x=(x/innerWidth)*2-1;
        Bridge.hitRayPos.y=-(y/innerHeight)*2+1;
        Bridge.hitRay.setFromCamera(Bridge.hitRayPos,Bridge.camera);
        var items=[];
        Bridge.getTouchTarget2(items,Bridge.root.node);
        items.splice(0,1);
        items.reverse();
        var items2=Bridge.hitRay.intersectObjects(items);
        for(var i=0;i<items2.length;i++){
            items2[i]=items2[i].object;
        }
        for(var i=0;i<items.length;i++){
            var node=items[i];
            if(items2.indexOf(node)==-1){
                items.splice(i,1);
                i--;
            }
        }
        var target=null;
        for(var i=0;i<items.length;i++){
            var node=items[i];
            var box=node.box;
            if(!box||!box.enabled) continue;
            if(!box.node.material.visible) continue;
            target=box;
            break;
        }
        return target;
    }
    Bridge.getTouchTarget2=function(items,node){
        items.push(node);
        for(var i=0;i<node.children.length;i++){
            var child=node.children[i];
            Bridge.getTouchTarget2(items,child);
        }
    }
    Bridge.initSprite=function(){
        window.Sprite=function(){
            this.ctor();
        }
        var proto=Sprite.prototype;

        proto.children;

        proto.ctor=function(){
            this.children=[];
            this.node=new THREE.Mesh();
            this.node.box=this;
            this.node.material.transparent=true;
            this.style={};
        }
        proto.addChild=function(child){
            if(child.parent) child.removeSelf();
            this.children.push(child);
            child.parent=this;
            this.node.add(child.node);
            return child;
        }
        proto.removeSelf=function(){
            if(!this.parent) return;
            var n=this.parent.children.indexOf(this);
            this.parent.children.splice(n,1);
            this.parent.node.remove(this.node);
            this.parent=null;
        }
        proto.removeChildren=function(){
            while(this.children.length>0){
                var child=this.children[0];
                child.removeSelf();
            }
        }
        Sprite.blankGeometry=new THREE.BufferGeometry();
        Sprite.blankColor=new THREE.Color(16777215);
        Sprite.geoHash={};
        proto._coreTexture=null;
        proto.renderCore=function(){
            var w=this._width;
            var h=this._height;
            if(w==0||h==0){
                this.node.geometry=Sprite.blankGeometry;
                return;
            }
            var geoKey=w+"-"+h+"-"+this._pivotX+"-"+this._pivotY;
            var geo=Sprite.geoHash[geoKey];
            if(!geo){
                geo=Sprite.geoHash[geoKey]=new THREE.PlaneGeometry(w,h);
                var mtx=new THREE.Matrix4();
                mtx.setPosition(new THREE.Vector3(w/2-this._pivotX-this._pivotX2,-h/2+this._pivotY+this._pivotY2));
                geo.applyMatrix(mtx);
            }
            this.node.geometry=geo;
            if(this._coreTexture){
                if(!this.node.material.map){
                    this.node.material=new THREE.MeshBasicMaterial({transparent:true});
                }
                var isColor=this._coreTexture instanceof THREE.Color;
                this.node.material.map=isColor?null:this._coreTexture;
                this.node.material.color=isColor?this._coreTexture:Sprite.blankColor;
                this.node.material.opacity=this._opacity==null?1:this._opacity;
            }
            else{
                this.node.material.color=Sprite.blankColor;
                this.node.material.opacity=0;
            }
            this.node.material.depthTest=false

            var visible=true;
            var box=this;
            while(box){
                if(!box._visible){
                    visible=false;
                    break;
                }
                box=box.parent;
            }
            this.node.material.visible=visible;
        }
        proto.setBgColor=function(color){
            if(this.parent==Bridge.root){
                Bridge.scene.background=Bridge.toColor(color);
                document.body.bgColor=color;
                return;
            }
            this.renderCore();
        }
        proto.drawImage=function(url,baseTexW,baseTexH,texX,texY,texW,texH){
            var width=this._width;
            var height=this._height;
            if(!url){
                this._coreTexture=null;
                this.renderCore();
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
                    this._coreTexture=Bridge.toColor(color);
                    this.renderCore();
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
            var baseTex=Bridge.textureHash[url];
            var key=url+"-"+texW+"-"+texH+"-"+texX+"-"+texY;
            var tex=Bridge.textureHash[key];
            if(!baseTex){
                tex=Bridge.loadTexture(url);
                tex.repeat.set(texW/(baseTexW),texH/(baseTexH));
                tex.offset.set(texX/(baseTexW),1-(texH+texY)/(baseTexH));
            }
            else if(!tex){
                tex=Bridge.textureHash[key]=new THREE.Texture();
                for(var k in baseTex){
                    if(k=="uuid") continue;
                    tex[k]=baseTex[k];
                }
                tex.repeat=new THREE.Vector2();
                tex.offset=new THREE.Vector2();
                tex.repeat.set(texW/(baseTexW),texH/(baseTexH));
                tex.offset.set(texX/(baseTexW),1-(texH+texY)/(baseTexH));
            }
            this._coreTexture=tex;
            this.renderCore();
        }

        Sprite.tempCanvas=document.createElement("canvas");
        proto.drawText=function(text,color,fontSize,width,align,spacing,leading){
            if(!text){
                this._coreTexture=null;
                this._width=width;
                this.renderCore();
                return;
            }
            if(!align) align="left";
            if(!spacing) spacing=0;
            if(!leading) leading=0;
            var lineH=parseInt(fontSize*1.3)+leading;
            var ctx=Sprite.tempCanvas.getContext("2d");
            ctx.font=fontSize+"px Arial";
            var items=[];
            var x=0;
            var y=-Math.ceil(fontSize*0.15);
            var maxW=0;
            for(var i=0;i<=text.length;i++){
                var s=text.charAt(i);
                var w=ctx.measureText(s).width;
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
            var height=y;
            Sprite.tempCanvas.width=width;
            Sprite.tempCanvas.height=height;
            ctx.font=fontSize+"px Arial";
            ctx.fillStyle=color;
            for(var i=0;i<items.length;i++){
                var a=items[i];
                ctx.fillText(a[0],a[1],a[2]+fontSize);
            }
            var url=Sprite.tempCanvas.toDataURL("image/png");
            this.set_width(width,true);
            this.set_height(height,true);
            this.drawImage(url);
        }

        proto._x=0;
        proto.get_x=function(){
            return this._x;
        }
        proto.set_x=function(v){
            this._x=v;
            this.node.position.x=v;
        }

        proto._y=0;
        proto.get_y=function(){
            return this._y;
        }
        proto.set_y=function(v){
            this._y=v;
            this.node.position.y=-v;
        }

        proto._width=0;
        proto._autoWidth=true;
        proto.get_width=function(){
            return this._width;
        }
        proto.set_width=function(v,isCore){
            this._width=v;
            if(!this.renderLocked) this.renderCore();
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
            if(!this.renderLocked) this.renderCore();
            if(!isCore){
                if(this.render) this.render();
            }
        }

        proto._alpha=1;
        proto._opacity=null;
        proto.get_alpha=function(){
            return this._alpha;
        }
        proto.set_alpha=function(v){
            this._alpha=v;
            this._opacity=1;
            var e=this;
            while(e){
                this._opacity*=e._alpha;
                e=e.parent;
            }
            this.setAlphaSub(this);
        }
        proto.setAlphaSub=function(e){
            e.renderCore();
            for(var i=0;i<e.children.length;i++){
                var c=e.children[i];
                c._opacity=c._alpha*e._opacity;
                this.setAlphaSub(c);
            }
        }

        proto._visible=true;
        proto.get_visible=function(){
            return this._visible;
        }
        proto.set_visible=function(v){
            this._visible=v;
            this.setVisibleSub(this)
        }
        proto.setVisibleSub=function(e){
            e.renderCore();
            for(var i=0;i<e.children.length;i++){
                var c=e.children[i];
                this.setVisibleSub(c);
            }
        }

        proto._enabled=true;
        proto.get_enabled=function(){
            return this._enabled;
        }
        proto.set_enabled=function(v){
            this._enabled=v;
        }

        proto._cropped=false;
        proto.get_cropped=function(){
            return this._cropped;
        }
        proto.set_cropped=function(v){
            this._cropped=v;
            this.renderCore();
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
            this.node.scale.x=v;
        }

        proto._scaleY=1;
        proto.get_scaleY=function(){
            return this._scaleY;
        }
        proto.set_scaleY=function(v){
            this._scaleY=v;
            this.node.scale.y=v;
        }

        proto._rotation=0;
        proto.get_rotation=function(){
            return this._rotation;
        }
        proto.set_rotation=function(v){
            this._rotation=v;
            this.node.rotation.z=-v*Math.PI/180;
        }

        proto._pivotX=0;
        proto._pivotX2=0;
        proto.get_pivotX=function(){
            return this._pivotX;
        }
        proto.set_pivotX=function(v){
            this._pivotX=v;
            this.renderCore();
        }

        proto._pivotY=0;
        proto._pivotY2=0;
        proto.get_pivotY=function(){
            return this._pivotY;
        }
        proto.set_pivotY=function(v){
            this._pivotY=v;
            this.renderCore();
        }

        Bridge.bindGetterSetter(proto);
    }
})();
Bridge.start();