var graphic = require("./graphic");
graphic.getImageInfo(["示例图.jpg", "web.gif"], function(info){

	 // console.log(info);
});

var dh = new graphic.DrawHelper({
			fsInfo:{
				destPath:"../dest",
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
		  });
dh.draw();




	