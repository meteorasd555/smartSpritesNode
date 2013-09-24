var fs = require("fs"),
	EventEmitter = require('events').EventEmitter,
	path = require("path");
	
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

function existsPath(path, callback) {
	fs.exists(path, function(exists) {
		if(exists) {
			fs.stat(path, function(stats, fst) {
				if(stats != null) {
					callback(stats);
					return;
				}
				if(fst.isFile()) {
					callback(false);
				} else if (fst.isDirectory()) {
					callback(true);
				}
			});
		} else {
			callback(false);
		}
	});
}

/**
	traversal all files in given path, and invoke the given callback function
	if necessary filter the file name
*/
function fileIterator(repath, fileFilter) {
	var items = fs.readdirSync(repath),
		fstat,
		ar = [];
	for(var i =0;i < items.length;i++) {
		elm = items[i];
		elm = path.join(repath, elm);
		fstat = fs.statSync(elm);
		if(fstat.isFile() && fileFilter(elm)) {
			ar.push(elm);
		} else if(fstat.isDirectory()) {
			ar = ar.concat(fileIterator(elm, fileFilter));
		}
	}
	return ar;
}

/**
	make sure the unknowPath created after call
*/
function makeSureDir(unknowPath) {
	var exitsRoot = unknowPath;
	while(true) {
		if(fs.existsSync(exitsRoot)) {		
			return mkdirCascade(exitsRoot, unknowPath);
		}
		exitsRoot = path.join(exitsRoot, "../");
	}

}
/**
	keep the sub directory exits under the root path
*/
function mkdirCascade(exitsRoot, unknowPath) {
	var steps = path.relative(exitsRoot, unknowPath).split(path.sep),
		l = steps.length, 
		i = 0;
	for(i; i < l; i++) {
		if(steps[i] === "") return; // exitsRoot == unknowPath, return
		exitsRoot = path.join(exitsRoot, steps[i])
		fs.mkdirSync(exitsRoot);
	}
}



exports.rmdirCascade = rmdirCascade;
exports.existsPath = existsPath;
exports.fileIterator = fileIterator;
exports.makeSureDir = makeSureDir;