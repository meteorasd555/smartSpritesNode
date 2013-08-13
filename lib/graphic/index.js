var graphicInterface = require("./imagemagick"),
    util = require("../util"),
    path = require("path");

var getImageInfo = function(imageUrl, cb) {
	graphicInterface.getInfo(imageUrl, cb);
}


var DrawHelper = util.clazz.create({
	initialize: function() {
		this.info = {
			fsInfo:{
				destPath:"./",
				file:"destiny.png",
			},
			canvas:{
				width:600,
				height:2000
			},
			piecesInfo:[
				{
					top:1000,
					left:0,
					filePath:"../all-select-shadow.png",
				},
				{
					top:1230,
					left:100,
					filePath:"../many-colors.png",
					repeat: {
						times:20,
						align:"v"
					}
				}
			]
		  };

	
	},
	draw: function() {
		var info = this.info;
		graphicInterface.drawImage(this.info, function(){
		  	graphicInterface.convertFormat(path.join(info.fsInfo.destPath,info.fsInfo.file), "./IE666666666666.png");
		});
	}
});


exports.getImageInfo = getImageInfo;
exports.DrawHelper = DrawHelper;