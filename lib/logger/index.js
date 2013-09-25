function info(info) {

	console.log("[info]:" + info);
	// TODO
}

function error(info) {
	
	console.log("[error]:" + info);
	// TODO
}


function warn(info) {
	return;
	console.log("[warn]:" + info);
	// TODO
}
exports.info = info;
exports.error = error;
exports.warn = warn;