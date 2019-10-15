DreamJs开发框架
========
### 简介 ###

DreamJs是一个H5和小游戏的开发框架。其特点是建立了两级架构，底层可以选择不同的图形渲染引擎，在上层统一接口，再提供给开发者使用。

目前小游戏发展得非常迅猛，已形成不可阻挡之势。众多的开发框架应运而生，竞争非常激烈，一旦择之不慎，会造成极为被动的局面。

其实各开发框架的着力点，均在图形渲染上，我们只要把这个部分独立出来，做成可替换的部件，就可以避免被框架大战所伤害，这也正是DreamJs的使命所在。

DreamJs是一套完整实用的开发体系，除了图形渲染需要借助其他框架之外，在此之上的UI和动画，以及时间、事件、声音和网络等都自主实现，并且做好了桌面浏览器、手机浏览器和各小游戏平台的兼容。

简单是美，简单才能走得更远。DreamJs一直在追求极简的发展道路，每一行代码都经过千锤百炼，每一个接口都经过反复推敲，力求达到更完美的功能，而只需要最少的代码。

对Dom的支持只使用了一个文件，core-dom.js，只有355行。dream层是公共的，包括了形形色色的内容，目前代码也不过1500多行而已。

这就意味着，DreamJs本身是改得动的，如果使用过程中发现了问题，即使不经过原作者，也能自行解决。

### 实例 ###

[精灵测试](http://dreamjs8.com/examples/sprite-test) [源码](http://dreamjs8.com/downloads/examples/sprite-test.zip)

[打飞机](http://dreamjs8.com/examples/plane) [源码](http://dreamjs8.com/downloads/examples/plane.zip)

### 开发环境 ###

#### 需要的工具 ####

编写web程序，vscode是我们的不二选择。它推出后，天下为之一振，很快终结了持续多年的编辑器之争。

[下载vscode](https://code.visualstudio.com)

Electron结合了Chromium和NodeJs，让web程序真正具有桌面应用功能，加持到vscode上，效果让人叫绝。我们用它来实现编译ts、运行程序和开发辅助工具。

[下载Electron(win)](http://dreamjs8.com/downloads/electron-win.zip) 58.12M

[下载Electron(mac)](http://dreamjs8.com/downloads/electron-mac.zip) 48.27M

#### 运行项目 ####

1.下载hello项目到本地，然后用vscode打开。

2.编辑项目中的.vscode/launch.json，修改runtimeExecutable参数为正确的Electron运行包路径。

3.执行菜单Debug->Start Without Debugging，就能看到运行结果了。

### 架构说明 ###

#### core层 ####

core层的目的是实现2d精灵类，精灵具有显示对象的基本特性。可以改变位置大小，可以缩放旋转，还能添加其他精灵。

另外，精灵类实现了改变背景色，绘制图像和文字的功能。

下面是使用精灵类做的一个测试，运行效果是在页面上显示一个绿色的方块。

```html
<script src="js/core-dom.js"></script>
<script>
var stage=new Sprite();
stage.initAsStage();
var sprite=new Sprite();
stage.addChild(sprite);
sprite.width=sprite.height=100;
sprite.setBgColor("#00d000");
Core.render();
</script>
```

以上实例是基于Dom框架来实现的，如果想换一个渲染方式，那再容易不过了，只要把第一行改成这样：

```html
<script src="js/three/three.js"></script>
<script src="js/core-three.js"></script>
```

#### dream层 ####

有了core层的基础，就可以打造一个用于实际开发的dream层了。

dream层先把Sprite扩展成更加完善的Box类，然后再细分出专门的图像类、文本类、按钮类以及其他的UI类。

3D方面的功能，DreamJs目前不进行封装，开发者可以直接调用各底层框架接口。

图形处理之外的功能，例如时间管理、触摸事件和声音效果等，是在dream层去实现的，且也会实现对各运行平台的兼容。

这样就避免了对core层的过度依赖，从而有效简化了core层的结构。

### HelloWorld ###

DreamJs的代码风格借鉴了曾经的页游老大哥Flash AS3，从Main.ts类开始展开功能。

```typescript
class Main extends Box{
    public static aspect=1;
    constructor(){
        super();
        var label=this.addChild(new Label()) as Label;
        label.setPos(100,100);
        label.fontSize=50;
        label.color="#00c000";
        label.text="Hello,world";
    }
}
```

### 支持的图形框架 ###

#### Dom ####

Dom渲染对各浏览器的兼容最好，文本显示性能最佳，永远是做网站的首选。

即使只是为了尊重传统，也应该支持Dom渲染，不过用DreamJs还能做到更多。

前端的工作总免不了做些和网站相关的东西，但是去使用div+css，还有原始形态的js，那绝对另游戏开发者痛不欲生。

我们完全可以用DreamJs来把网页当游戏开发，只需使用熟悉的ts，用熟悉的开发规则实现页面布局，加入各种行云流水的功能，完全没有压力。

由于生成的还是Dom结构，所以能直接调用Dom的底层接口，比如设置cssText，改变innerHTML等，来增强页面效果。

个人感觉Dom模式比较适合开发动态网站和在线工具。

#### ThreeJs ####

现在3D小游戏已形成主流，而ThreeJs公认是功能最强大的框架，但他也有很明显的软肋。

ThreeJs的2D功能完全是一片空白，大家一般使用Dom来将就做配套的UI，而众所周知，小游戏是不支持Dom的。

这就导致了目前ThreeJs主要用于3D功能展示上，在游戏开发上不愠不火，即使有也是UI极少的那种。

DreamJs为ThreeJs弥补了2D部分的不足，不管是做UI还是2D游戏，都易如反掌。再加上其自身3D部分的口碑，前景非常具有想象力。

很可惜ThreeJs目前还没有专门的团队去推进在小游戏方面的发展，真心期待能有敢吃螃蟹的人出现，本作者一定倾力支持。

#### LayaBox ####

我一直认为LayaBox是flash页游的真正传人，而它的发展也不负重望，成功占据了3D小游戏的制高点。

虽然LayaBox已经足够优秀，但是它也有自身的发展问题，据说他们还在奋力去flash，去canvas，2.0版本开发了一年多，其实这是不足为奇的。

负重前进，只会越来越慢。做框架就要敢无数次打烂重来，但当你的框架已经是线上模式的时候，你还敢挥手吗？

DreamJs能够做到，因为它走的是简化路线，代码少，改得动，而且潜伏期已经超长了。

它能为LayaBox提供的，是更易用的规则和接口，和可以让上层开发者涉足底层的机会。

### 作者 ###

呢称：兴祥

微信：flashxcom

愿景：将代码简化到底