class Label extends Box{
    private _font:string;
    private _color:string;
    private _fontSize=24;
    private _align="left";
    private _spacing=0;
    private _leading=0;

    private _text:string;

    constructor(){
        super();
        this["_isImg"]=true;
        this.enabled=false;
    }
    public get font():string{
        return this._font;
    }
    public set font(v){
        this._font=v;
        this.render();
    }
    public get color():string{
        return this._color;
    }
    public set color(v){
        this._color=v;
        this.render();
    }
    public get fontSize():number{
        return this._fontSize;
    }
    public set fontSize(v){
        this._fontSize=v;
        this.render();
    }
    public get align():string{
        return this._align;
    }
    public set align(v){
        this._align=v;
        this.render();
    }
    public get spacing():number{
        return this._spacing;
    }
    public set spacing(v){
        this._spacing=v;
        this.render();
    }
    public get leading():number{
        return this._leading;
    }
    public set leading(v){
        this._leading=v;
        this.render();
    }
    public get text():string{
        return this._text;
    }
    public set text(v){
        this._text=v;
        this.render();
    }
    private toSign(s:string){
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
    public render(){
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
}