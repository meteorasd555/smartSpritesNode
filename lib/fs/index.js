var fs = require("fs"),
	EventEmitter = require('events').EventEmitter;
	
function rmdirCascade(path, callback) {
	var emitter = new EventEmitter(), count = 0, callback = callback || function(){};
	fs.exists(path, function(exists) {
		if(exists) {		
			fs.stat(path, function(stats, fst) {
				if(stats != null) {
					callback(stats);
					return;
				}
				if(fst.isFile()) {
					fs.unlink(path, function(result) {
						callback(result);		
					});
				} else if (fst.isDirectory()) {
					fs.readdir(path, function(stats, fst) {
						if(stats == null) {
							if(fst.length == 0 ) {
								fs.rmdir(path, callback);							
							} else {
								emitter.on("done", function(result) {
									count++;
									if(count == fst.length) {
										fs.rmdir(path, callback);
									}
								});
								for(var i =0;i < fst.length;i++) {
									rmdirCascade(path + "/" +fst[i], function(stats) {
										emitter.emit("done",stats);
									});
								}
							}
						}
					});
				}	
			});		
		} else {
			callback(null);
		}
	});

}

function mkdirCascade(path) {


}



exports.rmdirCascade = rmdirCascade;