var graphic = require("./graphic"),
    cssfileop = require("./cssfileop"),
	logger = require("./logger"),
	util = require("./util"),
	mapEach = util.array.mapEach,
	forEach = util.array.forEach,
	path = require("path"),
	EventBus = util.event.EventBus,
	caculator = require("./caculateLayout"),
	md5 = util.md5,
	fsExt = require("./fs"),
	fs = require("fs");

var config = {
	outputdir:"../dest",
	rootdir:"./cssfileop",
    spritepngie6: "true"
}

//console.log(md5.hex_md5("asd"))
//graphic.getImageInfo(["many-colors.png", "web.gif"], function(info){
	  //console.log(info);
//});

var rootAbsolute = path.join(__dirname, config.rootdir);
var cssFile = path.join(rootAbsolute, './base/cssFile2.css');



(function resolveConfig(config) {
	config.outputdir = path.join(__dirname, config.outputdir);
})(config);

(function main() {
	var cssFiles = [];
	// check if the rootPath is valid, then process start otherwise programme exit
	fsExt.existsPath(rootAbsolute, function(flag){
		if(flag === true) {
			cssFiles = fsExt.fileIterator(rootAbsolute, fileFilter);
			logger.info("find: " + cssFiles.length + " css files in specified directory");

			forEach(cssFiles, function(elm) {
				processCssFile(elm , function() {})
			});
		
		} else {
			logger.error("rootdir ---- " + rootAbsolute + " ----- not exists !");
			return;
		}
	});


})();

function fileFilter(file) {
	if(path.extname(file) === ".css") {
		return true
	}
	return false;
}

function processCssFile(cssFile, callback) {
	cssfileop.readCssFile(cssFile, function(infoObj, fileString) {
		var mainSpriteInfo = infoObj.mainInfo,
			pieceInfo = infoObj.pieceInfo,
			spkey, spriteMap = {}, 
			emitterBus = new EventBus({channelSize:pieceInfo.length}),
			paperInfo = null,
			destSpriteImage = "",
			cssRelative = path.dirname(path.relative(rootAbsolute ,cssFile)), // base/intern/a.css => base/intern
			imageDestRelative = "",
			imageDestAbsolute; 
			
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
			
					imageDestRelative = path.join(cssRelative, path.dirname(destSpriteImage));
					imageDestAbsolute = path.join(config.outputdir, imageDestRelative);
					// presolve file name of the generated image
					var imageName = resolveImageName(path.basename(destSpriteImage));
				
					// test whether the imageDestAbsolute is the subpath of outputdir
					if(imageDestAbsolute.indexOf(config.outputdir) == 0) {

						fsExt.makeSureDir(imageDestAbsolute);
						
					} else {
						logger.error("sprite-image invalid in file:" + cssFile);
						callback(false);
						return;
					}
					// set filesystem info
					paperInfo.fsInfo = {};
					paperInfo.fsInfo.destPath = path.join(config.outputdir, imageDestRelative);
					paperInfo.fsInfo.file = imageName;
				
					var dh = new graphic.DrawHelper(paperInfo);
					dh.draw(function(fileNames){
					
						// TODO write css file
						generateNewCssFile(fileString, paperInfo, fileNames);
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
}



function generateNewCssFile(a, b) {
	//console.log(b)
}

function replaceFileNameWidthMd5(files) {
		// replace ${md5} width right value
		var replacedName = replaceFileNameWidthMd5(files);
		//logger.info("sprite of file -----" + imageName + " ----- success!");

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




	