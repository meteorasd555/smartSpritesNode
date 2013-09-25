var graphicInterface = require("./imagemagick"),
    utilExt = require("../util"),
    util = require("util"),
    path = require("path"),
    events = require("events");

var getImageInfo = function(imageUrl, cb) {
	graphicInterface.getInfo(imageUrl, cb);
}


var DrawHelper = utilExt.clazz.create({
	initialize: function(option) {
		

	
	},
	draw: function(paperInfo, cb) {
		var info = paperInfo,
			me = this,
			file, convertedFile;

		graphicInterface.drawImage(info, function(){	

			file = path.join(info.fsInfo.destPath,info.fsInfo.file);
			convertedFile = path.join(info.fsInfo. destPath,me._addfilenameSuffix(info.fsInfo.file,"-ie6"));

	  		graphicInterface.convertFormat(file,convertedFile,{}, function() {
	  			cb && cb([file, convertedFile], paperInfo)
	  		});
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