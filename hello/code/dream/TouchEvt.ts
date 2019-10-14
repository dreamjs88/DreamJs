class TouchEvt{
    public static self:TouchEvt;
    public x:number;
    public y:number;
    public pressX:number;
    public pressY:number;
    public target:Box;
    private method:string;
    public static init(){
        TouchEvt.self=new TouchEvt();
        if(Dream.isWeb){
            TouchEvt.initWeb();
        }
        else if(window.wx){
            TouchEvt.initWx();
        }
    }
    private static initWeb(){
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
    private static onWebEvent(evt){
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
    private static initWx(){
        Dream.wx.onTouchStart(TouchEvt.onWxEvent);
        Dream.wx.onTouchMove(TouchEvt.onWxEvent);
        Dream.wx.onTouchEnd(TouchEvt.onWxEvent);
    }
    public static onWxEvent(evt){
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
    private static onEvent(baseEvt){
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
}