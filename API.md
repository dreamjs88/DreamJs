API
========
### Core ###

Core是底层适配类，可以通过更换Core类来改变图形渲染机制。

#### 静态属性方法 ####

```typescript
Core.rootDiv:Object; //舞台所在的根div
Core.rootX:number; //非全屏时的窗口x坐标
Core.rootY:number; //非全屏时的窗口y坐标
Core.stageScale:number; //屏幕适配的缩放值
Core.textureHash; //纹理hash

Core.getTouchTarget(target:Object,x:number,y:number):Object; //获得触屏目标
Core.loadTexture(url:string,caller:Object,func:Function); //加载纹理
Core.showStat(); //显示运行状态
Core.render(); //全局渲染
```

### Sprite ###

Sprite是底层图形精灵，是Box类的基础。

#### 属性方法 ####

```typescript
alpha:number; //透明度
cropped:bool; //是否裁切
enabled:bool; //是否可触摸
gray:bool; //是否灰度
height:number; //高度
rotation:number; //旋转度
scaleX:number; //缩放x
scaleY:number; //缩放y
pivotX:number; //轴心x
pivotY:number; //轴心y
visible:bool; //是否可见
width:number; //宽度
x:number; //x坐标
y:number; //y坐标

addChild(child:Sprite):Sprite; //添加子对象
drawImage(url:string,width:number,height:number,baseTexW:number,baseTexH:number,
    texX:number,texY:number,texW:number,texH:number);
//绘制图像
drawText(text:string,color:string,fontSize:number,width:number,align:string,
    spacing:number,leading:number);
//绘制文本
initAsStage(aspect:number); //初始化为舞台
    //aspect:0-无缩放 1-竖屏 2-横屏
removeSelf(); //移除自身
setBgColor(color:string); //设置背景色
```