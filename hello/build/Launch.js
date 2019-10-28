(function(){
	Launch={};
	Launch.path;
	Launch.electron;
	Launch.fs;
	Launch.start=function(){
		Launch.path=__dirname.replace(/\\/g,"/").replace(/[^\/]+$/g,"");
		Launch.electron=require("electron");
		Launch.http=require("http");
		Launch.fs=require("fs");
		Launch.electron.app.on("ready",Launch.start2);
	}
	Launch.start2=function(){
		var code=Launch.fs.readFileSync("bin/index.html")+"";
		var m=code.match(/ bgcolor=\"(\#\w+)/i);
		var bgColor=!m?"#ffffff":m[1];

		var code=Launch.fs.readFileSync("code/Main.ts")+"";
		code=code.replace(/  +/g," ").replace(/ *([^\w]) */g,"$1");
		var m=code.match(/\bpublic static aspect=(\d+)/);
		var aspect=!m?0:parseInt(m[1]);

		Launch.win=new Launch.electron.BrowserWindow({
			title:"",
			backgroundColor:bgColor,
			resizable:false,
			maximizable:false,
			autoHideMenuBar:true
		});
		var size=Launch.electron.screen.getPrimaryDisplay().workAreaSize;
		var screenW=size.width;
		var screenH=size.height;

		if(aspect==1){
			var w=parseInt(screenH/2);
			Launch.win.setSize(w,screenH);
			Launch.win.setPosition(screenW-w,0);
		}
		else if(aspect==2){
			var w=parseInt(screenW*0.75);
			var h=parseInt(w*0.58);
			Launch.win.setSize(w,h);
			Launch.win.setPosition(parseInt((screenW-w)/2),parseInt((screenH-h)/2));
		}
		else{
			Launch.win.setSize(screenW,screenH);
			Launch.win.setPosition(0,0);
		}

		Launch.win.show();
		Launch.win.loadURL("file:///"+Launch.path+"bin/index.html");
	}
	function alert(text){
		Launch.electron.dialog.showErrorBox("",text+"");
	}
})();
Launch.start();