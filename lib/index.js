var graphic = require("./graphic"),
    cssfileop = require("./cssfileop"),
	logger = require("./logger"),
	util = require("./util"),
	mapEach = util.array.mapEach,
	forEach = util.array.forEach,
	path = require("path"),
	EventBus = util.event.EventBus,
	caculator = require("./caculateLayout");

var config = {
	outputdir:"../dest",
	rootdir:"./",
    spritepngie6: "true"
}

//graphic.getImageInfo(["many-colors.png", "web.gif"], function(info){

	  //console.log(info);
//});
var cssFile = path.join(__dirname, './cssfileop/cssFile2.css');

cssfileop.readCssFile(cssFile, function(infoObj, fileString) {
	var mainSpriteInfo = infoObj.mainInfo,
		pieceInfo = infoObj.pieceInfo,
		spkey, spriteMap = {}, 
		emitterBus = new EventBus({channelSize:pieceInfo.length}),
		paperInfo = null;
		
		// convert path in css file to 
		convertFilePath(cssFile, infoObj.pieceInfo);

		for(spkey in mainSpriteInfo) {
			spriteMap[spkey] = {
				pieces: []
			}
		}

		emitterBus.on("alldone", function(info){
	
			for(spkey in spriteMap) {
				paperInfo = caculator.caculate(mainSpriteInfo[spkey].annoInfo["sprite-layout"], spriteMap[spkey].pieces);
			
				// set filesystem info
				paperInfo.fsInfo = {};
				paperInfo.fsInfo.destPath = config.outputdir;
				paperInfo.fsInfo.file = "TODO.png";
			
				var dh = new graphic.DrawHelper(paperInfo);
				dh.draw();
			}
					
		});

		forEach(pieceInfo, function(elm) {
			
			(function(elm) {
				graphic.getImageInfo(elm.image, function(info){
					elm.imageInfo = info;
					emitterBus.emit("alldone");				
				});	
			})(elm);

			if(typeof spriteMap[elm.annoInfo['sprite-ref']] !== "undefined") {
				spriteMap[elm.annoInfo['sprite-ref']].pieces.push(elm);	
			}
		});
	
});


function convertFilePath(base, piecesInfo) {
	base = path.resolve(base, "../");
	forEach(piecesInfo, function(elm) {
		elm.image = path.join(base, elm.image); 
	})

}

var dh = new graphic.DrawHelper({
			fsInfo:{
				destPath:config.outputdir,
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
						times:110,
						align:"h"
					}
				}
			]
		  });
//dh.draw();




	