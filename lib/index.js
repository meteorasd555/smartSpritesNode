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
	fs = require("fs"),
	dh = new graphic.DrawHelper({});

var config = {
	outputdir:"../dest",
	rootdir:"../base",
    spritepngie6: "true"
}

var spriteId = 0;
	writeBuffer = {};



var rootAbsolute = path.join(__dirname, config.rootdir);
var cssFile = path.join(rootAbsolute, './base/cssFile2.css');



(function resolveConfig(config) {
	config.outputdir = path.join(__dirname, config.outputdir);
})(config);

(function main() {
	var cssFiles = [],
		eventBus;
	// check if the rootPath is valid, then process start otherwise programme exit
	fsExt.existsPath(rootAbsolute, function(flag){
		if(flag === true) {
			cssFiles = fsExt.fileIterator(rootAbsolute, fileFilter);
			logger.info("find: " + cssFiles.length + " css files in specified directory");
			eventBus = new EventBus({channelSize:cssFiles.length});
			eventBus.on("processCssFileDone", function(result) {
				if(util.event.judge(result)) {
					logger.info("   ----- CONGRATULATION ! ----- Mission Complete !");
				} else {
					logger.warn("WARING MIssion was failed!");
				}
			});

			forEach(cssFiles, function(elm) {
				processCssFile(elm , function(result) {
						eventBus.emit("processCssFileDone", result);
				})
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
			emitterBusGetInfo = new EventBus({channelSize:pieceInfo.length}),
			paperInfo = null,
			destSpriteImage = "",
			cssRelative = path.dirname(path.relative(rootAbsolute ,cssFile)), // base/intern/a.css => base/intern
			imageDestRelative = "",
			imageDestAbsolute,
			emitterBusDraw,
			emitterBusDrawCount = 0; 
			
			// convert path in css file to 
			convertFilePath(cssFile, infoObj.pieceInfo);

			for(spkey in mainSpriteInfo) {
				spriteMap[spkey] = {
					pieces: [],
					mainInfo:mainSpriteInfo[spkey]
				}
				emitterBusDrawCount++;
			}

			emitterBusDraw = new EventBus({channelSize:emitterBusDrawCount});
			emitterBusDraw.on("processDrawDone", function(result) {

				var pr = [];
				if(emitterBusDrawCount == 1) {
					pr = [result];
				} else {
					pr = result;
				}
	
				forEach(pr, function(elm){

					var fileNames = elm[0];
					var paperInfo = elm[1];	

					if(!fileNames) {
						return;
					} 
			
					replaceFileNameWidthMd5(fileNames, function(nm) {

						// TODO write css file
						generateNewCssFile(cssRelative, 
						path.basename(cssFile), config.outputdir, 
						fileString, paperInfo,  pieceInfo, nm);					
					});

				})

				callback(true);
			})

			emitterBusGetInfo.on("getImageInfoAllDone", function(info){
				// increase spirteId
				spriteId++;

				for(spkey in spriteMap) {

					// caculate layout
					paperInfo = caculator.caculate(spriteMap[spkey].mainInfo.annoInfo["sprite-layout"], spriteMap[spkey].pieces);

					// get generated image specification
					destSpriteImage = spriteMap[spkey].mainInfo.annoInfo["sprite-image"];

					destSpriteImage = destSpriteImage.replace("{sprite}", spriteId);

					// resolve generated image location /dir/image.png => dir/image.png
					imageDestRelative = path.join(cssRelative, path.dirname(destSpriteImage));
					imageDestAbsolute = path.join(config.outputdir, imageDestRelative);

					// if a sprite contain no image
					if(paperInfo.canvas.width == 0 || paperInfo.canvas.height == 0) {
						logger.warn("sprite image " + destSpriteImage + " has no image, then ignore")
						emitterBusDraw.emit("processDrawDone", null);
						return;
					}

					// presolve file name of the generated image
					var imageName = resolveImageName(path.basename(destSpriteImage));
				
					// test whether the imageDestAbsolute is the subpath of outputdir
					if(imageDestAbsolute.indexOf(config.outputdir) == 0) {

						// make the directory to satisfy the output enviorment
						fsExt.makeSureDir(imageDestAbsolute);

					} else {
						logger.error("sprite-image invalid in file:" + cssFile);
						emitterBusDraw.emit("processDrawDone", null);
						return;
					}
					// set filesystem info
					paperInfo.fsInfo = {};
					paperInfo.fsInfo.destPath = path.join(config.outputdir, imageDestRelative);
					paperInfo.fsInfo.file = imageName;
				
					
					dh.draw(paperInfo, function(fileNames, paperInfo) {
						emitterBusDraw.emit("processDrawDone", fileNames, paperInfo);

					});
				}			
			});

			forEach(pieceInfo, function(elm) {
				
				(function(elm) {
					graphic.getImageInfo(elm.image, function(info){
						elm.imageInfo = info;
						emitterBusGetInfo.emit("getImageInfoAllDone");				
					});	
				})(elm);

				if(typeof spriteMap[elm.annoInfo['sprite-ref']] !== "undefined") {
					spriteMap[elm.annoInfo['sprite-ref']].pieces.push(elm);	
				}

			});
		
	});
}

function generateNewCssFile(cssRelative, cssFile, outputDir, fileString, paperInfo, piecesInfo, nm) {

	var destCssFile = path.join(path.join(outputDir, cssRelative, cssFile)),
		tempMap = {}, replacePattern,
		fileContent = writeBuffer[destCssFile] || fileString,
		IE6 = config.spritepngie6,
		templatePostion = "background-position:{left} {top};",
		templateImage = "background-image:url('{url}');",
		positionStr = "",
		imageStr = "",
		replaceMent = [],
		url = "",
		contentSplit = "\r\n\t";

	// make sure the css directory extis in destination folder
	fsExt.makeSureDir(path.join(outputDir, cssRelative));

	forEach(piecesInfo , function(elm) {
		tempMap[elm.id] = elm;
	});

	forEach(paperInfo.piecesInfo, function(elm) {
		replaceMent = [];

		replacePattern = tempMap[elm.id].content;

		positionStr = templatePostion.replace("{left}", elm.left !== 0 ? elm.left + "px" : 0);
		positionStr = positionStr.replace("{top}", elm.top !== 0 ? elm.top + "px" : 0);
		imageStr = templateImage.replace("{url}", path.relative(path.join(outputDir, cssRelative), nm[0]));

		replaceMent.push(imageStr);		
		if(IE6) {
			replaceMent.push( "_" + templateImage.replace("{url}", 
				path.relative(path.join(outputDir, cssRelative), nm[1])));
		}
		replaceMent.push(positionStr);

		fileContent = fileContent.replace(replacePattern, replaceMent.join(contentSplit));	

	});
	
	fs.writeFileSync(destCssFile, fileContent);
	writeBuffer[destCssFile] = fileContent;
}

function replaceFileNameWidthMd5(files, callback) {
		var l = files.length, data, newName,
			eventBus = new EventBus({channelSize:l}),
			md5Str = "", retAr = [];

		if(typeof files == "string") {
			data = fs.readFileSync(files);
			md5Str = md5.hex_md5(data.toString());
			newName = elm.replace("${md5}",md5Str);   
	   		fs.renameSync(files, newName);
	   		retAr.push(newName);
	   		callback(retAr);
	   		return;
		}
	
		forEach(files, function(elm) {
			data = fs.readFileSync(elm);
			md5Str = md5.hex_md5(data.toString());
			newName = elm.replace("${md5}",md5Str);   
	   		fs.renameSync(elm, newName);
	   		retAr.push(newName);
		});	
		callback(retAr);
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