API
========
### Core ###

Core是底层对接类，用于对接其他的图形引擎。

```typescript
Core.rootDiv:Object; //舞台所在的根div
Core.rootX:number; //非全屏时的窗口x坐标
Core.rootY:number; //非全屏时的窗口y坐标
Core.textureHash; //纹理hash

Core.getTouchTarget(target:Object,x:number,y:number):Object; //获得触屏目标
Core.initSprite(); //初始化精灵类
Core.loadTexture(url:string,caller:Object,func:Function); //加载纹理
Core.showStat(); //显示运行状态
Core.render(); //全局渲染
```

### Sprite ###

Sprite是图形精灵类，在Core中编写，不直接使用，是Box类的基础。

```typescript
alpha:number; //透明度
children:Sprite[]; //子对象数组
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
    texX:number,texY:number,texW:number,texH:number); //绘制图像
drawText(text:string,color:string,fontSize:number,width:number,align:string,
    spacing:number,leading:number); //绘制文本
initAsStage(aspect:number):number; //初始化为舞台
    //aspect:0-无缩放 1-竖屏 2-横屏
removeSelf(); //移除自身
setBgColor(color:string); //设置背景色
```

### Box ###

继承自Sprite。

容器类，其他显示类均以它为基础。

```typescript
bgColor:string //背景颜色
scale:number; //缩放值

addUI(); //添加UI
contains(child:Box):bool; //是否包含对象
dispatch(evt:Object); //冒泡派发事件
getChild(name:string):Box //通过name获得子孙对象
removeChildren(); //移除所有子对象
setPos(x:any,y:any); //设置位置
    //x关键字:c-居中 r-居右
    //y关键字:c-居中 r-居下
setSize(w:any,h:any); //设置尺寸
    //宽高关键字:f-充满父对象
```

### Img ###

继承自Box。

用于显示图片。

DreamJs中的图片自动打包图集，规则如下：

1.如果文件夹中有空的pack目录，则会对里面的所有图片进行裁切打包。

2.其他图片如果宽高均小于256，将会打包到默认图集。

```typescript
Img.load(url:string,target?:any); //加载纹理
    //target可以是渲染对象，也可以是回调方法

src:string; //图片路径
    //默认路径基于img目录，如要调用其他目录的图片，使用./关键字
```