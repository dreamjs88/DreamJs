class TouchEvt extends Evt{
    public static self:TouchEvt;
    private static domTarget;
    public x:number;
    public y:number;
    public pressX:number;
    public pressY:number;
    public static init(){
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
    private static initLaya(){
        Dream.stage.node.on("mousedown",null,TouchEvt.onLayaEvent);
        Dream.stage.node.on("mousemove",null,TouchEvt.onLayaEvent);
        Dream.stage.node.on("mouseup",null,TouchEvt.onLayaEvent);
    }
    private static onLayaEvent(evt){
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
    private static initWeb(){
        document.addEventListener(Dream.isMobile?"touchstart":"mousedown",TouchEvt.onWebEvent);
        document.addEventListener(Dream.isMobile?"touchmove":"mousemove",TouchEvt.onWebEvent);
        document.addEventListener(Dream.isMobile?"touchend":"mouseup",TouchEvt.onWebEvent);
    }
    private static onWebEvent(evt){
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
    private static initWx(){
        Dream.wx.onTouchStart(TouchEvt.onWxEvent);
        Dream.wx.onTouchMove(TouchEvt.onWxEvent);
        Dream.wx.onTouchEnd(TouchEvt.onWxEvent);
    }
    public static onWxEvent(evt){
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
    private static onEvent(baseEvt){
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
}