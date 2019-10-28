class IO{
    public static init(){
        if(Dream.wx){
            Dream.wx.fs=Dream.wx.getFileSystemManager();
			Dream.wx.info=Dream.wx.getSystemInfoSync();
			Dream.wx.userPath=Dream.wx.env["USER_DATA_PATH"]+"/";
        }
    }
    public static readFile(url:string):string{
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
    public static writeFile(url:string,text:string){
        if(Dream.wx){
            Dream.wx.fs.writeFileSync(url,text,"utf-8");
        }
    }
    public static getStorage(key:string):string{
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
    public static setStorage(key:string,value:string){
        if(Dream.isWeb){
            window.localStorage[document.URL+"-"+key]=value;
        }
        else if(Dream.wx){
            IO.writeFile(Dream.wx.userPath+key+".txt",value);
        }
    }
    public static showStat(){
        Bridge.showStat();
    }
}