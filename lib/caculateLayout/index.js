var util = require("../util"),
	forEach = util.array.forEach;

ANNOTATION_MAP = {
	ML:"sprite-margin-left",
	MR:"sprite-margin-right",
	MT:"sprite-margin-top",
	MB:"sprite-margin-bottom",
	AL:"sprite-alignment"
}

function caculate (layout, piecesInfoInput) {
	var result = null;
	layout = (layout == "horizontal" || layout == "h")? "horizontal" : "vertical";
	
	if(layout === "horizontal") {
		result = doHorizontal(piecesInfoInput);
	} else {
		result = doVertical(piecesInfoInput);
	}



	return {
		canvas:{
			width:100,
			height:200,
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
	}
}

function doVertical(piecesInfoInput) {
	var maxPieceWidth = 0,  align = "", annoInfo = null, align = ""
		ml = mr = mt = mb = width = height = 0;
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
		console.dir(elm)
	})
	
}


function doHorizontal(piecesInfoInput) {
	


}




exports.caculate = caculate;