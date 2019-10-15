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

### window扩展 ###

为了编码方便，加入了一些顶级方法。

```typescript
call(foo,...otherArgs); //调用方法
    //foo格式：[caller,func,...args]
    //otherArgs会附加到foo数组里
int(v:any):number; //转换成整数
trace(...texts); //输出参数
```

### Dream ###

框架全局类。

```typescript
Dream.height:number; //舞台高
Dream.isWeb; //是否web环境
Dream.isMobile; //是否移动环境
Dream.isIPhone; //是否iphone
Dream.main:Main; //主显示对象
Dream.scale:number; //舞台缩放值
Dream.stage:Box; //舞台对象
Dream.userAgent:string; //终端参数
Dream.width:number; //舞台宽
Dream.wx; //微信小游戏对象
```

### Timer ###

时间管理类。

```typescript
Timer.interval:number; //与上一桢的间隔
Timer.now:number; //程序运行到现在的毫秒数
Timer.scale:number; //因为桢率不稳定而导致的时间缩放
Timer.items:any[]; //时间运行队列

Timer.addLate(foo:any[],time=0,autoClear=true); //延迟执行方法
    //autoClear：是否在caller为显示对象并被移除出舞台时清除
Timer.addLoop(foo:any[],autoClear=true); //逐桢执行方法
    //autoClear：是否在caller为显示对象并被移除出舞台时清除
```

### TouchEvt ###

触摸事件类。

当显示对象被触摸时，将会向上冒泡执行特定名称方法。

按下事件：box.onTouchStart(evt)

移动事件：box.onTouchMove(evt)

抬起事件：box.onTouchEnd(evt)

点击事件：box.onClick(evt)

按钮点击事件：box.onButtonClick(evt)

```typescript
TouchEvt.self:TouchEvt; //触摸事件单例

pressX:number; //按下时的x值
pressY:number; //按下时的y值
target:Box; //按下时的目标
x:number; //触摸x
y:number; //触摸y
```

### Box ###

继承自Sprite。

容器类，其他显示类均以它为基础。

```typescript
bgColor:string //背景颜色
margins:number[] //在Roll对象中的相对定位间距
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

### Label ###

继承自Box。

用于显示文本。

如果设置了字体，将会启用图片字体模式，系统会从img/font/myfont文件夹中取到字符图片来组成文本。

```typescript
align:string; //对齐方式
color:string; //颜色
font:string; //字体
fontSize:number; //字体大小
leading:number; //行间距
spacing:number; //字体间距
text:string; //文本内容
```

### Button ###

继承自Box。

用于处理按钮功能。

按钮的基础是一张图片，如果系统中存在另一张加了后缀@的图片，按钮就会自动变成两态按钮。

```typescript
delay:bool; //是否延迟
    //默认在移动环境下延迟
src:string; //按钮图片路径
zoom:bool; //是否在点击时缩放

render(); //渲染
    //在添加子对象后需要调用该方法
```

### ImgClip ###

继承自Img。

用于播放序列桢动画。

src路径必须有从1开始的序列桢图片，例如：

boom/1.png boom/2.png ...

hero/walk-1.png hero/walk-2.png ...

```typescript
playing:bool; //是否正在播放
duration:number; //桢间隔时间
loop:bool; //是否循环

play(doEnd?:any[]); //播放
    //doEnd：播放结束时的回调
```

### Roll ###

继承自Box。

用于滚动对象。

```typescript
relative:bool; //是否相对定位
scroll:number; //滚动值
scrollMax:number; //最大滚动值

render(); //渲染
    //在修改内容后需要调用该方法
```

### Tween ###

缓动类。

```typescript
Tween.to(target:Box,props:any,time=200,ease?:any,wait=0); //对象缓动
Tween.toPath(target:Box,path:any[],time=200,ease?:any,wait=0); //对象按路径缓动
```

### Ease ###

缓动方式类。

与传统做法稍有不同，b参数仍然是开始值，而c参数调整为目的值。

```typescript
Ease.backIn(t:number,b:number,c:number,d:number,s=1.70158):number; //回退淡入
Ease.backOut(t:number,b:number,c:number,d:number,s=1.70158):number; //回退淡出
Ease.linear(t:number,b:number,c:number,d:number):number; //线性移动
Ease.strongIn(t:number,b:number,c:number,d:number):number; //加强淡入
Ease.strongOut(t:number,b:number,c:number,d:number):number; //加强淡出
```

### Math2 ###

Math增强类。

增加了一些常用的算法。

```typescript
Math2.distance(x1:number,y1:number,x2:number,y2:number):number; //两点间距离
Math2.createGuid(); //生成唯一识别码
Math2.angle(x1:number,y1:number,x2:number,y2:number); //两点间角度
Math2.getParabolaPath(x1:number,y1:number,x2:number,y2:number,a=1):number; //生成抛物线
Math2.getParabolaPath2(x:number,y:number,angle:number,v:number,g:number):number; //生成抛物线2
```

### Sound ###

声音类。

以Audio为基础进行扩展。

```typescript
Sound.play(src:string); //播放声音

currentTime:number; //当前播放时间
duration:number; //总时长
muted:bool; //是否静音
src:string; //声音文件路径

play(); //播放
pause(); //暂停
load(src:string,doLoading:any[]); //加载
```

### IO ###

输入输出类。

```typescript
IO.readFile(url:string):string; //读取文件
IO.writeFile(url:string,text:string); //写入文件(小游戏)
IO.getStorage(key:string):string; //获得storage
IO.setStorage(key:string,value:string); //设置storage
IO.showStat(); //显示运行状态
```

### Shell ###

桌面应用功能类。

在Electron运行模式下，使用本类可与桌面环境交互。

```typescript
Shell.createFolder(path:string); //创建文件夹
Shell.createServer(); //创建web服务器
Shell.copyFile(path:string,toPath:string); //拷贝文件
Shell.copyFolder(path:string,toPath:string); //拷贝文件夹
Shell.deleteFile(path:string); //删除文件夹
Shell.deleteFolder(path:string); //删除文件夹
Shell.getFileSize(path:string):number; //获得文件大小
Shell.getSubDir(path:string):string[]; //获得文件夹子列表
Shell.readExcel(path:string,tab=0); //读取excel
Shell.readFile(path:string):string; //读取文件
Shell.writeFile(path:string,text:string); //写入文件
Shell.zipFolder(path:string,toPath:string); //打包文件夹
```