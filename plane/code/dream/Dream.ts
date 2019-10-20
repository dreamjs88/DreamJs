class Dream{
	public static core:string;
	public static root:Box;
	public static stage:Box;
	public static main:Main;
	public static width=0;
	public static height=0;
	public static scale=1;
	public static wx;
	public static userAgent:string;
	public static isWeb=false;
	public static isMobile=false;
    public static isIPhone=false;
	private static init(){
		window.int=Dream.int;
		window.call=Dream.call;

		Dream.core=Core.type;
		Dream.root=Core.root;
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
		Img.init();

        Dream.main=new Main();
        Dream.stage.addChild(Dream.main);
		Dream.main.setSize(this.width,this.height);
        Dream.main["ctor"]();
	}
	private static initStage(){
		var aspect=Main["aspect"];
		var browserW=int(window.innerWidth);
		var browserH=int(window.innerHeight);
		Dream.width=browserW;
		Dream.height=browserH;
		if(aspect==1){
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
		else if(aspect==2){
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
	private static int(v):number{
		if(typeof(v)!="number") v*=1;
		if(isNaN(v)) return 0;
		return v>=0?Math.floor(v):Math.ceil(v);
	}
	private static call(foo,...addArgs){
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
}