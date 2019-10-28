require("adapter.js");
require("laya.wxmini.js");
require("js/imports.js");
for(var i=0;i<imports.length;i++){
    var url=imports[i];
    url=url.replace(/\?\w+$/,"");
    require(url);
}