class Tool{
    public static upgradeProject(){
        if(!Shell.available) return;
        var items=[
            "home/",
            "throne/",
            "examples/sprite-test/",
            "examples/plane/",
            "examples/2048/",
            "examples/tetris/",
            "examples/link/",
        ]
        for(var i=0;i<items.length;i++){
            var toPath="../"+items[i];
            Shell.deleteFolder(toPath+"build");
            Shell.copyFolder("build",toPath+"build");
            
            Shell.copyFile("bin/js/run.js",toPath+"bin/js/run.js");

            Shell.deleteFolder(toPath+"code/dream");
            Shell.copyFolder("code/dream",toPath+"code/dream");
        }
        window.close();
    }
}