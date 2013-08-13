function mapEach(arlike, func) {
	var i = 0, l = arlike.length, unit, ret;
	for(i; i < l; i++) {
		unit = arlike[i];
		ret = func.call(arlike, unit, i); 
		arlike[i] = typeof ret === "undefined" ? arlike[i] : ret;

	}
}







exports.mapEach = mapEach;