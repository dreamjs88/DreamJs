require("adapter.js");
require("js/imports.js");
for(var i=0;i<imports.length;i++){
    var url=imports[i];
    var name=url.replace(/^.+\//,"").replace(/\?.+$/,"");
    url=url.replace(/\?\w+$/,"");
    var obj=require(url);
    if(name=="core-three.js") window["THREE"]=obj;
}