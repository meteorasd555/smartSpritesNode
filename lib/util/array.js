function mapEach(arlike, func) {
	var i = 0, l = arlike.length, unit, ret;
	for(i; i < l; i++) {
		unit = arlike[i];
		ret = func.call(arlike, unit, i); 
		arlike[i] = typeof ret === "undefined" ? arlike[i] : ret;

	}
}

function forEach(arlike, func) {
	var i = 0, l = arlike.length, unit, ret;
	for(i; i < l; i++) {
		unit = arlike[i];
		ret = func.call(arlike, unit, i); 
	}
}

function unique(arlike) {
	var i = 0, l = arlike.length, unit, map = {};
	for(i; i < l; i++) {
		unit = arlike[i];
		if(map[unit] === true) {
			arlike.splice(i, 1);
			l--,i--;
		} else {
			map[unit] = true;
		}
	}
	return arlike;
}


function isInArray(elm, array) {
	var i = 0;
	for(i;i < array.length;i++) {
		if(elm == array[i]) {
			return true;
		}
	}
	return false;
}



exports.mapEach = mapEach;
exports.forEach = forEach;
exports.unique = unique;
exports.isInArray = isInArray;
