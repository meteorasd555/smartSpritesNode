function format(template, object) {
    var defaultReg = /\{(.*?)\}/g;
    return template.replace(defaultReg, function(){

        return object[arguments[1]];
    });
}
/*
    @description wrap a string with two string
    @param [String] str need to be wrapped
    @param [String] wrapper string 
*/
function wrapWith(str, wrapper) {
    return wrapper + str + wrapper;
}

function trimAll(str) {
	return str.replace(/\s/g,"");
}

exports.format = format;
exports.wrapWith = wrapWith;
exports.trimAll = trimAll;