class Tool{
    public static upgradeProject(){
        if(!Shell.available) return;
        var items=[
            "examples/plane/",
            "examples/sprite-test/",
            // "throne/"
        ]
        for(var i=0;i<items.length;i++){
            var toPath="../"+items[i];
            Shell.copyFile(toPath+"bin/js/code.js",toPath+"code.js");

            Shell.deleteFolder(toPath+"build");
            Shell.deleteFolder(toPath+"code/dream");
            Shell.deleteFolder(toPath+"bin/js");

            Shell.copyFolder("build",toPath+"build");
            Shell.copyFolder("code/dream",toPath+"code/dream");
            Shell.copyFolder("bin/js",toPath+"bin/js");

            Shell.copyFile(toPath+"code.js",toPath+"bin/js/code.js");
            Shell.deleteFile(toPath+"code.js");
        }
        window.close();
    }
}