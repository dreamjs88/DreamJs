DreamJs开发框架
========
#### 简介 ####

DreamJs是一个H5和小游戏的开发框架。其特点是建立了两级架构，底层可以选择不同的图形渲染框架，在上层统一接口，再提供给开发者使用。

目前小游戏发展得非常迅猛，已形成不可阻挡之势。众多的开发框架应运而生，竞争非常激烈，一旦择之不慎，会造成极为被动的局面。

其实各开发框架的着力点，均在图形渲染上，我们只要把这个部分独立出来，做成可替换的部件，就可以避免被框架大战所伤害，这也正是DreamJs的使命所在。

Dom是网页的基础，虽然没有3D功能，也无法在小游戏中运行，但对于这样一个源远流长的祖传架构，不支持是不可能的。

现在3D小游戏已经形成主流，LayaBox占据了大部分的市场份额，ThreeJs虽然功能更强大，但主要还是针对功能展示领域，所以DreamJs对它们都进行了支持。

DreamJs是一个完整的开发体系，包括编译ts、打包图集、运行程序和适配小游戏，都做了充足的功课。

简单是美，简单才能走得更远。DreamJs一直在追求极简的发展道路，每一行代码都经过千锤百炼。

对Dom的支持只使用了一个文件，代码量少到355行。而对Threejs的支持，也只不过用到了531行代码而已。

这就意味着，DreamJs本身是改得动的，如果使用过程中发现了问题，即使不经过原作者，也能自行解决。

#### 实例 ####

[打飞机](http://dreamjs8.com/examples/plane) [源码](http://dreamjs8.com/downloads/examples/plane.zip)

[精灵测试](http://dreamjs8.com/examples/sprite-test) [源码](http://dreamjs8.com/downloads/examples/sprite-test.zip)

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

再铺之以时间管理、触摸事件和声音功能等，这样一个完整的游戏开发体系就呼之欲出了。

#### 开发环境 ####

### 需要的工具 ###

编写web程序，vscode是我们的不二选择。它推出后，天下为之一振，很快终结了持续多年的编辑器之争。

[下载vscode](https://code.visualstudio.com)

Electron结合了Chromium和NodeJs，让web程序真正具有桌面应用功能，加持到vscode上，效果让人叫绝。我们用它来实现编译ts、运行程序和开发辅助工具。

[下载Electron(win)](http://dreamjs8.com/downloads/electron-win.zip) [下载Electron(mac)](http://dreamjs8.com/downloads/electron-win.zip)

### 运行项目 ###

1.由于Electron运行包位置不同，所以下载的项目需要手动改路径。请打开项目中的.vscode/launch.json，修改runtimeExecutable参数到正确的路径。

2.执行菜单Debug->Start Without Debugging，就能看到运行结果了。

