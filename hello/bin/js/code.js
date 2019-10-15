(function(){var proto=Core.createClass("Tool");
    Tool.upgradeProject=function(){
        if(!Shell.available) return;
        var items=[
            "examples/plane/",
            "examples/sprite-test/",

        ]
        for(var i=0;i<items.length;i++){
            var toPath="../"+items[i];
            Shell.copyFile(toPath+"bin/js/code.js",toPath+"code.js");

            Shell.deleteFolder(toPath+"build");
            Shell.deleteFolder(toPath+"code/dream");
            Shell.deleteFolder(toPath+"bin/js");

            Shell.copyFolder("build",toPath+"build");
            Shell.copyFolder("code/dream",toPath+"code/dream");
            Shell.copyFolder("bin/js",toPath+"bin/js");

            Shell.copyFile(toPath+"code.js",toPath+"bin/js/code.js");
            Shell.deleteFile(toPath+"code.js");
        }
        window.close();
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Tween");
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Dream");
	Dream.stage;
	Dream.main;
	Dream.width=0;
	Dream.height=0;
	Dream.scale=1;
	Dream.wx;
	Dream.userAgent;
	Dream.isWeb=false;
	Dream.isMobile=false;
    Dream.isIPhone=false;
	Dream.init=function(){
		window.int=Dream.int;
		window.call=Dream.call;

		Dream.wx=window.wx;
		Dream.userAgent=window.navigator.userAgent;
		Dream.isWeb=document.forms!=null;
		Dream.isMobile=!!Dream.userAgent.match(/\bmobile\b/i);
        Dream.isIPhone=!!Dream.userAgent.match(/\b(iPhone|iPad)\b/i);

		IO.init();
		Shell.init();
		Timer.init();
		TouchEvt.init();
		Img.init();

		Dream.stage=new Box();
		Dream.stage.name="stage";
		Dream.scale=Dream.stage["initAsStage"](Main['aspect']);
		Dream.width=Dream.stage.width;
		Dream.height=Dream.stage.height;

        Dream.main=new Main();
        Dream.stage.addChild(Dream.main);
        Dream.main.setSize(this.width,this.height);
        Dream.main["ctor"]();
	}
	Dream.int=function(v){
		if(typeof(v)!="number") v*=1;
		if(isNaN(v)) return 0;
		return v>=0?Math.floor(v):Math.ceil(v);
	}
	Dream.call=function(foo,...otherArgs){
		if(!foo) return;
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Ease");
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("IO");
    IO.init=function(){
        if(Dream.wx){
            Dream.wx.fs=Dream.wx["getFileSystemManager"]();
			Dream.wx.info=Dream.wx["getSystemInfoSync"]();
			Dream.wx.userPath=Dream.wx["env"]["USER_DATA_PATH"]+"/";
        }
    }
    IO.readFile=function(url){
        if(Dream.wx){
            return Dream.wx.fs["readFileSync"](url,"utf-8");
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
            Dream.wx.fs["writeFileSync"](url,text,"utf-8");
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
        Core.showStat();
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Box");
	Box.poolHash={};

    proto.id=0;
    proto.name;
    proto.className;
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
    proto.designPos;
    proto.pivotX;
    proto.pivotY;

    proto.visible;
    proto._bgColor;

    proto.removeChildren=function(){
        while(this.children.length>0){
            var child=this.children[0];
            child.removeSelf();
        }
    }
    proto.render=function(){
        if(this.renderLocked) return;
        if(this["renderBox"]) this["renderBox"]();
    }
    proto.drawText=function(text,color,fontSize,width,align,spacing,leading){(color==null)?color="#000000":null;(fontSize==null)?fontSize=24:null;(width==null)?width=0:null;(align==null)?align="left":null;(spacing==null)?spacing=0:null;(leading==null)?leading=0:null;
        Sprite.prototype.drawText.apply(this,arguments);
    }
    proto.drawImage=function(url,width,height,baseTexW,baseTexH,texX,texY,texW,texH){
        Sprite.prototype.drawImage.apply(this,arguments);
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
            if(obj.pos&&obj.pos.length>=3) child.setSize(obj.pos[2],obj.pos[3]||0);
            if(obj.size&&!(obj.size instanceof Array)) obj.size=[obj.size,obj.size];
            if(obj.size) child.setSize(obj.size[0],obj.size[1]);
            if(obj.pos) child.setPos(obj.pos[0],obj.pos[1]);
            if(obj.pos) child.designPos=obj.pos;
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
    proto.setPos=function(x,y){
        var parentW=!this.parent?Dream.stage.width:this.parent.width;
        var parentH=!this.parent?Dream.stage.height:this.parent.height;
		if(typeof(x)=="string"){
            var t=x.slice(0,1);
            x=int(int(t)>0?x:x.slice(1));
            if(t=="c") x+=(parentW-this.width)/2;
            if(t=="r") x+=parentW-this.width;
		}
		if(typeof(y)=="string"){
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
		if(typeof(w)=="string"){
            var t=w.slice(0,1);
            w=int(int(t)>0?w:w.slice(1));
            if(t=="f") w+=parentW;
		}
		if(typeof(h)=="string"){
            var t=h.slice(0,1);
            h=int(int(t)>0?h:h.slice(1));
            if(t=="f") h+=parentH;
        }
        Sprite.prototype.set_height.call(this,h,true);
        Sprite.prototype.set_width.call(this,w,isCore);
    }
	proto.dispatch=function(evt){
        var box=this;
		while(box){
			if(box[evt.method]) box[evt.method](evt);
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
    proto.get_bgColor=function(){
        return this._bgColor;
    }
    proto.set_bgColor=function(v){
        this._bgColor=v;
        Sprite.prototype.setBgColor.call(this,v);
    }
    proto.toString=function(){
        var name=this.name||this['dim']||"";
        return "["+this.className+(!name?"":" "+name)+"]";
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Math2");
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Shell");
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
            div.selectable=true;
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
        row.selectable=true;
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
    Shell.getSubDir=function(path){
        if(path.slice(-1)=="/") path=path.slice(0,-1);
        var items=[];
        var arr=Shell.fs.readdirSync(path);
        for(var i=0;i<arr.length;i++){
            var file=arr[i];
            var stat=Shell.fs.statSync(path+"/"+file);
            if(stat.isDirectory()) file+="/";
            items.push(file);
        }
        return items;
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
                if(str.indexOf("Core.createClass")==-1) continue;
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Sound");
    proto.node;
    proto.startTime=0;
    proto.playing=false;
    Sound.play=function(src){
        var sound=new Sound();
        sound.src="sound/"+src;
        sound.play();
    }
    Sound.createAudio=function(){
        var audio=document.createElement("audio");
        audio.load2=function(src,funcProgress){
            var step=0;
            var begin=function(){
                audio.src=src;
                audio.muted=true;
                audio.play();
            }
            var onProgress=function(time){
                if(step<2&&time==audio.duration) time*=0.99;
                funcProgress.call(null,time,audio.duration);
            }
            audio.oncanplaythrough=function(){
                step++
                if(step==2) onProgress(audio.duration);
            }
            audio.onprogress=function(){
                if(audio.buffered.length==0) return;
                var time=audio.buffered.end(audio.buffered.length-1);
                if(time>=audio.duration) step++;
                onProgress(time);
            }
            audio.onerror=audio.onabort=function(){
                setTimeout(begin,1000);
            }
            begin();
        }
        return audio;
    }
    proto.ctor=function(){
        this.node=Sound.createAudio();
    }
    proto.play=function(){
        this.startTime=this.node.currentTime;
        this.playing=true;
        this.node.play();
    }
    proto.pause=function(){
        this.playing=false;
        this.node.pause();
    }
    proto.load=function(src,doLoading){
        this.node.load2(src,function(time,duration){
            call(doLoading,time,duration);
        });
    }
    proto.get_src=function(){
        return this.node.src;
    }
    proto.set_src=function(v){
        this.node.src=v;
    }
    proto.get_duration=function(){
        return this.node.duration;
    }
    proto.get_currentTime=function(){
        if(Dream.isIPhone){
            var minTime=this.playing?this.startTime:0;
            return Math.max(this.node.currentTime,minTime);
        }
        return this.node.currentTime;
    }
    proto.set_currentTime=function(v){
        this.node.currentTime=v;
    }
    proto.get_muted=function(){
        return this.node.muted;
    }
    proto.set_muted=function(v){
        this.node.muted=v;
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Timer");
    Timer.interval=17;
    Timer.now=0;
    Timer.scale=1;
    Timer.items=[];
    Timer.startTime=0;
    Timer.frameTime=0;
    Timer.init=function(){
        window.requestAnimationFrame(Timer.onFrame);
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
    Timer.onFrame=function(){
        window.requestAnimationFrame(Timer.onFrame);
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
        Core.render();
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("TouchEvt");
    TouchEvt.self;
    proto.x;
    proto.y;
    proto.pressX;
    proto.pressY;
    proto.target;
    proto.method;
    TouchEvt.init=function(){
        TouchEvt.self=new TouchEvt();
        if(Dream.isWeb){
            TouchEvt.initWeb();
        }
        else if(window.wx){
            TouchEvt.initWx();
        }
    }
    TouchEvt.initWeb=function(){
		if(Dream.isMobile){
			document.addEventListener("touchstart",TouchEvt.onWebEvent,{passive:false});
			document.addEventListener("touchmove",TouchEvt.onWebEvent,{passive:false});
			document.addEventListener("touchend",TouchEvt.onWebEvent,{passive:false});
		}
		else{
			document.addEventListener("mousedown",TouchEvt.onWebEvent);
			document.addEventListener("mousemove",TouchEvt.onWebEvent);
            document.addEventListener("mouseup",TouchEvt.onWebEvent);
		}
    }
    TouchEvt.onWebEvent=function(evt){
        var domTarget=evt["target"];
        var target;
        var isPrevent=true;
        if(domTarget["selectable"]) isPrevent=false;

        if(isPrevent) evt["preventDefault"]();

        var type=evt["type"];
        if(type=="mousedown") type="touchstart";
        if(type=="mousemove") type="touchmove";
        if(type=="mouseup") type="touchend";

        var touches=evt["touches"];
        var touch=!touches?evt:touches[0];
        var x=!touch?0:int((touch["clientX"]-Core["rootX"])/Dream.scale);
        var y=!touch?0:int((touch["clientY"]-Core["rootY"])/Dream.scale);

        if(type=="touchstart"){
            Shell["onTouchStart"](evt);
            target=Core["getTouchTarget"](domTarget,x,y);
        }
        else{
            target=TouchEvt.self.target;
        }
        if(!target) return;
        var evt2={type:type,target:target,x:x,y:y,touches:touches};
        TouchEvt.onEvent(evt2);
    }
    TouchEvt.initWx=function(){
        Dream.wx.onTouchStart(TouchEvt.onWxEvent);
        Dream.wx.onTouchMove(TouchEvt.onWxEvent);
        Dream.wx.onTouchEnd(TouchEvt.onWxEvent);
    }
    TouchEvt.onWxEvent=function(evt){
        var target;
        var type=evt["type"];
        var touches=evt["touches"];
        var touch=!touches?evt:touches[0];
        var x=!touch?0:int(touch["clientX"]/Dream.scale);
        var y=!touch?0:int(touch["clientY"]/Dream.scale);

        if(type=="touchstart"){
            target=Core["getTouchTarget"](null,x,y);
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
		if(baseEvt.type=="touchstart"){
            evt.target=baseEvt.target;
            evt.x=baseEvt.x;
            evt.y=baseEvt.y;
            evt.pressX=evt.x;
            evt.pressY=evt.y;
            
			evt.method="onTouchStart";
            evt.target.dispatch(evt);
		}
		else if(baseEvt.type=="touchmove"){
            if(!evt.target) return;
            evt.x=baseEvt.x;
            evt.y=baseEvt.y;
            evt.method="onTouchMove";
            evt.target.dispatch(evt);
		}
		else if(baseEvt.type=="touchend"){
            if(!evt.target) return;
            evt.method="onTouchEnd";
			evt.target.dispatch(evt);
            if(Math.abs(evt.x-evt.pressX)+Math.abs(evt.y-evt.pressY)<10){
                evt.method="onClick";
                evt.target.dispatch(evt);
            }
            evt.target=null;
		}
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("HRoll",Box);
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Roll",Box);
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
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Main",Box);
    Main.aspect=1;
    proto.ctor=function(){
        
        var label=this.addChild(new Label());
        label.setPos(100,100);
        label.fontSize=50;
        label.color="#00c000";
        label.text="Hello,world";
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Img",Box);
    Img.resItems;
    Img.resHash;
    Img.loadHash={};
    proto.url;
    proto._src;
    Img.init=function(){
		var text=IO.readFile("img/-pack.json");
		Img.resItems=JSON.parse(text);
		Img.resHash={};
		for(var i=0;i<Img.resItems.length;i++){
			var arr=Img.resItems[i];
			Img.resHash[arr[0]]=arr;
		}
    }
    Img.load=function(url,target){
        var loadArr=Img.loadHash[url];
        if(!loadArr){
            Core.loadTexture(url,null,Img.loadOk);
            loadArr=Img.loadHash[url]=[];
        }
        if(loadArr.indexOf(target)==-1) loadArr.push(target);

        if(Core.textureHash[url]) Img.loadOk(url);
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

    proto.ctor=function(){
        
        this["_isImg"]=true;
        this.enabled=false;
    }
    proto.get_src=function(){
        return this._src;
    }
    proto.set_src=function(v){
        this._src=v;
        this.url=v;
        var width=0;
        var height=0;
        this["_pivotX2"]=0;
        this["_pivotY2"]=0;
        var resArr=Img.resHash[this._src];
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
        var tex=Core.textureHash[this.url];
        if(!tex){
            Img.load(this.url,this);
            return;
        }
        var p=Img.resHash[this._src];
        var width=this.width;
        var height=this.height;
        if(!p||p.length==4){
            if(!p&&width==0) width=tex.width;
            if(!p&&height==0) height=tex.height;
             this.drawImage(this.url,width,height,tex.width,tex.height);
        }
        else if(p.length==6){
            this.drawImage(this.url,width,height,tex.width,tex.height,p[4],p[5],p[2],p[3]);
        }
        else if(p.length==10){
            this.drawImage(this.url,width,height,tex.width,tex.height,p[4],p[5],p[6],p[7]);
        }
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Button",Box);
    proto.delay=false;
    proto.zoom=false;
    proto.img;
    proto.baseContainer;
    proto.container;
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
    proto.set_src=function(v){
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
    proto.render=function(){
        if(this.renderLocked) return;
        while(this.children.length>1){
            var child=this.children[1];
            this.container.addChild(child);
        }
    }
    proto.onTouchStart=function(){
        Timer.clear(this,this.onTouchEnd2);
        if(this.src!=this.src2) this.img.src=this.src2;
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
        if(this.zoom){
            this.baseContainer.scale=1;
        }
        else{
            this.container.setPos(-this.width/2,-this.height/2);
        }
        var evt={target:this,method:"onButtonClick"};
        this.dispatch(evt);
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("Label",Box);
    proto._font;
    proto._color;
    proto._fontSize=24;
    proto._align="left";
    proto._spacing=0;
    proto._leading=0;

    proto._text;

    proto.ctor=function(){
        
        this["_isImg"]=true;
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
                    {e:Img,pool:"font-"+this._font,src:src,pos:[a[1],a[2]],bgColor:this._color}
                ])
            }
            this.setSize(width,height,true);
        }
        var dx=!this.designPos?null:this.designPos[0];
        var dy=!this.designPos?null:this.designPos[1];
        if(typeof(dx)=="string"||typeof(dy)=="string"){
            this.setPos(dx,dy);
        }
    }
    Core.bindGetterSetter(proto);
})();
(function(){var proto=Core.createClass("ImgClip",Img);
    proto.playing=false;
    proto.duration=100;
    proto.loop=false;
    proto.baseSrc;
    proto.count=0;
    proto.index=0;
    proto.doEnd;
    proto.play=function(doEnd){
        this.baseSrc=this.src;
        if(!this.baseSrc) return;
        this.baseSrc=this.baseSrc.replace(/(\d+)\.(\w+)$/g,"*.$2");
        if(Img.resHash[this.src]){
            var index=0;
            while(Img.resHash[this.baseSrc.replace(/\*/g,index+1)]){
                index++;
            }
            this.count=index;
        }
        if(this.count<=1) return;
        this.playing=true;
        this.doEnd=doEnd;
        var m=this.src.match(/(\d+)\.\w+$/);
        this.index=!m?0:int(m[1]);
        Timer.clear(this,this.playHandle);
        this.playHandle();
    }
    proto.playHandle=function(){
        if(this.index>=this.count){
            this.playEnd();
            return;
        }
        this.index++;
        this.src=this.baseSrc.replace(/\*/g,this.index);
        Timer.addLate([this,this.playHandle],this.duration);
    }
    proto.playEnd=function(){
        if(this.loop){
            this.index=0;
            this.playHandle();
            return;
        }
        this.playing=false;
        if(this.doEnd) call(this.doEnd);
    }
    Core.bindGetterSetter(proto);
})();
Dream.init();