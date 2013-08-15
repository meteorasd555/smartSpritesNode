var childProccess = require('child_process'),
	spawn = childProccess.spawn,
	exec = childProccess.exec,
	util = require("../util"),
	fsExt = require("../fs"),
	wrapWith = util.string.wrapWith,
	format = util.string.format, 
	fs = require("fs"),
	EventEmitter = require('events').EventEmitter,
	path = require("path"),
	EventBus = util.event.EventBus,
	logger = require("../logger");

var IDENTIFY = {
	COMMAND: "identify",
	ARGUMENTS:{
		FORMAT: "-format"
	},
	/*
	   key properties should be as list (without symbol % ) and case insensitive

	   reference : http://www.imagemagick.org/script/escape.php
	   %b   file size of image read in
	   %c   comment meta-data property
	   %d   directory component of path
	   %e   filename extension or suffix
	   %f   filename (including suffix)
	   %g   layer canvas page geometry   (equivalent to "%Wx%H%X%Y")
	   %h   current image height in pixels
	   %i   image filename (note: becomes output filename for "info:")
	   %k   CALCULATED: number of unique colors
	   %l   label meta-data property
	   %m   image file format (file magic)
	   %n   number of images in current image sequence
	   %o   output filename  (used for delegates)
	   %p   index of image in current image list
	   %q   quantum depth (compile-time constant)
	   %r   image class and colorspace
	   %s   scene number (from input unless re-assigned)
	   %t   filename without directory or extension (suffix)
	   %u   unique temporary filename (used for delegates)
	   %w   current width in pixels
	   %x   x resolution (density)
	   %y   y resolution (density)
	   %z   image depth (as read in unless modified, image save depth)
	   %A   image transparency channel enabled (true/false)
	   %C   image compression type
	   %D   image GIF dispose method
	   %G   original image size (%wx%h; before any resizes)
	   %H   page (canvas) height
	   %M   Magick filename (original file exactly as given,  including read mods)
	   %O   page (canvas) offset ( = %X%Y )
	   %P   page (canvas) size ( = %Wx%H )
	   %Q   image compression quality ( 0 = default )
	   %S   ?? scenes ??
	   %T   image time delay (in centi-seconds)
	   %W   page (canvas) width
	   %X   page (canvas) x offset (including sign)
	   %Y   page (canvas) y offset (including sign)
	   %Z   unique filename (used for delegates)
	   %@   CALCULATED: trim bounding box (without actually trimming)
	   %#   CALCULATED: 'signature' hash of image values
   */
	PROPMAP: {
		"width":{
			key:"w", type:"number"
		},
		"height":{
			key:"h", type:"number"
		},
		"format":{
			key:"m", type:"string"
		},
		"size": {
			key:"b", type:"string"
		}
	}
}

/*
	@description get arguments for child_process.spawn
	@param [String | Array] string need to be wrapped or an Array of string
	@param [Object] string need to be wrapped or an Array of string
	@return [Array] arguments for the second param of child_process.spawn
*/
function _getArg_identify(imagePath) {
	var arguments = [IDENTIFY.ARGUMENTS.FORMAT], param = [], p,
		 propMap = IDENTIFY.PROPMAP;
	for(p in propMap) {

		if(propMap[p]["type"] == "number") {

			param.push( wrapWith(p, "\"") + ": " + "%" + propMap[p]["key"]);
		} else {
			param.push( wrapWith(p, "\"") + ": " + wrapWith("%" + propMap[p]["key"], "\""));
		}	
	}
	arguments.push("{" + param.join(", ") + "}");
	arguments = arguments.concat(imagePath);
	return arguments;
};



/*
	@description get detailed info of a image file
	@param [String] the fs path of a image
	@param [Function] callback funciton, which will be invoked as long as process done	
*/
var getInfo = function(imagePath, callback) {
	var argument  =  _getArg_identify(imagePath),
		identify = spawn(IDENTIFY.COMMAND, argument);
	    

	identify.stdout.on('data', function (data) {
	  var dataStr = data.toString(),
	  	  multiRegExp = /\{.*?\}/g,
	  	  splitJsonArray;

	  if( util.lang.getType(imagePath) === "Array") {
	  	  splitJsonArray = dataStr.match(multiRegExp);
	  	  util.array.mapEach(splitJsonArray, function(single){
	  	  	return JSON.parse(single);
	  	  });
	  } else {
	  	  callback(JSON.parse(dataStr));
	  	  return;
	  }

	  callback(splitJsonArray);
	  
	});
}

/*
	@description drawImage according to the infomation passed
	@param info
		{
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
					top:0,
					left:0,
					filePath:"../all-select-shadow.png",
				},
				{
					top:230,
					left:100,
					filePath:"../many-colors.png",
					repeat: {
						times:3,
						align:"h"
					}
				}
			]
		  }
*/

function drawImage (info, callback) {
	var emt = new EventBus(),
		tempfolder = "temp" + new Date().getTime(),
		cmd = _getCmd_composite(info), task = {};

	// check if the dest folder path exists
	// if not then make it
	fs.exists(info.fsInfo.destPath, function(result) {
		if(!result) {
			fs.mkdir(info.fsInfo.destPath, function(arg) {
				if(arg !== null) {
					// make folder fail
					logger.error("dest path not exists and the auto making process failed");
					return;
				}

				// make folder success
				logger.info("dest path not exists and auto making success");
				emt.emit("destfolderReady");
			});
		} else {
			// dest folder exists
			emt.emit("destfolderReady");
		}
	});

		// create a temp dir
	fs.mkdir(tempfolder, function(result) {
		if(result !== null) {

			// make folder fail
			logger.error("making temporary folder error");
			return;
		}
		emt.emit("tempFolderReady");
	});

	emt.on("tempFolderReady", function() {

		
		exec(cmd, {cwd: tempfolder}, function() {
			// dest image making success in temporary folder			
			emt.emit("drawingDone");		
		});
		
	});

	// dest path  exists and dest image making success in temporary folder	
	// then copy them to dest path
	emt.on("tempFolderReady", "drawingDone", function() {
		fs.rename(path.join(tempfolder,info.fsInfo.file),
			path.join(info.fsInfo.destPath, info.fsInfo.file), function() {		
			emt.emit("allDone");	
		});
	})

	// all work done
	emt.on("allDone", function() {

		callback();
		// do the clear work
		fsExt.rmdirCascade(tempfolder, function(result) {
			if(result != null) {
				logger.warn("temporary clear fail");
			} else {
				logger.info("image generated sucessfully!");
			}
		});

	});

}

/*
	@description  get integrated command for child_process.exec
	@param [Object] mixed info that include composited image and 
	@return [String] integrated command string
*/
function _getCmd_composite(info) {

    var TPL_CANVAS = "convert -size {width}x{height} canvas: png:- | convert png:- null: -alpha set -compose Clear -composite -compose Over {img}";
	var TPL_UNIT_REPEAT = "montage -background transparent -tile {align} -geometry +0+0 -duplicate {times} {img} png:- | composite -geometry +{left}+{top} png:- {imgDest} {imgDest}";
	var TPL_UNIT = "composite -geometry +{left}+{top} {img} {imgDest} {imgDest}";

	var cmd = [], i = 0, l = info.piecesInfo.length, piece;
	

	cmd.push(format(TPL_CANVAS, {
			width:info.canvas.width, 
			height:info.canvas.height, 
			img:info.fsInfo.file		
		}));

	for(i;i < l; i++) {
		piece = info.piecesInfo[i];
		if(piece.repeat) {

			cmd.push(format(TPL_UNIT_REPEAT, {
				left:piece.left, 
				top:piece.top, 
				img:piece.filePath,
				imgDest:info.fsInfo.file,
				align:piece.repeat.align == "h" ? "x1" : "1x",
				times:piece.repeat.times
			}));

		} else {

			cmd.push(format(TPL_UNIT, {
				left:piece.left, 
				top:piece.top, 
				img:piece.filePath,
				imgDest:info.fsInfo.file
			}));

		}

	}

	return cmd.join("&&");
};

/*
	@description  convert an image from one format to another
	@param [String] source image
	@param [String] target image
	@param [Object] target image
	@return [String] integrated command string
*/

function convertFormat(src, dest, option, callback) {
	var TPL_CONVERTFORMAT = "convert -define png:format=png8 {img} {imgDest}",
	    cmd;
	cmd = format(TPL_CONVERTFORMAT, {
				img:src,
				imgDest:dest
			});

	exec(cmd, function(result) {

		callback && callback(result);
	});
}

exports.getInfo = getInfo;
exports.drawImage = drawImage;
exports.convertFormat = convertFormat;
exports.setConfig = {}; // TODO