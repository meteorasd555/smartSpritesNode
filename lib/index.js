var graphic = require("./graphic"),
    cssfileop = require("./cssfileop"),
	logger = require("./logger"),
	util = require("./util"),
	mapEach = util.array.mapEach,
	forEach = util.array.forEach,
	path = require("path"),
	EventBus = util.event.EventBus,
	caculator = require("./caculateLayout"),
	md5 = util.md5;

var config = {
	outputdir:"../dest",
	rootdir:"./",
    spritepngie6: "true"
}

//console.log(md5.hex_md5("asd"))
//graphic.getImageInfo(["many-colors.png", "web.gif"], function(info){

	  //console.log(info);
//});
var cssFile = path.join(__dirname, './cssfileop/cssFile2.css');

(function resolveConfig(config) {
	config.outputdir = path.join(__dirname, config.outputdir);
})(config)

cssfileop.readCssFile(cssFile, function(infoObj, fileString) {
	var mainSpriteInfo = infoObj.mainInfo,
		pieceInfo = infoObj.pieceInfo,
		spkey, spriteMap = {}, 
		emitterBus = new EventBus({channelSize:pieceInfo.length}),
		paperInfo = null,
		destSpriteImage = "";
		
		// convert path in css file to 
		convertFilePath(cssFile, infoObj.pieceInfo);

		for(spkey in mainSpriteInfo) {
			spriteMap[spkey] = {
				pieces: [],
				mainInfo:mainSpriteInfo[spkey]
			}
		}

		emitterBus.on("getImageInfoAllDone", function(info){
	
			for(spkey in spriteMap) {
				// caculate layout
				paperInfo = caculator.caculate(spriteMap[spkey].mainInfo.annoInfo["sprite-layout"], spriteMap[spkey].pieces);

				// get generated image specification
				destSpriteImage = spriteMap[spkey].mainInfo.annoInfo["sprite-image"];

				// resolve generated image location /dir/image.png => dir/image.png
				var dir = path.dirname(destSpriteImage.replace(/^\//,""));

				// presolve file name of the generated image
				var imageName = resolveImageName(path.basename(destSpriteImage));

			
				// TODO convert relative path to absolute one
				//console.log(path.resolve(config.outputdir, dir));

				// set filesystem info
				paperInfo.fsInfo = {};
				paperInfo.fsInfo.destPath = config.outputdir;
				paperInfo.fsInfo.file = imageName;
			
				var dh = new graphic.DrawHelper(paperInfo);
				dh.draw(function(fileNames){
					// replace ${md5} width right value
					var replacedName = replaceFileNameWidthMd5(fileNames);
					logger.info("sprite of file -----" + imageName + " ----- success!");

					// TODO write css file
					generateNewCSsFile(fileString, paperInfo, replacedName);
				});
			}			
		});

		forEach(pieceInfo, function(elm) {
			
			(function(elm) {
				graphic.getImageInfo(elm.image, function(info){
					elm.imageInfo = info;
					emitterBus.emit("getImageInfoAllDone");				
				});	
			})(elm);

			if(typeof spriteMap[elm.annoInfo['sprite-ref']] !== "undefined") {
				spriteMap[elm.annoInfo['sprite-ref']].pieces.push(elm);	
			}
		});
	
});

function generateNewCSsFile(a, b) {
	console.log(b)
}

function replaceFileNameWidthMd5(files) {
	// TODO
}

function resolveImageName(name) {
	return name;
}

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




	