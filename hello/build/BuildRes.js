(function(){
    window.BuildRes={};
    BuildRes.funcBack;
    BuildRes.imgPath;
    BuildRes.binImgPath;
    BuildRes.fontPath;
    BuildRes.oldItems=[];
    BuildRes.oldHash={};
    BuildRes.resItems=[];
    BuildRes.resHash={};
    BuildRes.fileItems=[];
    BuildRes.packItems=[];
    BuildRes.packIndex=0;
    BuildRes.caseItems=[];
    BuildRes.caseHash={};
    BuildRes.imageHash={};
    BuildRes.canvas;

    BuildRes.caseWidth=0;
    BuildRes.caseHeight=0;
    BuildRes.rects;
    BuildRes.usedRects;
    BuildRes.freeRects;

    BuildRes.start=function(funcBack){
        BuildRes.funcBack=funcBack;
        BuildRes.run();
    }
    BuildRes.run=function(step){
        if(!step){
            BuildRes.prepare();
        }
        else if(step==1){
            BuildRes.pack();
        }
        else if(step==2){
            BuildRes.finish();
        }
        else if(step==3){
            BuildRes.funcBack();
        }
    }
    BuildRes.prepare=function(){
        BuildRes.imgPath=Build.path+"img/";
        BuildRes.binImgPath=Build.path+"bin/img/";
        BuildRes.fontPath=Build.path+"img/font/";

        BuildRes.canvas=document.createElement("canvas");

        if(!Build.fs.existsSync(BuildRes.binImgPath)){
            Build.fs.mkdirSync(BuildRes.binImgPath);
        }

        BuildRes.makeFont();

        if(Build.fs.existsSync(BuildRes.binImgPath+"-pack.json")){
            var text=Build.fs.readFileSync(BuildRes.binImgPath+"-pack.json")+"";
            BuildRes.oldItems=JSON.parse(text);
            for(var i=0;i<BuildRes.oldItems.length;i++){
                var resArr=BuildRes.oldItems[i];
                BuildRes.oldHash[resArr[0]]=resArr;
            }
        }
        var queues=[""];
        while(queues.length>0){
            var queue=queues.shift();
            var files=Build.fs.readdirSync(BuildRes.imgPath+queue);
            for(var i=0;i<files.length;i++){
                var file=files[i]+"";
                var url=queue+file;
                var stat=Build.fs.statSync(BuildRes.imgPath+url);
                if(stat.isDirectory()){
                    size=0;
                    queues.push(url+"/");
                    if(file=="-pack"&&queue!="") BuildRes.packItems.push(queue);
                    continue;
                }
                if(!file.match(/\.(png|jpg)$/)) continue;
                var size=stat.size;
                var oldArr=BuildRes.oldHash[url];
                var width=oldArr&&oldArr[1]==size?oldArr[2]:0;
                var height=oldArr&&oldArr[1]==size?oldArr[3]:0;
                var fileArr=[url,stat.size,width,height];
                BuildRes.fileItems.push(fileArr);
            }
        }
        BuildRes.packItems.push("");
        BuildRes.run(1);
    }
    BuildRes.makeFont=function(){
        if(!Build.fs.existsSync(BuildRes.fontPath)){
            return;
        }
        var canvas=BuildRes.canvas;
        var ctx=canvas.getContext("2d");
        var folders=Build.fs.readdirSync(BuildRes.fontPath);
        for(var i=0;i<folders.length;i++){
            var folder=folders[i]+"";
            var stat=Build.fs.statSync(BuildRes.fontPath);
            if(!stat.isDirectory()) continue;
            var url=BuildRes.fontPath+folder+"/-.txt";
            if(!Build.fs.existsSync(url)) continue;
            var text=Build.fs.readFileSync(url)+"";
            var arr=text.replace(/\r/g,"").split("\n");
            var params=null;
            try{params=JSON.parse(arr[0]);}catch(e){}
            if(!params||params.length!=3) continue;

            var files=Build.fs.readdirSync(BuildRes.fontPath+folder);
            for(var j=0;j<files.length;j++){
                var file=files[j]+"";
                if(!file.match(/\.png$/)) continue;
                Build.fs.unlinkSync(BuildRes.fontPath+folder+"/"+file);
            }

            ctx.font=params[1]+"px "+params[0];
            text=arr.slice(1).join("");
            for(var j=0;j<text.length;j++){
                var s=text.charAt(j);
                var w=ctx.measureText(s).width+2;
                var h=parseInt(params[1]*1.3);
                canvas.width=w;
                canvas.height=h;
                ctx.font=params[1]+"px "+params[0];
                ctx.fillStyle=params[2];
                ctx.fillText(s,1,params[1]);
                var nimg=Build.electron.nativeImage.createFromDataURL(canvas.toDataURL());
                var url2=BuildRes.fontPath+folder+"/"+BuildRes.toSign(s)+".png";
                Build.fs.writeFileSync(url2,nimg.toPNG());
            }
        }
    }
    BuildRes.finish=function(){
        for(var i=0;i<BuildRes.fileItems.length;i++){
            var fileArr=BuildRes.fileItems[i];
            var url=fileArr[0];
            var size=fileArr[1];
            if(BuildRes.resHash[url]) continue;
            var ignore=false;
            var oldArr=BuildRes.oldHash[url];
            if(oldArr&&oldArr[1]==size) ignore=true;
            var toUrl=url.replace(/\//g,"-");
            if(!Build.fs.existsSync(BuildRes.binImgPath+toUrl)) ignore=false;
            var width=!oldArr?0:oldArr[2];
            var height=!oldArr?0:oldArr[3];
            if(!ignore){
                var nimg=Build.electron.nativeImage.createFromPath(BuildRes.imgPath+url);
                var imgSize=nimg.getSize();
                width=imgSize.width;
                height=imgSize.height;
                var bytes=Build.fs.readFileSync(BuildRes.imgPath+url);
                Build.fs.writeFileSync(BuildRes.binImgPath+toUrl,bytes);
            }
            var resArr=[url,size,width,height];
            BuildRes.resHash[url]=resArr;
            BuildRes.resItems.push(resArr);
        }
        var existHash={};
        for(var i=0;i<BuildRes.resItems.length;i++){
            var resArr=BuildRes.resItems[i];
            var url=resArr[0];
            url=url.replace(/\//g,"-");
            existHash[url]=true;
        }
        var files=Build.fs.readdirSync(BuildRes.binImgPath);
        for(var i=0;i<files.length;i++){
            var file=files[i]+"";
            if(!existHash[file]){
                Build.fs.unlinkSync(BuildRes.binImgPath+file);
            }
        }
        var text=JSON.stringify(BuildRes.resItems);
        Build.fs.writeFileSync(BuildRes.binImgPath+"-pack.json",text);
        BuildRes.run(3);
    }
    BuildRes.pack=function(){
        if(BuildRes.packIndex>=BuildRes.packItems.length){
            BuildRes.packOk();
            return;
        }
        var path=BuildRes.packItems[BuildRes.packIndex];
        var compareText="";
        for(var i=0;i<BuildRes.oldItems.length;i++){
            var arr=BuildRes.oldItems[i];
            var url=arr[0];
            if(url.indexOf(path)!=0) continue;
            if(path!=""&&arr.length!=10) continue;
            if(path==""&&arr.length!=6) continue;
            compareText+=url+","+arr[1]+",";
        }
        var url=path==""?"-pack.png":"-pack-"+path.slice(0,-1).replace(/\//g,"-")+".png";
        if(!Build.fs.existsSync(BuildRes.binImgPath+url)) compareText="";
        BuildRes.caseItems=[];
        var compareText2="";
        for(var i=0;i<BuildRes.fileItems.length;i++){
            var arr=BuildRes.fileItems[i];
            var url=arr[0];
            if(url.indexOf(path)!=0) continue;
            if(!url.match(/\.png$/)) continue;
            if(BuildRes.caseHash[url]) continue;
            var size=arr[1];
            var width=arr[2];
            var height=arr[3];
            if(path==""&&width==0){
                var nimg=Build.electron.nativeImage.createFromPath(BuildRes.imgPath+url);
                var imgSize=nimg.getSize();
                width=imgSize.width;
                height=imgSize.height;
            }
            if(path==""&&(width>256||height>256)) continue;
            var caseArr=[url,size,width,height,0,0];
            BuildRes.caseItems.push(caseArr);

            compareText2+=url+","+size+",";
        }
        if(compareText==compareText2){
            for(var i=0;i<BuildRes.caseItems.length;i++){
                var caseArr=BuildRes.caseItems[i];
                var url=caseArr[0];
                var oldArr=BuildRes.oldHash[url];
                BuildRes.caseItems[i]=BuildRes.caseHash[url]=oldArr.slice(0);
            }
            BuildRes.pack3();
            return;
        }
        for(var i=0;i<BuildRes.caseItems.length;i++){
            var caseArr=BuildRes.caseItems[i];
            var url=caseArr[0];
            BuildRes.caseHash[url]=caseArr;
            var size=caseArr[1];
            var width=caseArr[2];
            var height=caseArr[3];
            var nimg=null;
            if(width==0){
                nimg=Build.electron.nativeImage.createFromPath(BuildRes.imgPath+url);
                var imgSize=nimg.getSize();
                width=caseArr[2]=imgSize.width;
                height=caseArr[3]=imgSize.height;
            }
            var image=document.createElement("img");
            BuildRes.imageHash[url]=image;
            image.src=BuildRes.imgPath+url;
            if(path==""){
                continue;
            }
            var oldArr=BuildRes.oldHash[url];
            if(oldArr&&oldArr.length==10&&oldArr[1]==size){
                caseArr[6]=oldArr[6];
                caseArr[7]=oldArr[7];
                caseArr[8]=oldArr[8];
                caseArr[9]=oldArr[9];
                continue;
            }
            if(!nimg) nimg=Build.electron.nativeImage.createFromPath(BuildRes.imgPath+url);
            var bmp=nimg.getBitmap();
            var left=width;
            var top=height;
            var right=0;
            var bottom=0;
            for(var j=0;j<bmp.length;j+=4){
                var x=(j/4)%width;
                var y=Math.floor((j/4)/width);
                if(bmp[j+3]!=0){
                    left=Math.min(left,x);
                    top=Math.min(top,y);
                    right=Math.max(right,x);
                    bottom=Math.max(bottom,y);
                }
            }
            if(right==0||bottom==0){
                left=0;
                top=0;
                right=Math.min(width,10);
                bottom=Math.min(height,10);
            }
            var solidW=Math.max(right-left+1,0);
            var solidH=Math.max(bottom-top+1,0);
            caseArr[6]=solidW;
            caseArr[7]=solidH;
            caseArr[8]=left;
            caseArr[9]=top;
        }
        BuildRes.encase(BuildRes.caseItems);
        setTimeout(BuildRes.pack2,100);
    }
    BuildRes.pack2=function(){
        var isLoadAll=true;
        for(var i=0;i<BuildRes.caseItems.length;i++){
            var caseArr=BuildRes.caseItems[i];
            var url=caseArr[0];
            var image=BuildRes.imageHash[url];
            if(image.width==0){
                isLoadAll=false;
            }
        }
        if(!isLoadAll){
            setTimeout(BuildRes.makePlist2,100);
            return;
        }
        var path=BuildRes.packItems[BuildRes.packIndex];
        var canvas=BuildRes.canvas;
        var ctx=canvas.getContext("2d");
        canvas.width=BuildRes.caseWidth;
        canvas.height=BuildRes.caseHeight;
        for(var i=0;i<BuildRes.caseItems.length;i++){
            var caseArr=BuildRes.caseItems[i];
            var url=caseArr[0];
            var image=BuildRes.imageHash[url];
            var p=caseArr;
            if(caseArr.length==6){
                ctx.drawImage(image,0,0,p[2],p[3],p[4],p[5],p[2],p[3]);
            }
            else{
                ctx.drawImage(image,p[8],p[9],p[6],p[7],p[4],p[5],p[6],p[7]);
            }
        }
        var nimg=Build.electron.nativeImage.createFromDataURL(canvas.toDataURL());
        var toUrl="-pack.png";
        if(path!="") toUrl="-pack-"+path.slice(0,-1).replace(/\//g,"-")+".png";
        Build.fs.writeFileSync(BuildRes.binImgPath+toUrl,nimg.toPNG());

        BuildRes.pack3();
    }
    BuildRes.pack3=function(){
        for(var i=0;i<BuildRes.caseItems.length;i++){
            var caseArr=BuildRes.caseItems[i];
            var url=caseArr[0];
            BuildRes.resItems.push(caseArr);
            BuildRes.resHash[url]=caseArr;
        }
        BuildRes.caseItems.length=0;
        BuildRes.packIndex++;
        BuildRes.pack();
    }
    BuildRes.packOk=function(){
        var files=Build.fs.readdirSync(BuildRes.binImgPath);
        for(var i=0;i<files.length;i++){
            var file=files[i]+"";
            if(!file.match(/\-pack\b.*\.png$/)) continue;
            var stat=Build.fs.statSync(BuildRes.binImgPath+file);
            var resArr=[file,stat.size];
            BuildRes.resItems.splice(0,0,resArr);
            BuildRes.resHash[resArr[0]]=resArr;
        }
        BuildRes.run(2);
    }
    BuildRes.toSign=function(s){
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
    BuildRes.encase=function(items){
        var sizes=[
            [128,128],[256,128],[256,256],[512,256],[512,512],[512,1024],
            [1024,1024],[1024,2048],[2048,2048],[2048,4096],[4096,4096]
        ];
        for(var i=0;i<sizes.length;i++){
            BuildRes.caseWidth=sizes[i][0];
            BuildRes.caseHeight=sizes[i][1];
            BuildRes.usedRects=[];
            BuildRes.freeRects=[[0,0,BuildRes.caseWidth,BuildRes.caseHeight]];
            BuildRes.rects=[];
            for(var j=0;j<items.length;j++){
                var arr=items[j];
                var w=arr[arr.length<=6?2:6];
                var h=arr[arr.length<=6?3:7];
                var rect=BuildRes.addRect(w+2,h+2);
                if(!rect){
                    if(BuildRes.caseWidth<2048||BuildRes.caseHeight<2048) BuildRes.rects=null;
                    break;
                }
                BuildRes.rects.push(rect);
            }
            if(BuildRes.rects) break;
        }
        for(var i=0;i<items.length;i++){
            var arr=items[i];
            var r=BuildRes.rects[i];
            arr[4]=r[0];
            arr[5]=r[1];
        }
    }
    BuildRes.addRect=function(width,height){
        var newNode=BuildRes.findNode(width,height);
        if(newNode[3]==0) return null;
        BuildRes.placeRect(newNode);
        return newNode;
    }
    BuildRes.placeRect=function(node){
        var numRectanglesToProcess = BuildRes.freeRects.length;
        for(var i= 0;i < numRectanglesToProcess;i++) {
            if (BuildRes.splitFreeNode(BuildRes.freeRects[i], node)) {
                BuildRes.freeRects.splice(i,1);
                --i;
                --numRectanglesToProcess;
            }
        }
        for(var i=0;i<BuildRes.freeRects.length;i++){
            for(var j=i+1;j<BuildRes.freeRects.length;j++){
                if (BuildRes.inRect(BuildRes.freeRects[i],BuildRes.freeRects[j])){
                    BuildRes.freeRects.splice(i,1);
                    break;
                }
                if (BuildRes.inRect(BuildRes.freeRects[j],BuildRes.freeRects[i])){
                    BuildRes.freeRects.splice(j,1);
                }
            }
        }
        BuildRes.usedRects.push(node);
    }
    BuildRes.findNode=function(width,height){
        var bestNode=[0,0,0,0];
        var bestShortSideFit=2147483647;
        var bestLongSideFit=BuildRes.score2;
        for(var i=0;i<BuildRes.freeRects.length;i++) {
            var rect=BuildRes.freeRects[i];
            if (rect[2]>=width&&rect[3]>=height){
                var leftoverHoriz=Math.abs(rect[2]-width);
                var leftoverVert=Math.abs(rect[3]-height);
                var shortSideFit=Math.min(leftoverHoriz,leftoverVert);
                var longSideFit=Math.max(leftoverHoriz,leftoverVert);
                if (shortSideFit<bestShortSideFit||(shortSideFit==bestShortSideFit&&longSideFit<bestLongSideFit)){
                    bestNode[0]=rect[0];
                    bestNode[1]=rect[1];
                    bestNode[2]=width;
                    bestNode[3]=height;
                    bestShortSideFit=shortSideFit;
                    bestLongSideFit=longSideFit;
                }
            }
        }
        return bestNode;
    }
    BuildRes.splitFreeNode=function(freeNode,usedNode){
        if (usedNode[0]>=freeNode[0]+freeNode[2]||usedNode[0]+usedNode[2]<=freeNode[0]||
            usedNode[1]>=freeNode[1]+freeNode[3]||usedNode[1]+usedNode[3]<=freeNode[1])
            return false;
        var newNode;
        if (usedNode[0]<freeNode[0]+freeNode[2]&&usedNode[0]+usedNode[2]>freeNode[0]){
            if (usedNode[1]>freeNode[1]&&usedNode[1]<freeNode[1]+freeNode[3]){
                newNode=freeNode.slice(0);
                newNode[3]=usedNode[1]-newNode[1];
                BuildRes.freeRects.push(newNode);
            }
            if (usedNode[1]+usedNode[3]<freeNode[1]+freeNode[3]){
                newNode=freeNode.slice(0);
                newNode[1]=usedNode[1]+usedNode[3];
                newNode[3]=freeNode[1]+freeNode[3]-(usedNode[1]+usedNode[3]);
                BuildRes.freeRects.push(newNode);
            }
        }
        if (usedNode[1]<freeNode[1]+freeNode[3]&&usedNode[1]+usedNode[3]>freeNode[1]){
            if (usedNode[0]>freeNode[0]&&usedNode[0]<freeNode[0]+freeNode[2]){
                newNode=freeNode.slice(0);
                newNode[2]=usedNode[0]-newNode[0];
                BuildRes.freeRects.push(newNode);
            }
            if (usedNode[0]+usedNode[2]<freeNode[0]+freeNode[2]){
                newNode=freeNode.slice(0);
                newNode[0]=usedNode[0]+usedNode[2];
                newNode[2]=freeNode[0]+freeNode[2]-(usedNode[0]+usedNode[2]);
                BuildRes.freeRects.push(newNode);
            }
        }
        return true;
    }
    BuildRes.inRect=function(a,b){
        return a[0]>=b[0]&&a[1]>=b[1]&&a[0]+a[2]<=b[0]+b[2]&&a[1]+a[3]<=b[1]+b[3];
    }
})();