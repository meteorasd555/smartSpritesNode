var fs = require("fs"),
	util = require("../util"),
	logger = require("../logger"),
	mapEach = util.array.mapEach,
	forEach = util.array.forEach;

var getUUID = (function() {
	var UUID = 1;
	return function() {
		return UUID++;
	}
})();

function readCssFile(cssFile, cb) {

	fs.readFile(cssFile, function (err, data) {
	if(err) {
		logger.error("read css file: -----  " + cssFile + "  ------ failed", err);
		cb(null);
		return;
	} else {
		logger.info("read css file: ------  " + cssFile + "  ------ start");
	}
	var fileString = data.toString(),
		rpBlankReg = fileString.replace(/\r\n|\s/g,""), 
		pieceReg = /background-image.*?;[\s.\r\n]*?\/\*\*((:?.|\r\n)*?)\*\//g,
	    mainReg = /\/\*\*((:?.|\r\n)*?)\*\//g,
	    pieceInfo = [], mainInfo = {},
	    temp = [], tempStr = fileString, result, annoInfos;


	while(true) {
	result = pieceReg.exec(fileString);
	if(result == null) break;
		pieceInfo.push({
			file:cssFile,
			id:getUUID(),
			start: result.index, 
			content: result[0], 
			len: result[0].length, 
			annoInfo: readAnnotation(RegExp.$1.replace(rpBlankReg,"")),
			image:getBackgroundImage(result[0])
		});
	
	}
 
	while(true) {
	result = mainReg.exec(fileString);
	if(result == null) break;
		annoInfos = readAnnotation(RegExp.$1.replace(rpBlankReg,""));
		if(!("sprite" in annoInfos)) {
			continue;
		}		

		mainInfo[annoInfos.sprite] = {
			file:cssFile,
			id:getUUID(),
			start: result.index, 
			content: result[0], 
			len: result[0].length, 
			annoInfo: annoInfos,
			//image:getBackgroundImage(result[0])
		}

	}


 	logger.info("read css file: ------  " + cssFile + "  ------ success" );
 	cb({
 		mainInfo: mainInfo,
 		pieceInfo: pieceInfo
 	}, fileString);
});

}

/**
	input:sprite-ref: common;sprite-margin-bottom:20px;
	return {
		"sprite-ref": "common",
		"sprite-margin-bottom": "20px"
	}
*/
function readAnnotation(annotation) {
	var eachAnno = annotation.split(";"),
		seg = "", map = [], obj = {};
	forEach(eachAnno, function(elm) {
		seg = util.string.trimAll(elm);
		if(seg === "") return;
		map = seg.split(":");
		obj[map[0]] = map[0] === "sprite-image" ? getBackgroundImage(map[1]): map[1];
	});
	return obj;
}

/**
	input:url('decorator/tip.gif');url("decorator/tip.gif");url(decorator/tip.gif);
	return:decorator/tip.gif
*/
function getBackgroundImage(bkimage) {
	var pattern = /url\(['"]?.+?['"]?\)/, 
		url = pattern.test(bkimage) ? bkimage.match(pattern)[0] : bkimage;
		
	 return url.replace(/url\(['"]?(.+?)['"]?\)/, "$1");
}




exports.readCssFile = readCssFile;