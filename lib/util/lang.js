var toString = Object.prototype.toString,
    filterTypeReg = /\[object (\w+)\]/;

     var extend = function(src) {
        var prop, argLen = arguments.length, targets, target;
        // if no target to extend from, or src can't be apply a extend
        if(argLen == 1 || typeof src === "undefined") {
            return src;
        }
        targets = Array.prototype.slice.call(arguments, 1);
        for(var i = 0, targLen = targets.length; i < targLen; i++ ) {
            target = targets[i];
            for(prop in target) {
                    src[prop] = target[prop];
            }
        }
        return src;
    };

    var clone = function(ObjectLike) {
        var type = typeof ObjectLike, concreteType = getType(ObjectLike), sub
            ,prop , i, dump, type;

        // only object and function is need to be cloned
        if(concreteType === "Array" || concreteType === "Object") {
            // set a Object/Array clone
            dump = eval("new " + concreteType);
            // solve iterated value
            for(prop in ObjectLike) {
                sub = ObjectLike[prop];
                if(!ObjectLike.hasOwnProperty(prop)) {
                    continue;
                }
                switch (getType(sub)) {
                    case "String":
                    case "Number":
                    case "Boolean":
                        // just basic type
                        type = eval(getType(sub));
                        dump[prop] = type(sub);
                        break;
                    default:
                        dump[prop] =clone(sub);
                }
            }

        } else {
            return ObjectLike;
        }

        return dump;
    }

    var getType = function(unknow) {
        var plainResult = toString.call(unknow);
        // remove useless part, return
        return plainResult.replace(filterTypeReg,"$1");

    }




exports.getType = getType;
exports.extend = extend;
exports.clone = clone;