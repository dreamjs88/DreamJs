class Dream{
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
		Dream.stage["initAsStage"](Main['aspect']);
		Dream.width=Dream.stage.width;
		Dream.height=Dream.stage.height;
		Dream.scale=Core["stageScale"];

        Dream.main=new Main();
        Dream.stage.addChild(Dream.main);
        Dream.main.setSize(this.width,this.height);
        Dream.main["ctor"]();
	}
	private static int(v):number{
		if(typeof(v)!="number") v*=1;
		if(isNaN(v)) return 0;
		return v>=0?Math.floor(v):Math.ceil(v);
	}
	private static call(foo,...args){
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