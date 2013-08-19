var graphicInterface = require("./imagemagick"),
    utilExt = require("../util"),
    util = require("util"),
    path = require("path"),
    events = require("events");

var getImageInfo = function(imageUrl, cb) {
	graphicInterface.getInfo(imageUrl, cb);
}


var DrawHelper = utilExt.clazz.create({
	initialize: function(info) {
		this.info = info;

	
	},
	draw: function() {
		var info = this.info;
			me = this;
		graphicInterface.drawImage(this.info, function(){
		  	graphicInterface.convertFormat(path.join(info.fsInfo.destPath,info.fsInfo.file),
		  	 path.join(info.fsInfo.destPath, me._addfilenameSuffix(info.fsInfo.file,"-ie6")));
		});
	},
	_addfilenameSuffix: function(filename, suffix) {
		var f = filename.split("."), fa = [];
			fa.push(f[0] + suffix);
			f[1] && fa.push(f[1]);
		return fa.join(".");
	}
});



exports.getImageInfo = getImageInfo;
exports.DrawHelper = DrawHelper;