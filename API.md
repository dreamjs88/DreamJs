API
========
### Core ###

#### 静态属性方法 ####

```typescript
Core.rootDiv:Object //舞台所在的根div
Core.rootX:number //非全屏时的窗口x坐标
Core.rootY:number //非全屏时的窗口y坐标
Core.stageScale:number //屏幕适配的缩放值
Core.textureHash //纹理hash

Core.getTouchTarget(target:HTMLElement,x:number,y:number):Object //获得触屏目标
```