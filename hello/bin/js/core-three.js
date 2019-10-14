(function(){
    window.Core=function(){};
    Core.isWeb=true;
    Core.textureHash={};
    Core.stageScale=1;
    Core.rootDiv;
    Core.root;
    Core.camera;
    Core.scene;
    Core.renderer;
    Core.stage;
    Core.stat;
    Core.rootX=0;
    Core.rootY=0;
    Core.start=function(){
        window.trace=Core.trace;
        window.miniCanvas=window.canvas;
        Core.isWeb=document.forms!=null;

        Core.initWeb();
        Core.initSprite();
    }
    Core.initWeb=function(){
        if(!Core.isWeb) return;
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
    Core.showStat=function(){
        if(!Core.isWeb) return;
        Core.stat=new Stats();
        Core.rootDiv.appendChild(Core.stat.dom);
        Core.stat.dom.style.left=(Core.rootX+Core.rootDiv.clientWidth-Core.stat.dom.clientWidth)+"px";
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
	Core.toColor=function(v){
        if(!v||v.indexOf("#")!=0) return "#000000";
        return new THREE.Color(!v?0:parseInt("0x"+v.slice(1)));
    }
    Core.loadTexture=function(url,caller,func){
        var tex=new THREE.TextureLoader().load(url,function(tex){
            Core.textureHash[url]=tex;
            tex.width=tex.image.width;
            tex.height=tex.image.height;
            if(func) func.call(caller,url);
        });
        tex.minFilter=tex.magFilter=THREE.LinearFilter;
        return tex;
    }

    Core.hitRay=new THREE.Raycaster();
    Core.hitRayPos=new THREE.Vector2();
    Core.getTouchTarget=function(target,x,y){
        Core.hitRayPos.x=(x/Core.stage.width)*2-1;
        Core.hitRayPos.y=-(y/Core.stage.height)*2+1;
        Core.hitRay.setFromCamera(Core.hitRayPos,Core.camera);
        var items=[];
        Core.getTouchTarget2(items,Core.root);
        items.splice(0,1);
        items.reverse();
        var items2=Core.hitRay.intersectObjects(items);
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
        return target||Core.stage;
    }
    Core.getTouchTarget2=function(items,node){
        items.push(node);
        for(var i=0;i<node.children.length;i++){
            var child=node.children[i];
            Core.getTouchTarget2(items,child);
        }
    }
    Core.render=function(){
        if(Core.stat) Core.stat.begin();
        if(Core.renderer) Core.renderer.render(Core.scene,Core.camera);
        if(Core.stat) Core.stat.end();
    }
    Core.initSprite=function(){
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
        proto.initAsStage=function(aspect){
            Core.stage=this;
            var width=innerWidth;
            var height=innerHeight;
            var scale=1;
            if(aspect==1){
                width=640;
                if(innerWidth<innerHeight){
                    height=Math.ceil(640*innerHeight/innerWidth);
                    scale=innerWidth/640;
                }
                else{
                    height=1138;
                    scale=innerHeight/height;
                    Core.rootX=Math.ceil((innerWidth-width*scale)/2);
                }
            }
            else if(aspect==2){
                height=640;
                if(innerWidth>innerHeight){
                    width=Math.ceil(640*innerWidth/innerHeight);
                    scale=innerHeight/640;
                }
                else{
                    width=1138;
                    scale=innerWidth/width;
                    Core.rootY=Math.ceil((innerHeight-height*scale)/2);
                }
            }

            Core.stageScale=scale;
            var rootW=parseInt(width*scale);
            var rootH=parseInt(height*scale);

            if(Core.rootDiv){
                Core.rootDiv.style.left=Core.rootX+"px";
                Core.rootDiv.style.top=Core.rootY+"px";
                Core.rootDiv.style.width=rootW+"px";
                Core.rootDiv.style.height=rootH+"px";
            }
            
            Core.renderer=new THREE.WebGLRenderer({canvas:miniCanvas,precision:"highp"});
            if(Core.rootDiv) Core.rootDiv.appendChild(Core.renderer.domElement);

            Core.renderer.setPixelRatio(window.devicePixelRatio);
            Core.renderer.setSize(rootW,rootH);
            Core.renderer.sortObjects=false;

            Core.scene=new THREE.Scene();
            Core.scene.background=Core.toColor("#ffffff");
    
            Core.camera=new THREE.OrthographicCamera(0,rootW,0,-rootH);
            Core.camera.position.set(0,0,1);

            Core.root=new THREE.Mesh();
            Core.scene.add(Core.root);
            Core.root.scale.x=scale;
            Core.root.scale.y=scale;
            Core.root.add(this.node);

            this.set_width(width,true);
            this.set_height(height);
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
        proto._boxColor=null;
        proto._boxTexture=null;
        proto.renderBox=function(){
            if(this._width==0||this._height==0){
                this.node.geometry=Sprite.blankGeometry;
                return;
            }
            var geoKey=this._width+"-"+this._height+"-"+this._pivotX+"-"+this._pivotY;
            var geo=Sprite.geoHash[geoKey];
            if(!geo){
                geo=Sprite.geoHash[geoKey]=new THREE.PlaneGeometry(this._width,this._height);
                var mtx=new THREE.Matrix4();
                mtx.setPosition(new THREE.Vector3(this._width/2-this._pivotX-this._pivotX2,-this._height/2+this._pivotY+this._pivotY2));
                geo.applyMatrix(mtx);
            }
            this.node.geometry=geo;
            if(this._boxTexture){
                if(!this.node.material.map){
                    this.node.material=new THREE.MeshBasicMaterial({transparent:true});
                }
                this.node.material.map=this._boxTexture;
                if(this._boxColor) this.node.material.color=this._boxColor;
                if(this._opacity!=null) this.node.material.opacity=this._opacity;
            }
            else if(this._boxColor&&!this._isImg){
                this.node.material.color=this._boxColor;
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
        proto.setBgColor=function(v){
            if(this==Core.stage){
                Core.scene.background=Core.toColor(v);
                return;
            }
            this._boxColor=!v?null:Core.toColor(v);
            this.renderBox();
        }
        proto.drawImage=function(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH){
            if(!url){
                this._boxTexture=null;
                this._width=this._height=0;
                this.renderBox();
                return;
            }
            this._width=width;
            this._height=height;
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
            var baseTex=Core.textureHash[url];
            var key=url+"-"+texW+"-"+texH+"-"+texX+"-"+texY;
            var tex=Core.textureHash[key];
            if(!baseTex){
                tex=Core.loadTexture(url);
                tex.repeat.set(texW/(baseTexW),texH/(baseTexH));
                tex.offset.set(texX/(baseTexW),1-(texH+texY)/(baseTexH));
            }
            else if(!tex){
                tex=Core.textureHash[key]=new THREE.Texture();
                for(var k in baseTex){
                    if(k=="uuid") continue;
                    tex[k]=baseTex[k];
                }
                tex.repeat=new THREE.Vector2();
                tex.offset=new THREE.Vector2();
                tex.repeat.set(texW/(baseTexW),texH/(baseTexH));
                tex.offset.set(texX/(baseTexW),1-(texH+texY)/(baseTexH));
            }
            this._boxTexture=tex;
            this.renderBox();
        }

        Sprite.textCanvas=document.createElement("canvas");
        proto.drawText=function(text,color,fontSize,width,align,spacing,leading){
            if(!text){
                this._boxTexture=null;
                this._width=width;
                this.renderBox();
                return;
            }
            if(!align) align="left";
            if(!spacing) spacing=0;
            if(!leading) leading=0;
            var lineH=parseInt(fontSize*1.3)+leading;
            var ctx=Sprite.textCanvas.getContext("2d");
            ctx.font=fontSize+"px Arial";
            var items=[];
            var x=0;
            var y=0;
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
            Sprite.textCanvas.width=width;
            Sprite.textCanvas.height=height;
            ctx.font=fontSize+"px Arial";
            ctx.fillStyle=color;
            for(var i=0;i<items.length;i++){
                var a=items[i];
                ctx.fillText(a[0],a[1],a[2]+fontSize);
            }
            var url=Sprite.textCanvas.toDataURL("image/png");
            this.drawImage(url,width,height);
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
            if(!this.renderLocked) this.renderBox();
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
            if(!this.renderLocked) this.renderBox();
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
            e.renderBox();
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
            e.renderBox();
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
            this.renderBox();
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
            this.renderBox();
        }

        proto._pivotY=0;
        proto._pivotY2=0;
        proto.get_pivotY=function(){
            return this._pivotY;
        }
        proto.set_pivotY=function(v){
            this._pivotY=v;
            this.renderBox();
        }

        Core.bindGetterSetter(proto);
    }
})();
Core.start();