function info(info) {
	console.dir("[info]:" + info);
	// TODO
}

function error(info) {
	console.dir("[error]:" + info);
	// TODO
}


function warn(info) {
	console.dir("[warn]:" + info);
	// TODO
}
exports.info = info;
exports.error = error;
exports.warn = warn;