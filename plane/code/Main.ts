class Main extends Box{
    public static aspect=1;

    private bgScroll=0;
    private fireCd=0;
    private enemyCd=0;
    
    private map:Box;
    private bg:Box;
    private hero:Img;
    private scoreLabel:Label;
    private bgm:Sound;
    
    constructor(){
        super();
        Dream.stage.bgColor="#000000";
        Shell.preload([this,this.init],"#ffffff");
    }
    //初始化
    private init(){
        this.addUI([
            [{e:Box,dim:"map",size:"f"},
                [{e:Box,dim:"bg",size:"f"},
                    {e:Img,src:"bg.jpg"},
                    {e:Img,src:"bg.jpg"},
                    {e:Img,src:"bg.jpg"},
                ],
                {e:Img,dim:"hero",name:"hero",enabled:true,src:"hero.png",pivot:[93,65]},
            ],
            {e:Label,dim:"scoreLabel",text:"0",font:"a",pos:[30,25],scale:1.5},
        ]);
        this.bgm=Sound.play("bgm",true);
        this.start();
        Timer.addLoop([this,this.onEnterFrame]);
    }
    //游戏开始
    private start(){
        this.bgm.play();
        this.fireCd=0;
        this.enemyCd=0;
        this.scoreLabel.text="0";
        //重置地图
        this.map.removeChildren();
        this.map.addChild(this.bg);
        this.map.addChild(this.hero);
        this.hero.setPos(320,this.height-150);
    }
    //运行敌机逻辑
    private playEnemy(){
        this.enemyCd+=17;
        //定时生成敌机
        if(this.enemyCd>=800){
            this.enemyCd=0;
            var x=int(Math.random()*560)+40;
            this.map.addUI([
                {e:Img,name:"enemy",pool:"enemy",id:0,alpha:1,src:"enemy.png",pivot:[60,40],pos:[x,-50]}
            ]);
        }
        //让敌机飞行
        for(var i=0;i<this.map.children.length;i++){
            var enemy=this.map.children[i];
            if(enemy.name!="enemy") continue;
            if(enemy.id==-1){
                enemy.removeSelf();
                i--;
                continue;
            }
            enemy.y+=10*Timer.scale;
            //敌机飞出屏幕则移除
            if(enemy.y>this.height+50) enemy.id=-1;
            //敌机撞上我机游戏失败
            var hero=this.checkHit(enemy,"hero");
            if(!hero) continue;
            Sound.play("boom");
            var boom=this.map.addUI([
                {e:ImgClip,src:"boom-1.png",duration:35,pos:[hero.x,hero.y-20],pivot:[32,24],scale:3}
            ]) as ImgClip;
            boom.play([boom,boom.removeSelf]);
            this.playLose();
        }
    }
    //运行开火逻辑
    private playFire(){
        //如果按下则定时生成子弹
        if(TouchEvt.self.target==this.hero) this.fireCd+=17;
        if(this.fireCd>=300){
            Sound.play("fire");
            this.fireCd=0;
            this.map.addUI([
                {e:Img,src:"bullet.png",pool:"bullet",name:"bullet",pivot:[31,36],x:this.hero.x,y:this.hero.y-90}
            ]);
        }
        //让子弹飞行
        for(var i=0;i<this.map.children.length;i++){
            var bullet=this.map.children[i];
            if(bullet.name!="bullet") continue;
            bullet.y-=30*Timer.scale;
            if(bullet.y<-100){
                bullet.removeSelf();
                i--;
                continue;
            }
            //子弹击落敌机
            var enemy=this.checkHit(bullet,"enemy");
            if(!enemy) continue;
            Sound.play("boom")
            bullet.removeSelf();
            i--;
            enemy.id=-1;
            var boom=this.map.addUI([
                {e:ImgClip,src:"boom-1.png",duration:35,pos:[enemy.x,enemy.y+50],pivot:[32,24],scale:3}
            ]) as ImgClip;
            boom.play([boom,boom.removeSelf]);
            this.scoreLabel.text=String(parseInt(this.scoreLabel.text)+1);
        }
    }
    //运行背景移动逻辑
    private playBg(){
        //用三张图来无尽移动背景
        this.bg.children[0].y=this.bgScroll-640;
        this.bg.children[1].y=this.bgScroll;
        this.bg.children[2].y=this.bgScroll+640;
        this.bgScroll+=3*Timer.scale;
        if(this.bgScroll>640) this.bgScroll=0;
    }
    //运行失败逻辑
    private playLose(){
        this.bgm.pause();
        this.bgm.currentTime=0;
        Dlg.start("Your lose!",[this,this.start]);
    }
    //检测撞上某一类物体
    private checkHit(hitter:Box,type:string){
        for(var i=0;i<this.map.children.length;i++){
            var target=this.map.children[i];
            if(target.name!=type) continue;
            if(target.id==-1) continue;
            //通过距离判断相撞
            var range=type=="hero"?100:60;
            var distance=Math.sqrt(Math.pow(target.x-hitter.x,2)+Math.pow(target.y-hitter.y,2));
            if(distance<range) return target;
        }
        return null;
    }
    //移动事件
    private onTouchMove(evt:TouchEvt){
        if(Dlg.self&&Dlg.self.parent) return;
        if(evt.target==this.hero){
            this.hero.setPos(evt.x,evt.y);
        }
    }
    //逐桢运行函数
    private onEnterFrame(){
        if(Dlg.self&&Dlg.self.parent) return;
        this.playBg();
        this.playFire();
        this.playEnemy();
    }
}