(function(){var proto=Bridge.createClass("Tool");
    Tool.upgradeProject=function(){
        if(!Shell.available) return;
        var items=[
            "home/",
            "throne/",
            "examples/sprite-test/",
            "examples/plane/",
            "examples/2048/",
            "examples/tetris/",
            "examples/link/",
        ]
        for(var i=0;i<items.length;i++){
            var toPath="../"+items[i];
            Shell.deleteFolder(toPath+"build");
            Shell.copyFolder("build",toPath+"build");
            
            Shell.copyFile("bin/js/run.js",toPath+"bin/js/run.js");

            Shell.deleteFolder(toPath+"code/dream");
            Shell.copyFolder("code/dream",toPath+"code/dream");
        }
        window.close();
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Tween");
	Tween.toPath=function(target,path,time,ease,wait){(time==null)?time=200:null;(wait==null)?wait=0:null;
		Tween.to(target,{path:path},time,ease,wait);
	}
	Tween.to=function(target,props,time,ease,wait){(time==null)?time=200:null;(wait==null)?wait=0:null;
		if(!ease) ease=Ease.linear;
		for(var i=0;i<Timer.items.length;i++){
			var foo=Timer.items[i][0];
			if(foo[0]==target&&foo[1]==Tween.toHandle){
				var param2=foo[2];
				param2.t=param2.time;
				call(foo);
				break;
			}
		}
		var param={target:target,props:props,time:time,ease:ease,wait:wait,t:0};
		for(var k in props){
			var v=props[k];
			if(k=='path') continue;
			if(v instanceof Array) target[k]=v[0];
		}
		var foo=[target,Tween.toHandle,param];
		Timer.addLoop(foo);
		call(foo);
	}
	Tween.toHandle=function(param){
		if(param.wait>0){
			param.wait-=Timer.interval;
			return;
		}
		var props=param.props;
		var target=param.target;
        if(param.t>param.time) param.t=param.time;
        for(var k in props){
			var a=props[k];
			if(!(a instanceof Array)){
				props[k]=a=[target[k],a];
			}
			var func=param.ease;
            if(k=='path'){
                var v=func(param.t,0,1,param.time);
                v=Math.min(Math.max(v,0),1);
                var n=int((a.length-1)*v);
				var a2=a[n];
				target.x=a2[0];
				target.y=a2[1];
                if(a2[2]!=null) target.rotation=a2[2];
                continue;
			}
			var v=func(param.t,a[0],a[1],param.time);
			target[k]=v;
		}
		if(param.t>=param.time){
			Timer.clear(target,Tween.toHandle);
		}
		param.t+=Timer.interval;
	}
	Tween.clear=function(target){
		for(var i=0;i<Timer.items.length;i++){
			var foo=Timer.items[i][0];
			if(foo[0]==target&&foo[1]==Tween.toHandle){
				Timer.items.splice(i,1);
				i--;
				continue;
			}
		}
	}
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Dream");

	Dream.aspect=1;

	Dream.bridge="dom";

	Dream.bridgeSite="web";

	Dream.root;
	Dream.stage;
	Dream.main;
	Dream.width=0;
	Dream.height=0;
	Dream.scale=1;
	Dream.bgColor;
	Dream.wx;
	Dream.userAgent;
	Dream.isWeb=false;
	Dream.isMobile=false;
    Dream.isIPhone=false;
	Dream.init=function(){
		window.int=Dream.int;
		window.call=Dream.call;

		Dream.aspect=Main["aspect"]||Dream.aspect;
		Dream.bridge=Main["bridge"]||Dream.bridge;
		Dream.bridgeSite=Main["bridgeSite"]||Dream.bridgeSite;

		Dream.root=Bridge.root;
		Dream.wx=window.wx;
		Dream.userAgent=window.navigator.userAgent;
		Dream.isWeb=document.forms!=null;
		Dream.isMobile=!!Dream.userAgent.match(/\bmobile\b/i);
        Dream.isIPhone=!!Dream.userAgent.match(/\b(iPhone|iPad)\b/i);

		Dream.initStage();
		IO.init();
		Shell.init();
		Timer.init();
		TouchEvt.init();
		Sound.init();
		Music.init();
		Img.init();

        Dream.main=new Main();
        Dream.stage.addChild(Dream.main);
		Dream.main.setSize(this.width,this.height);
		Dream.main["ctor"]();
		if(Dream.bgColor) Bridge.setBgColor(Dream.bgColor);
	}
	Dream.initStage=function(){
		var browserW=int(window.innerWidth);
		var browserH=int(window.innerHeight);
		Dream.width=browserW;
		Dream.height=browserH;
		if(Dream.aspect==1){
			Dream.width=640;
			if(browserW<browserH){
				Dream.height=int(640*browserH/browserW);
				Dream.scale=browserW/640;
			}
			else{
				Dream.height=1138;
				Dream.scale=browserH/Dream.height;
				Dream.root.x=int((browserW-Dream.width*Dream.scale)/2);
			}
		}
		else if(Dream.aspect==2){
			Dream.height=640;
			if(browserW>browserH){
				Dream.width=int(640*browserW/browserH);
				Dream.scale=browserH/640;
			}
			else{
				Dream.width=1138;
				Dream.scale=browserW/Dream.width;
				Dream.root.y=int((browserH-Dream.height*Dream.scale)/2);
			}
		}
		
		Dream.root.width=Dream.width;
		Dream.root.height=Dream.height;
		Dream.root.scaleX=Dream.root.scaleY=Dream.scale;
		
		Dream.stage=new Box();
		Dream.root.addChild(Dream.stage);
		Dream.stage.name="stage";
		Dream.stage.setSize(Dream.width,Dream.height);
	}
	Dream.int=function(v){
		if(typeof(v)!="number") v*=1;
		if(isNaN(v)) return 0;
		return v>=0?Math.floor(v):Math.ceil(v);
	}
	Dream.call=function(foo,...addArgs){
		if(!foo||foo.length==0) return;
		if(arguments.length>1){
			foo=foo.slice(0);
			for(var i=1;i<arguments.length;i++){
				foo.push(arguments[i]);
			}
		}
		if(typeof(foo[0])=="function"){
			return foo[0].apply(null,foo.slice(1));
		}
		if(foo[1]) return foo[1].apply(foo[0],foo.slice(2));
	}
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Ease");
    Ease.linear=function(t,b,c,d){
        c=c-b;
        return c*t/d+b;
    }
    Ease.strongOut=function(t,b,c,d){
        c=c-b;
        t=t/d-1;
        return c*(t*t*t+1)+b;
    }
    Ease.strongIn=function(t,b,c,d){
        c=c-b;
        t=t/d;
        return c*t*t*t+b;
    }
    Ease.backOut=function(t,b,c,d,s){(s==null)?s=1.70158:null;
        c=c-b;
        t=t/d-1;
        return c*(t*t*((s+1)*t+s)+1)+b;
    }
    Ease.backIn=function(t,b,c,d,s){(s==null)?s=1.70158:null;
        c=c-b;
        t=t/d;
        return c*t*t*((s+1)*t-s)+b;
    }
    Ease.strongInOut=function(t,b,c,d){
        c=c-b;
        t=t/(d*0.5);
        if(t<1)return c*0.5*t*t*t+b;
        t-=2;
        return c*0.5*(t*t*t+2)+b;
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Evt");
    proto.type;
    proto.target;
    proto.method;
    proto.args;
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("IO");
    IO.init=function(){
        if(Dream.wx){
            Dream.wx.fs=Dream.wx.getFileSystemManager();
			Dream.wx.info=Dream.wx.getSystemInfoSync();
			Dream.wx.userPath=Dream.wx.env["USER_DATA_PATH"]+"/";
        }
    }
    IO.readFile=function(url){
        if(Dream.wx){
            return Dream.wx.fs.readFileSync(url,"utf-8");
        }
        else{
            var xh=new window.XMLHttpRequest();
            xh.open("GET",url,false);
            xh.send(null);
            return xh.responseText;
        }
    }
    IO.writeFile=function(url,text){
        if(Dream.wx){
            Dream.wx.fs.writeFileSync(url,text,"utf-8");
        }
    }
    IO.getStorage=function(key){
        if(Dream.isWeb){
            return window.localStorage[document.URL+"-"+key];
        }
        else if(Dream.wx){
			try{
				return IO.readFile(Dream.wx.userPath+key+".txt");
			}
			catch(e){}
        }
        return null;
    }
    IO.setStorage=function(key,value){
        if(Dream.isWeb){
            window.localStorage[document.URL+"-"+key]=value;
        }
        else if(Dream.wx){
            IO.writeFile(Dream.wx.userPath+key+".txt",value);
        }
    }
    IO.showStat=function(){
        Bridge.showStat();
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Box");
	Box.poolHash={};
    Box.listeners=[];

    proto.id=0;
    proto.name="";
    proto.className;
    proto.node;
    proto.children;
    proto.parent;
    proto.style;
    proto.renderLocked=false;

    proto.x;
    proto.y;
    proto.width;
    proto.height;
    proto.scaleX;
    proto.scaleY;
    proto.rotation;
    proto.gray;
    proto.alpha;
    proto.enabled;
    proto.cropped;
    proto.margins;
    proto.pivotX;
    proto.pivotY;
    proto.visible;
    proto.relativePos;

    proto.ctor=function(){
        this.relativePos=[];
    }
    proto.render=function(){
        if(this.renderLocked) return;
        for(var i=0;i<this.children.length;i++){
            var child=this.children[i];
            child.resetRelavite();
        }
        this["renderCore"]();
    }
    proto.removeChildren=function(begin){(begin==null)?begin=0:null;
        while(this.children.length>begin){
            var child=this.children[begin];
            child.removeSelf();
        }
    }
    proto.drawText=function(text,color,fontSize,width,align,spacing,leading){(color==null)?color="#000000":null;(fontSize==null)?fontSize=24:null;(width==null)?width=0:null;(align==null)?align="left":null;(spacing==null)?spacing=0:null;(leading==null)?leading=0:null;
        Sprite.prototype.drawText.apply(this,arguments);
    }
    proto.drawImage=function(url,baseTexW,baseTexH,texX,texY,texW,texH){
        return Sprite.prototype.drawImage.apply(this,arguments);
    }
    proto.addUI=function(items){
        this.addUIHandle(this,items);
        return this.children[this.children.length-1];
    }
    proto.addUIHandle=function(box,items){
        var i0=box==this?0:1;
        for(var i=i0;i<items.length;i++){
            var item=items[i];
            var obj=item instanceof Array?item[0]:item;
            var child=obj.pool?this.createPool(obj.e,obj.pool):new obj.e();
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
    proto.createPool=function(classObj,key){
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
    proto.setPos=function(x,y,isCore){(isCore==null)?isCore=false:null;
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
    proto.setSize=function(w,h,isCore){(isCore==null)?isCore=false:null;
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
    proto.resetRelavite=function(isCore){(isCore==null)?isCore=false:null;
        var p=this.relativePos;
        if(p[2]||p[3]) this.setSize(p[2]||this.width,p[3]||this.height,isCore);
        if(p[0]||p[1]) this.setPos(p[0]||this.x,p[1]||this.y,isCore);
    }
    proto.on=function(type,caller,func,args){
        Box.listeners.push([this,type,caller,func,args]);
    }
    proto.off=function(type,caller,func){
        for(var i=0;i<Box.listeners.length;i++){
            var a=Box.listeners[i];
            if(a[0]==this&&a[1]==type&&a[2]==caller&&a[3]==func){
                Box.listeners.splice(i,1);
                i--;
            }
        }
    }
	proto.dispatchEvent=function(evt){
        var box=this;
		while(box){
			if(box[evt.method]) box[evt.method](evt);
            for(var i=0;i<Box.listeners.length;i++){
                var a=Box.listeners[i];
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
    proto.contains=function(child){
		while(child){
			if(child==this) return true;
			child=child.parent;
		}
		return false;
	}
    proto.getChild=function(name){
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
    proto.addChild=function(child){
        return Sprite.prototype.addChild.call(this,child);
    }
    proto.removeSelf=function(){
        Sprite.prototype.removeSelf.call(this);
    }
    proto.get_scale=function(){
        return this["_scaleX"];
    }
    proto.set_scale=function(v){
        Sprite.prototype.set_scaleX.call(this,v);
        Sprite.prototype.set_scaleY.call(this,v);
    }
    proto.toString=function(){
        var name=this.name||this['dim']||"";
        return "["+this.className+(!name?"":" "+name)+"]";
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Math2");
    Math2.distance=function(x1,y1,x2,y2){
        return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    }
    Math2.createGuid=function(){
		var str=(new Date()["valueOf"]())+"";
		str=int((1+Math.random())*10000)+str;
		var str=parseFloat(str).toString(36);
		var guid=str.slice(-10);
        return guid;
    }
    Math2.angle=function(x1,y1,x2,y2){
        var dx=x2-x1;
        var dy=y2-y1;
        var r=Math.sqrt(dx*dx+dy*dy);
        var angle=180*Math.acos(dx/r)/Math.PI; 
        if(dy<0) return -angle;
        if(dy==0&&dx<0) return 180;
        return angle;
    }
    Math2.getParabolaPath=function(x1,y1,x2,y2,a){(a==null)?a=1:null;
        var path=[];
        x2-=x1;
        y2-=y1;
        a/=1000;
        var distance=Math2.distance(x1,y1,x2,y2);
        var b=(y2-a*x2*x2)/x2;
        var dir=x2>0?1:-1;
        var x=0;
        var y=0;
        while(x!=x2){
            var tangent=2*a*x+b;
            x+=dir*Math.sqrt(0.1*distance/(tangent*tangent+1));
            if((dir==1&&x>x2)||(dir==-1&&x<x2)){
                x=x2;
            }
            y=a*x*x+b*x;
            path.push([x1+x,y1+y]);
        }
        return path;
    }
    Math2.getParabolaPath2=function(x,y,angle,v,g){
        var path=[];
        var angle=angle*Math.PI/180;
        for(var t=0;t<100;t++){
            var x2=v*t*Math.cos(angle);
            var y2=v*t*Math.sin(angle)+g*t*t;
            path.push([x+x2,y+y2]);
        }
        return path;
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Music");
    Music.audio;
    Music.playing=false;
    Music.init=function(){
        Music.audio=document.createElement("audio");
        Dream.stage.on("touchstart",null,Music.onTouchStart);
    }
    Music.play=function(name,doEnd){
        Music.playing=true;
        Music.audio.src="sound/"+name+".mp3";
        Music.audio.loop=!doEnd;
        Music.audio.play();
        Music.audio.onended=!doEnd?null:function(){
            call(doEnd);
        }
    }
    Music.pause=function(){
        Music.playing=false;
        Music.audio.pause();
    }
    Music.resume=function(){
        Music.playing=true;
        Music.audio.play();
    }
    Music.stop=function(){
        Music.playing=false;
        Music.audio.currentTime=0;
        Music.audio.play();
    }
    Music.onTouchStart=function(){
        if(Music.audio&&Music.playing&&Music.audio.paused){
            Music.audio.play();
        }
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Shell");
    Shell.available=false;
    Shell.electron;
    Shell.nativeImage;
    Shell.fs;
    Shell.http;
    Shell.xlsx;
    Shell.zipper;
    Shell.traceDiv;
    Shell.init=function(){
        window.trace=Shell.trace;
        if(!Dream.userAgent.match(/\belectron\b/i)) return;
        Shell.available=true;
        Shell.electron=window.require("electron");
        Shell.fs=window.require("fs");
        Shell.http=window.require("http");
        Shell.nativeImage=Shell.electron.nativeImage;

        window.onerror=Shell.onError;
        window.addEventListener("keydown",Shell.onKeyDown);
    }
    Shell.preload=function(doBack,color){(color==null)?color="#000000":null;
        var label=Dream.main.addUI([
            {e:Label,text:"Loading",fontSize:30,color:color,pos:"c"}
        ]);
        Img.loadAll([Shell.preloadHandler,label,doBack]);
        Shell.preloadFlashing(label,true);
    }
    Shell.preloadHandler=function(label,doBack,index,count){
        if(index<count) return;
        label.removeSelf();
        call(doBack);
    }
    Shell.preloadFlashing=function(label,isFirst){(isFirst==null)?isFirst=false:null;
        if(!label.parent) return;
        label.visible=!label.visible;
        Timer.addLate([Shell.preloadFlashing,label],isFirst||label.visible?1000:500);
    }
    Shell.trace=function(){
        var text="";
        for(var i=0;i<arguments.length;i++){
            var s=arguments[i];
            text+=s+" ";
        }
        if(!Dream.isWeb){
            console.log(text);
            return;
        }
        var div=Shell.traceDiv;
        if(!div){
            div=Shell.traceDiv=document.createElement("div");
            div.selectabled=true;
            div.style.cssText="position:absolute;overflow:hidden;overflow-y:auto;"
                +"left:0;top:0;width:"+window.innerWidth+"px;height:30px;font-family:Arial;"
                +"background:rgba(0,0,0,0.7);color:#ffffff;font-size:20px;";
        }
        if(!div.parentNode){
            document.body.appendChild(div);
            div.innerHTML="";
        }
        div.style.height="";
        var row=document.createElement("div");
        div.appendChild(row);
        row.selectabled=true;
        row.style.cssText="margin:5px;margin-left:10px;";
        if(text.match(/^ +$/)) text="　";
        row.innerText=text;
        var h=Math.min(div.clientHeight,300);
        div.style.height=h+"px";
        div.style.top=(window.innerHeight-h)+"px";
        div.scrollTop=div.scrollHeight;
    }
    Shell.getFileSize=function(path){
        if(!Shell.fs.existsSync(path)) return 0;
        var stat=Shell.fs.statSync(path);
        return stat.size;
    }
    Shell.getImgSize=function(path){
        var nimg=Shell.electron.nativeImage.createFromPath(path);
        var size=nimg.getSize();
        return [size.width,size.height];
    }
    Shell.getSubDir=function(path){
        if(path.slice(-1)!="/") path+="/";
        var dirs=[];
        var items=Shell.fs.readdirSync(path);
        for(var i=0;i<items.length;i++){
            var name=items[i]+"";
            var stat=Shell.fs.statSync(path+name);
            stat.name=name;
            stat.type=stat.isDirectory()?"folder":"file";
            dirs.push(stat);
        }
        return dirs;
    }
    Shell.readFile=function(path){
        if(!Shell.fs.existsSync(path)) return null;
        return Shell.fs.readFileSync(path)+"";
    }
    Shell.writeFile=function(path,text){
        Shell.fs.writeFileSync(path,text);
    }
    Shell.createFolder=function(path){
        if(Shell.fs.existsSync(path)) return;
        Shell.fs.mkdirSync(path);
    }
    Shell.deleteFile=function(path){
        if(!Shell.fs.existsSync(path)) return;
        Shell.fs.unlinkSync(path);
    }
    Shell.copyFile=function(path,toPath){
        if(!Shell.fs.existsSync(path)) return;
        Shell.fs.writeFileSync(toPath,Shell.fs.readFileSync(path));
    }
    Shell.deleteFolder=function(path){
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        if(!Shell.fs.existsSync(path)) return;
        var files=Shell.fs.readdirSync(path);
        for(var i=0;i<files.length;i++){
            var path2=path+"/"+files[i];
            if(Shell.fs.statSync(path2).isDirectory()){
                Shell.deleteFolder(path2);
                continue;
            }
            Shell.fs.unlinkSync(path2);
        }
        Shell.fs.rmdirSync(path);
    }
    Shell.copyFolder=function(path,toPath){
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        if(toPath.slice(-1)=="/") toPath=toPath.slice(0,-1);
        if(!Shell.fs.existsSync(path)) return;
        if(!Shell.fs.existsSync(toPath)) Shell.fs.mkdirSync(toPath);
        var files=Shell.fs.readdirSync(path);
        for(var i=0;i<files.length;i++){
            var path2=path+"/"+files[i];
            var toPath2=toPath+"/"+files[i];
            if(Shell.fs.statSync(path2).isDirectory()){
                Shell.copyFolder(path2,toPath2);
                continue;
            }
            Shell.fs.writeFileSync(toPath2,Shell.fs.readFileSync(path2));
        }
    }
    Shell.createServer=function(){
        var http=window.require("http");
        var server=http.createServer(function(request,response){
            var s=request.path.replace(/\?.+/g,"");
            s=s.replace(/[^\/]*^\//g,"");
            var path="server/Server.js";
            if(!Shell.fs.existsSync(path)) return;
            var Server=window.require(path);
            Server.start(request,response);
         });
        server.listen(8000);
    }
    Shell.readExcel=function(path,tab){(tab==null)?tab=0:null;
        if(!Shell.xlsx) Shell.xlsx=require("node-xlsx");
        var obj=Shell.xlsx.parse(path);
        return obj[tab].data;
    }
    Shell.zipFolder=function(path,toPath){
        if(!Shell.zipper) Shell.zipper=require("zip-local");
        Shell.zipper.sync.zip(path).compress().save(toPath);
    }
    Shell.onError=function(msg,url,line){
        var file=url.replace(/.+\//g,"");
        if(file=="code.js"){
            var text=IO.readFile("js/code.js");
            var arr=text.replace(/\r/g,"").split("\n");
            for(var i=line;i>=0;i--){
                var str=arr[i];
                if(str.indexOf("Bridge.createClass")==-1) continue;
                var m=str.match(/\"(\w+)\"/)
                file=m[1]+".ts";
                line-=i;
                break;
            }
        }
        trace("Error in "+file+"("+line+")\n"+msg);
    }
    Shell.onKeyDown=function(evt){
        if(evt.keyCode==116) window.close();
    }
    Shell.onTouchStart=function(evt){
        var div=Shell.traceDiv;
        if(div&&div.parentNode){
            if(evt.target!=div&&evt.target.parentNode!=div){
                div.parentNode.removeChild(div);
            }
        }
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Sound");
    Sound.items=[];
    Sound.context;
    Sound.bufferHash={};
    Sound.muted=false;
    Sound.init=function(){
        window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.msAudioContext;
        if(window.AudioContext) Sound.context=new window.AudioContext();
    }
    Sound.play=function(name){
        if(Sound.muted) return;
        var url="sound/"+name+".mp3";
        if(Sound.context){
            Sound.playContext(url);
            return;
        }
        var audio=document.createElement("audio");
        Sound.items.push(audio);
        audio.src=url;
        audio.play();
    }
    Sound.stopAll=function(){
        for(var i=0;i<Sound.items.length;i++){
            var obj=Sound.items[i];
            if(obj.pause) obj.pause();
            if(obj.stop) obj.stop();
        }
    }
    Sound.playContext=function(url){
        var buffer=Sound.bufferHash[url];
        if(buffer==false) return;
        if(buffer==null){
            Sound.load(url,[Sound.playContext,url]);
            return;
        }
        var source=Sound.context.createBufferSource();
        Sound.items.push(source);
        source.buffer=buffer;
        source.connect(Sound.context.destination);
        source.start();
        Sound.context.resume();
    }
    Sound.load=function(url,doLoad){
        if(!window.AudioContext){
            call(doLoad);
            return;
        }
        Sound.bufferHash[url]=false;
        var xhr=new window.XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.responseType="arraybuffer";
        xhr.send();
        xhr.onload=function(){
            Sound.context.decodeAudioData(xhr.response,function(buffer){
                Sound.bufferHash[url]=buffer;
                call(doLoad);
            });
        }
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Timer");
    Timer.interval=17;
    Timer.now=0;
    Timer.scale=1;
    Timer.items=[];
    Timer.startTime=0;
    Timer.frameTime=0;
    Timer.lastBgColor;
    Timer.init=function(){
        window.requestAnimationFrame(Timer.onEnterFrame);
        Timer.startTime=new Date().valueOf();
    }
    Timer.addLate=function(foo,time,autoClear){(time==null)?time=0:null;(autoClear==null)?autoClear=true:null;
        Timer.items.push([foo,Timer.now+time,false,autoClear]);
    }
    Timer.addLoop=function(foo,autoClear){(autoClear==null)?autoClear=true:null;
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo2=arr[0];
            if(foo[0]==foo2[0]&&foo[1]==foo2[1]){
                Timer.items[i]=[foo,-1,false,autoClear];
                return;
            }
        }
        Timer.items.push([foo,-1,false,autoClear]);
    }
    Timer.clear=function(caller,func){
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo=arr[0];
            var finished=arr[2];
            if(foo[0]==func||(foo[0]==caller&&foo[1]==func)){
                finished=arr[2]=true;
            }
        }
    }
    Timer.onEnterFrame=function(){
        window.requestAnimationFrame(Timer.onEnterFrame);
        Timer.now=new Date().valueOf()-Timer.startTime;
        if(Timer.now-Timer.frameTime<0.75*Timer.interval){
            return;
        }
        Timer.scale=Math.min((Timer.now-Timer.frameTime)/Timer.interval,3);
        Timer.frameTime=Timer.now;
        for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var foo=arr[0];
            var time=arr[1]
            var finished=arr[2];
            var autoClear=arr[3];
            var caller=foo[0];
            if(autoClear&&caller instanceof Box&&!Dream.stage.contains(caller)){
                finished=arr[2]=true;
            }
            if(finished) continue;
            if(time==-1){
                call(foo);
            }
            else{
                if(Timer.now>=time){
                    finished=arr[2]=true;
                    call(foo);
                }
            }
        }
		for(var i=0;i<Timer.items.length;i++){
            var arr=Timer.items[i];
            var finished=arr[2];
            if(!finished) continue;
            Timer.items.splice(i,1);
            i--;
        }
        if(Timer.lastBgColor!=Dream.bgColor){
            Timer.lastBgColor=Dream.bgColor;
            Bridge.setBgColor(Dream.bgColor);
        }
        Bridge.render();
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("HRoll",Box);
	proto.relative=true;
	proto.scrollMax=0;
	proto._scroll=0;
	proto.pressScroll=0;
	proto.dragPaths;
	proto.dragSpeed=0;

	proto.container;
	proto.scroller;
	proto.ctor=function(){
        
		this.setSize("f","f");
		this.cropped=true;
		this.addUI([
			{e:Box,dim:"container",size:"f"},
			{e:Box,dim:"scroller",pos:[0,0,10,4],bgColor:"#000000",alpha:0,visible:false}
		])
	}
	proto.render=function(){
		if(this.renderLocked) return;
		while(this.children.length>2){
			this.container.addChild(this.children[2]);
		}
		if(this.relative){
			var x=!this.margins?0:this.margins[0];
			for(var i=0;i<this.container.children.length;i++){
				var child=this.container.children[i];
				if(!child.visible) continue;
				if(child.margins){
					x+=int(child.margins[0]);
				}
				child.x=x;
				x+=child.width;
				if(child.margins){
					x+=int(child.margins[2]);
				}
			}
		}
		var cell=this.container.children[this.container.children.length-1];
		var width=cell.x+cell.width;
		if(this.margins) width+=this.margins[2];
		this.container.setSize(width,this.height);

		this.scrollMax=Math.max(width-this.width,0);
		this.scroller.y=this.height-6;
		this.scroller.visible=this.scrollMax>0;
		var clientW=this.width+this.scrollMax;
		this.scroller.width=(this.width-20)*this.width/clientW;
	}

	proto.runDrag=function(step){(step==null)?step=0:null;
		if(step==0){
			this.dragPaths=[];
			Tween.clear(this.scroller);
			Timer.clear(this,this.runDrag);
			Timer.addLoop([this,this.runDrag,1]);
		}
		else if(step==1){

			var evt=TouchEvt.self;
			if(!evt.target){
				Timer.clear(this,this.runDrag);
				this.runDrag(this.scroll<0||this.scroll>this.scrollMax?2:3);
				return;
			}
			if(evt.x!=evt.pressX||evt.y!=evt.pressY){
				this.scroller.alpha=0.5;
			}
			var x=this.pressScroll-(evt.x-evt.pressX);
			if(x<0) x/=5;
			if(x>this.scrollMax){
				x=this.scrollMax+(x-this.scrollMax)/5;
			}
			this.scroll=x;
			this.dragPaths.push(x);
			if(this.dragPaths.length>5) this.dragPaths.shift();
		}
		else if(step==2){

			var scroll=this.scroll<0?0:this.scrollMax;
			Tween.to(this,{scroll:scroll},300,Ease.strongOut);
			Timer.addLate([this,this.runDrag,5],300)
		}
		else if(step==3){

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
	proto.scrollTo=function(v){
		this.scroll=Math.min(Math.max(v,0),this.scrollMax);
	}
	proto.get_scroll=function(){
		return this._scroll;
	}
	proto.set_scroll=function(v){
		this._scroll=v;
		this.container.x=-v;
		var per=v==0||this.scrollMax==0?0:v/this.scrollMax;
		this.scroller.x=(this.width-this.scroller.width-20)*Math.max(Math.min(per,1),0)+10;
	}
	proto.onTouchStart=function(evt){
		this.pressScroll=this.scroll;
		this.runDrag();
	}
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Button",Box);
    proto.delay=false;
    proto.zoom=false;
    proto.img;
    proto.baseContainer;
    proto.container;
    proto.cover;
    proto._src;
    proto.src2;
    proto.ctor=function(){
        
        this.delay=Dream.isMobile;
        this.addUI([
            [{e:Box,dim:"baseContainer"},
                {e:Img,dim:"img"},
                {e:Box,dim:"container"}
            ]
        ])
    }
    proto.get_src=function(){
        return this._src;
    }
    proto.set_src=function(src){
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
    proto.render=function(){
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
            if(!this.cover) this.cover=this.baseContainer.addChild(new Img());
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
    proto.onTouchStart=function(){
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
    proto.onTouchEnd=function(evt){
        var isClick=Math.abs(evt.x-evt.pressX)+Math.abs(evt.y-evt.pressY);
        Timer.addLate([this,this.onTouchEnd2,isClick],this.delay?200:1,false);
    }
    proto.onTouchEnd2=function(isClick){
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
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Roll",Box);
	proto.relative=true;
	proto.scrollMax=0;

	proto._scroll=0;
	proto.pressScroll=0;
	proto.dragPaths;
	proto.dragSpeed=0;

	proto.container;
	proto.scroller;

	proto.ctor=function(){
        
		this.setSize("f","f");
		this.cropped=true;
		this.addUI([
			{e:Box,dim:"container",size:"f"},
			{e:Box,dim:"scroller",pos:[0,0,4,10],bgColor:"#000000",alpha:0,visible:false}
		])
	}
	proto.render=function(){
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

	proto.runDrag=function(step){(step==null)?step=0:null;
		if(step==0){
			this.dragPaths=[];
			Tween.clear(this.scroller);
			Timer.clear(this,this.runDrag);
			Timer.addLoop([this,this.runDrag,1]);
		}
		else if(step==1){

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

			var scroll=this.scroll<0?0:this.scrollMax;
			Tween.to(this,{scroll:scroll},300,Ease.strongOut);
			Timer.addLate([this,this.runDrag,5],300)
		}
		else if(step==3){

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
	proto.clear=function(){
		this.container.removeChildren();
		this.render();
		this.scroll=0;
	}
	proto.scrollTo=function(v){
		this.scroll=Math.min(Math.max(v,0),this.scrollMax);
	}
	proto.get_scroll=function(){
		return this._scroll;
	}
	proto.set_scroll=function(v){
		this._scroll=v;
		this.container.y=-v;
		var per=v==0||this.scrollMax==0?0:v/this.scrollMax;
		this.scroller.y=(this.height-this.scroller.height-20)*Math.max(Math.min(per,1),0)+10;
	}
	proto.onTouchStart=function(evt){
		this.pressScroll=this.scroll;
		this.runDrag();
	}
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Img",Box);
    Img.resItems;
    Img.resHash;
    Img.preloadItems;
    Img.preloadIndex=0;
    Img.loadHash={};
    Img.shapeHash={};
    Img.init=function(){
		var text=IO.readFile("img/-pack.json");
		Img.resItems=JSON.parse(text);
		Img.resHash={};
		for(var i=0;i<Img.resItems.length;i++){
			var arr=Img.resItems[i];
			Img.resHash[arr[0]]=arr;
		}
    }
    Img.loadAll=function(doLoading){
        Img.preloadItems=[];
        Img.preloadIndex=0;
        for(var i=0;i<Img.resItems.length;i++){
            var resArr=Img.resItems[i];
            if(resArr.length>=6) continue;
            var url=resArr[0];
            if(url.indexOf("./")==0) continue;
            Img.preloadItems.push("img/"+url+"?"+resArr[1]);
        }
        Img.loadAllHandler(doLoading);
    }
    Img.loadAllHandler=function(doLoading){
        call(doLoading,Img.preloadIndex,Img.preloadItems.length);
        if(Img.preloadIndex>=Img.preloadItems.length){
            return;
        }
        var url=Img.preloadItems[Img.preloadIndex];
        Img.load(url,[Img.loadAllHandler,doLoading]);
        Img.preloadIndex++;
    }
    Img.load=function(url,target){
        var loadArr=Img.loadHash[url];
        if(!loadArr){
            Bridge.loadTexture(url,Img.loadOk);
            loadArr=Img.loadHash[url]=[];
        }
        if(loadArr.indexOf(target)==-1) loadArr.push(target);
        
        if(Bridge.textureHash[url]) Img.loadOk(url);
    }
    Img.loadOk=function(url){
        var loadArr=Img.loadHash[url];
        for(var i=0;i<loadArr.length;i++){
            var target=loadArr[i];
            if(target instanceof Array){
                call(target);
            }
            else{
                target.render();
            }
        }
        loadArr.splice(0);
    }

    proto.url;
    proto._src;

    proto.ctor=function(){
        
        this.enabled=false;
    }
    proto.get_src=function(){
        return this._src;
    }
    proto.set_src=function(src){
        this._src=src;
        this.url=src;
        if(!src){
            this.setSize(0,0,true);
            this.drawImage(src);
            return;
        }
        if(src.match(/^\d*#/)){
            this.render();
            return;
        }
        var width=0;
        var height=0;
        this["_pivotX2"]=0;
        this["_pivotY2"]=0;
        var resArr=Img.resHash[src];
        if(resArr){
            width=resArr[2];
            height=resArr[3];
        }
        if(this.url.indexOf("./")==0){
            this.url=this.url.slice(2);
        }
        else if(this.url.indexOf(":")>-1){
            this.url=this.url;
        }
        else{
            if(!resArr){
                this.url=null;
                return;
            }
            if(resArr.length==4){
                this.url="img/"+this.url.replace(/\//g,"-")+"?"+resArr[1];
            }
            else if(resArr.length==6){
                var resArr2=Img.resHash["-pack.png"];
                this.url="img/-pack.png?"+resArr2[1];
            }
            else if(resArr.length==10){
                width=resArr[6];
                height=resArr[7];
                this["_pivotX2"]=-resArr[8];
                this["_pivotY2"]=-resArr[9];
                if(this["resetPivot"]) this["resetPivot"]();
                for(var i=0;i<Img.resItems.length;i++){
                    var resArr2=Img.resItems[i];
                    var url2=resArr2[0];
                    if(url2.indexOf("-pack-")!=0) continue;
                    var s1=url2.replace(/^\-pack\-/,"").replace(/\.png/,"-");
                    var s2=this._src.replace(/\//g,"-");
                    if(s2.indexOf(s1)==0){
                        this.url="img/"+url2+"?"+resArr2[1];
                        break;
                    }
                }
            }
        }
        this.setSize(width,height);
        this.render();
    }
    proto.render=function(){
        if(this.renderLocked) return;
        if(!this.url) return;
        if(this.url.match(/^\d*#/)){
            if(this.width==0||this.height==0){
                this.setSize(100,100,true);
            }
            var shapeKey=this.src+"-"+this.width+"-"+this.height;
            if(Img.shapeHash[shapeKey]){
                this.url=Img.shapeHash[shapeKey];
            }
            else{
                var url=this.drawImage(this.url);
                if(!url) return;
                this.url=Img.shapeHash[shapeKey]=url;
            }
        }
        var tex=Bridge.textureHash[this.url];
        if(!tex){
            Img.load(this.url,this);
            return;
        }
        var p=Img.resHash[this.src];
        var width=this.width;
        var height=this.height;
        if(!p||p.length==4){
            if(!p&&width==0) width=tex.width;
            if(!p&&height==0) height=tex.height;
            this.setSize(width,height,true);
            this.drawImage(this.url,tex.width,tex.height);
        }
        else if(p.length==6){
            this.drawImage(this.url,tex.width,tex.height,p[4],p[5],p[2],p[3]);
        }
        else if(p.length==10){
            this.drawImage(this.url,tex.width,tex.height,p[4],p[5],p[6],p[7]);
        }
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Main",Box);
    Main.aspect=1;
    Main.bridge="laya";
    Main.bridgeSite="web";
    proto.ctor=function(){
        

        var label=this.addChild(new Label());
        label.fontSize=60;
        label.text="Hello,DreamJs!";
        label.setPos("c",300);
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("Label",Box);
    proto._font;
    proto._color;
    proto._fontSize=24;
    proto._align="left";
    proto._spacing=0;
    proto._leading=0;

    proto._text="";

    proto.ctor=function(){
        
        this.enabled=false;
    }
    proto.get_font=function(){
        return this._font;
    }
    proto.set_font=function(v){
        this._font=v;
        this.render();
    }
    proto.get_color=function(){
        return this._color;
    }
    proto.set_color=function(v){
        this._color=v;
        this.render();
    }
    proto.get_fontSize=function(){
        return this._fontSize;
    }
    proto.set_fontSize=function(v){
        this._fontSize=v;
        this.render();
    }
    proto.get_align=function(){
        return this._align;
    }
    proto.set_align=function(v){
        this._align=v;
        this.render();
    }
    proto.get_spacing=function(){
        return this._spacing;
    }
    proto.set_spacing=function(v){
        this._spacing=v;
        this.render();
    }
    proto.get_leading=function(){
        return this._leading;
    }
    proto.set_leading=function(v){
        this._leading=v;
        this.render();
    }
    proto.get_text=function(){
        return this._text;
    }
    proto.set_text=function(v){
        this._text=v;
        this.render();
    }
    proto.toSign=function(s){
        var n=s.charCodeAt(0);
        if(s=="+"){
            s="plus";
        }
        else if(s=="-"){
            s="minus";
        }
        else if(s=="."){
            s="dot";
        }
        else if(n>=65&&n<=90){
            s=s.toLowerCase()+"2";
        }
        else if(n<48||n>122||(n>57&&n<97)){
            s=n+"";
        }
        return s;
    }
    proto.render=function(){
        if(this.renderLocked) return;
        var text=this._text;
        var width=this["_autoWidth"]?0:this.width;
        if(!this.font){
            this.drawText(text,this._color,this._fontSize,width,this._align,this._spacing,this._leading);
        }
        else{
            this.removeChildren();

            var items=[];
            var x=0;
            var y=0;
            var maxW=0;
            var lineH=0;
            for(var i=0;i<=text.length;i++){
                var s=text.charAt(i);
                var s2=this.toSign(s);
                var resArr=Img.resHash["font/"+this.font+"/"+s2+".png"];
                if(s!=""&&s!="\n"&&!resArr) continue;
                if(lineH==0&&resArr) lineH=resArr[3]+this._leading;
                var w=!resArr?0:resArr[2];
                if(s==""||s=="\n"||(width&&x+w>width)){
                    if(width&&this._align!="left"){
                        var shiftX=this._align=="center"?(width-x)/2:(width-x);
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
                items.push([s2,x,y]);
                maxW=Math.max(x+w,maxW);
                x+=w+this._spacing-1;
            }
            if(!width) width=maxW;
            var height=y;
            for(var i=0;i<items.length;i++){
                var a=items[i];
                var src="font/"+this._font+"/"+a[0]+".png";
                this.addUI([
                    {e:Img,pool:"font-"+this._font,src:src,pos:[a[1],a[2]]}
                ])
            }
            this.setSize(width,height,true);
        }
        this.resetRelavite(true);
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("TouchEvt",Evt);
    TouchEvt.self;
    TouchEvt.domTarget;
    proto.x;
    proto.y;
    proto.pressX;
    proto.pressY;
    TouchEvt.init=function(){
        TouchEvt.self=new TouchEvt();
        if(Dream.bridge=="laya"){
            TouchEvt.initLaya();
        }
        else if(Dream.isWeb){
            TouchEvt.initWeb();
        }
        else if(window.wx){
            TouchEvt.initWx();
        }
    }
    TouchEvt.initLaya=function(){
        Dream.stage.node.on("mousedown",null,TouchEvt.onLayaEvent);
        Dream.stage.node.on("mousemove",null,TouchEvt.onLayaEvent);
        Dream.stage.node.on("mouseup",null,TouchEvt.onLayaEvent);
    }
    TouchEvt.onLayaEvent=function(evt){
        var target;
        var type=evt.type=="mousedown"?"touchstart":(evt.type=="mouseup"?"touchend":"touchmove");
        var x=(evt.stageX-Dream.root.x)/Dream.scale;
		var y=(evt.stageY-Dream.root.y)/Dream.scale;

        if(type=="touchstart"){
            Shell["onTouchStart"](evt);
            target=Bridge.getTouchTarget(evt.target,x,y)||Dream.stage;
        }
        else{
            target=TouchEvt.self.target;
        }
        if(!target) return;
        var evt2={type:type,target:target,x:x,y:y,touches:null};
        TouchEvt.onEvent(evt2);
    }
    TouchEvt.initWeb=function(){
        document.addEventListener(Dream.isMobile?"touchstart":"mousedown",TouchEvt.onWebEvent);
        document.addEventListener(Dream.isMobile?"touchmove":"mousemove",TouchEvt.onWebEvent);
        document.addEventListener(Dream.isMobile?"touchend":"mouseup",TouchEvt.onWebEvent);
    }
    TouchEvt.onWebEvent=function(evt){
        var target;
        var selectabled=evt.target.selectabled==true;

        var type=evt.type;
        if(type=="mousedown") type="touchstart";
        if(type=="mousemove") type="touchmove";
        if(type=="mouseup") type="touchend";

        var touches=evt.touches;
        var touch=!touches?evt:touches[0];
        var x0=!touch?0:touch.clientX;
        var y0=!touch?0:touch.clientY;
        var x=int((x0-Dream.root.x)/Dream.scale);
        var y=int((y0-Dream.root.y)/Dream.scale);

        if(type=="touchstart"){
            Shell["onTouchStart"](evt);
            target=Bridge.getTouchTarget(evt.target,x0,y0)||Dream.stage;
            if(TouchEvt.domTarget&&TouchEvt.domTarget.selectabled){
                window.getSelection().removeAllRanges();
                selectabled=true;
            }
            TouchEvt.domTarget=evt.target;
        }
        else{
            target=TouchEvt.self.target;
        }
        if(!target) return;
        var evt2={type:type,target:target,x:x,y:y,touches:touches};
        TouchEvt.onEvent(evt2);

        if(!selectabled) evt.preventDefault();
    }
    TouchEvt.initWx=function(){
        Dream.wx.onTouchStart(TouchEvt.onWxEvent);
        Dream.wx.onTouchMove(TouchEvt.onWxEvent);
        Dream.wx.onTouchEnd(TouchEvt.onWxEvent);
    }
    TouchEvt.onWxEvent=function(evt){
        var target;
        var type=evt.type;
        var touches=evt.touches;
        var touch=!touches?evt:touches[0];
        var x=!touch?0:int(touch.clientX/Dream.scale);
        var y=!touch?0:int(touch.clientY/Dream.scale);

        if(type=="touchstart"){
            target=Bridge.getTouchTarget(null,x,y);
        }
        else{
            target=TouchEvt.self.target;
        }
        if(!target) return;
        var evt2={type:type,target:target,x:x,y:y,touches:touches};
        TouchEvt.onEvent(evt2);
    }
    TouchEvt.onEvent=function(baseEvt){
        if(!Dream.stage.enabled) return;
        var evt=TouchEvt.self;
        evt.type=baseEvt.type;
		if(baseEvt.type=="touchstart"){
            evt.target=baseEvt.target;
            evt.x=baseEvt.x;
            evt.y=baseEvt.y;
            evt.pressX=evt.x;
            evt.pressY=evt.y;
            
			evt.method="onTouchStart";
            evt.target.dispatchEvent(evt);
		}
		else if(baseEvt.type=="touchmove"){
            if(!evt.target) return;
            evt.x=baseEvt.x;
            evt.y=baseEvt.y;
            evt.method="onTouchMove";
            evt.target.dispatchEvent(evt);
		}
		else if(baseEvt.type=="touchend"){
            if(!evt.target) return;
            evt.method="onTouchEnd";
			evt.target.dispatchEvent(evt);
            if(Math.abs(evt.x-evt.pressX)+Math.abs(evt.y-evt.pressY)<10){
                evt.type="click";
                evt.method="onClick";
                evt.target.dispatchEvent(evt);
            }
            evt.target=null;
		}
    }
    Bridge.bindGetterSetter(proto);
})();
(function(){var proto=Bridge.createClass("ImgClip",Img);
    proto.playing=false;
    proto.duration=100;
    proto.loop=false;
    proto.count=0;
    proto._frame=0;
    proto.doEnd;
    proto.play=function(doEnd){
        if(this.count<=1) return;
        this.playing=true;
        this.doEnd=doEnd;
        if(this.frame>=this.count) this._frame=1;
        Timer.clear(this,this.playHandle);
        Timer.addLate([this,this.playHandle],this.duration);
    }
    proto.playHandle=function(){
        if(this.frame>=this.count){
            this.playEnd();
            return;
        }
        this.frame++;
        Timer.addLate([this,this.playHandle],this.duration);
    }
    proto.playEnd=function(){
        if(this.loop){
            this.frame=1;
            this.playHandle();
            return;
        }
        this.playing=false;
        if(this.doEnd) call(this.doEnd);
    }
    proto.get_src=function(){
        return this["_src"];
    }
    proto.set_src=function(src){
        Img.prototype["set_src"].call(this,src);
        this.count=0;
        if(!Img.resHash[src]) return;
        var m=src.match(/(\d+)\.\w+$/);
        this._frame=!m?0:int(m[1]);
        if(this.frame==0) return;
        var n=0;
        while(Img.resHash[src.replace(/(\d+)\.(\w+)$/g,(n+1)+".$2")]){
            n++;
        }
        this.count=n;
    }
    proto.get_frame=function(){
        return this._frame;
    }
    proto.set_frame=function(v){
        this._frame=v;
        if(this.count==0) return;
        var src=this.src.replace(/(\d+)\.(\w+)$/g,v+".$2");
        Img.prototype["set_src"].call(this,src);
    }
    Bridge.bindGetterSetter(proto);
})();
Dream.init();