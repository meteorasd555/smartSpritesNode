var util = require("../util"),
	extend = util.lang.extend,
	forEach = util.array.forEach;

var ANNOTATION_MAP = {
	ML:"sprite-margin-left",
	MR:"sprite-margin-right",
	MT:"sprite-margin-top",
	MB:"sprite-margin-bottom",
	AL:"sprite-alignment"
}

/**
	caculate the layout by options
*/
function caculate (layout, piecesInfoInput) {
	var result = null;
	layout = (layout == "horizontal" || layout == "h")? "horizontal" : "vertical";
	
	if(layout === "horizontal") {
		result = doHorizontal(piecesInfoInput);
	} else {
		result = doVertical(piecesInfoInput);
	}

	return result;
}

/**
	vartical permutation
*/
function doVertical(piecesInfoInput) {
	var maxPieceWidth = canvasWidth = 0, 
	 	repeatedItem = [], 
	 	LMC = 0,
	 	scale = 2,
	    annoInfo = null, align = "",
		ml = mr = mt = mb = width = height = 0,
		retPiecesInfo = [],
		maxHeight = 0;

	// loop once for the infomation summary
	forEach(piecesInfoInput, function(elm) {
		if(elm.imageInfo == null) {
			return;
		}
		width = elm.imageInfo.width;
		height = elm.imageInfo.height;
		annoInfo = elm.annoInfo;
		ml = parseInt(annoInfo[ANNOTATION_MAP.ML]) || 0;
		mr = parseInt(annoInfo[ANNOTATION_MAP.MR]) || 0;
		mt = parseInt(annoInfo[ANNOTATION_MAP.MT]) || 0;
		mb = parseInt(annoInfo[ANNOTATION_MAP.MB]) || 0;
		align = annoInfo[ANNOTATION_MAP.AL] || "left";

		switch (align) {
			case "repeat":
			repeatedItem.push(width);
			break;
			case "left":
			maxPieceWidth = pickBigger(ml + width, maxPieceWidth);
			break;
			case "right":
			maxPieceWidth = pickBigger(mr + width, maxPieceWidth);
			break;
			default:
			maxPieceWidth = pickBigger(ml + mr + width, maxPieceWidth);
		}
	});

	// get the repeated partion's width
	LMC = getMulLCM(repeatedItem);
	// if repeated items is too small then scale it by necessary step
	while(LMC * scale < maxPieceWidth) {
		scale++;
	}

	// get the canvas width
 	canvasWidth = LMC * scale;

 	// loop again to caculate the layout
 	forEach(piecesInfoInput, function(elm) {
 		
 		if(elm.imageInfo == null) {
			return;
		}
		width = elm.imageInfo.width;
		height = elm.imageInfo.height;
		annoInfo = elm.annoInfo;
		ml = parseInt(annoInfo[ANNOTATION_MAP.ML]) || 0;
		mr = parseInt(annoInfo[ANNOTATION_MAP.MR]) || 0;
		mt = parseInt(annoInfo[ANNOTATION_MAP.MT]) || 0;
		mb = parseInt(annoInfo[ANNOTATION_MAP.MB]) || 0;
		align = annoInfo[ANNOTATION_MAP.AL] || "left";

		switch (align) {
			case "repeat":
				retPiecesInfo.push({
					id: elm.id,
					top:maxHeight + mt,
					left:0,
					filePath:elm.image,
					repeat: {
						times:canvasWidth / width,
						align:"h"
					}
				});
			break;
			case "left":
				retPiecesInfo.push({
					id: elm.id,
					top:maxHeight + mt,
					left:ml,
					filePath:elm.image
				});
			break;
			case "right":
				retPiecesInfo.push({
					id: elm.id,
					top:maxHeight + mt,
					left:canvasWidth - width - ml,
					filePath:elm.image
				});
			break;
			case "center":
				retPiecesInfo.push({
					id: elm.id,
					top:maxHeight + mt,
					left:(canvasWidth - width) / 2,
					filePath:elm.image
				});
			break;
			default: // top bottom is invalid , so duel with it defaultly
				retPiecesInfo.push({
					id: elm.id,
					top:maxHeight + mt,
					left:ml,
					filePath:elm.image
				});		
		}
		// set the canvas temporary
		maxHeight += height + mt + mb;	
 	});	

	return {
		canvas: {
			height: maxHeight,
			width: canvasWidth
		},
		piecesInfo: retPiecesInfo
	};
}

/**
	Horizontal permutation 
*/
function doHorizontal(piecesInfoInput) {
	var maxPieceHeight = canvasHeight = 0, 
	 	repeatedItem = [], 
	 	LMC = 0,
	 	scale = 2,
	    annoInfo = null, align = "",
		ml = mr = mt = mb = width = height = 0,
		retPiecesInfo = [],
		maxWidth = 0;

	// loop once for the infomation summary
	forEach(piecesInfoInput, function(elm) {
		if(elm.imageInfo == null) {
			return;
		}
		width = elm.imageInfo.width;
		height = elm.imageInfo.height;
		annoInfo = elm.annoInfo;
		ml = parseInt(annoInfo[ANNOTATION_MAP.ML]) || 0;
		mr = parseInt(annoInfo[ANNOTATION_MAP.MR]) || 0;
		mt = parseInt(annoInfo[ANNOTATION_MAP.MT]) || 0;
		mb = parseInt(annoInfo[ANNOTATION_MAP.MB]) || 0;
		align = annoInfo[ANNOTATION_MAP.AL] || "left";

		switch (align) {
			case "repeat":
				repeatedItem.push(height);
			break;
			case "top":
				maxPieceHeight = pickBigger(mt + height, maxPieceHeight);
			break;
			case "bottom":
				maxPieceHeight = pickBigger(mb + height, maxPieceHeight);
			break;
			default:
				maxPieceHeight = pickBigger(mt + mb + height, maxPieceHeight);
		}
	});

	// get the repeated partion's height
	LMC = getMulLCM(repeatedItem);
	
	// if repeated items is too small then scale it by necessary step
	while(LMC * scale < maxPieceHeight) {
		scale++;
	}

	// get the canvas height
 	canvasHeight = LMC * scale;

 	// loop again to caculate the layout
 	forEach(piecesInfoInput, function(elm) {
 		
 		if(elm.imageInfo == null) {
			return;
		}
		width = elm.imageInfo.width;
		height = elm.imageInfo.height;
		annoInfo = elm.annoInfo;
		ml = parseInt(annoInfo[ANNOTATION_MAP.ML]) || 0;
		mr = parseInt(annoInfo[ANNOTATION_MAP.MR]) || 0;
		mt = parseInt(annoInfo[ANNOTATION_MAP.MT]) || 0;
		mb = parseInt(annoInfo[ANNOTATION_MAP.MB]) || 0;
		align = annoInfo[ANNOTATION_MAP.AL] || "left";

		switch (align) {
			case "repeat":
				retPiecesInfo.push({
					id: elm.id,
					top:0,
					left:maxWidth + ml,
					filePath:elm.image,
					repeat: {
						times:canvasHeight / height,
						align:"v"
					}
				});
			break;
			case "top":
				retPiecesInfo.push({
					id: elm.id,
					top:mt,
					left:maxWidth + ml,
					filePath:elm.image
				});
			break;
			case "bottom":
				retPiecesInfo.push({
					id: elm.id,
					top:canvasHeight - height - mb,
					left:maxWidth + ml,
					filePath:elm.image
				});
			break;
			case "center":
				retPiecesInfo.push({
					id: elm.id,
					top:(canvasHeight - height) / 2,
					left:maxWidth + ml,
					filePath:elm.image
				});
			break;
			default: // left right is invalid , so duel with it defaultly
				retPiecesInfo.push({
					id: elm.id,
					top:mt,
					left:maxWidth + ml,
					filePath:elm.image
				});		
		}
		// set the canvas temporary
		maxWidth += width + ml + mr;	
 	});	

	return {
		canvas: {
			height: canvasHeight,
			width: maxWidth
		},
		piecesInfo: retPiecesInfo
	};
}


/**
	get Least Common Multiple among numbers
*/
function getMulLCM(arNum) {
	var i = 0, l = arNum.length, lcm = l > 0 ?arNum[0] : 1;
	for(i; i < l - 1; i++) {
		lcm = getLCM(lcm, arNum[i + 1]);
	}
	return lcm;
}

/**
	get Least Common Multiple
*/
function getLCM(a, b) {
	return a * b / getGCD(a, b);
}

/**
	get Greatest Common Divisor
*/
function getGCD(a, b) {
	if(a < b) {
		a = [b, b = a][0];
	}
	if(b !== 0) {
		return getGCD(b, a % b);
	} else {
		return a;
	}
}

/**
	get the bigger mumber between two
*/
function pickBigger(a, b) {
	return a > b ? a : b;
}

exports.caculate = caculate;