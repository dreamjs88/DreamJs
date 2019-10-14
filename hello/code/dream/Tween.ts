class Tween{
	public static toPath(target:Box,path:any[],time=200,ease?:any,wait=0){
		Tween.to(target,{path:path},time,ease,wait);
	}
	public static to(target:Box,props,time=200,ease?:any,wait=0){
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
		var foo:any=[target,Tween.toHandle,param];
		Timer.addLoop(foo);
		call(foo);
	}
	private static toHandle(param){
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
	public static clear(target:Box){
		for(var i=0;i<Timer.items.length;i++){
			var foo=Timer.items[i][0];
			if(foo[0]==target&&foo[1]==Tween.toHandle){
				Timer.items.splice(i,1);
				i--;
				continue;
			}
		}
	}
}