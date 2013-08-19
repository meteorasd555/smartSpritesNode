var extend = require("./lang").extend;
var create = function() {
    var properties, superClass;
    if(arguments.length === 1) {
        properties = arguments[0];
    } else {
        superClass = arguments[0];
        properties = arguments[1];
    }

    var F = function() {
        // should not invoke initialize on prototypal inherit
        if(F.$p != true){
            this.initialize.apply(this, arguments);
        }
    };

    // set a default function in case that no initialize method passed in
    F.prototype.initialize = function(){};

    // copy all properties to constructor function
    extend(F.prototype, properties);

    // inherit a super class
    if(superClass instanceof Function) {
        inherit(F, superClass);
    }

    return F;
};

var inherit = function(clazz, superClazz) {
    // save subClass prototype for further usage
    var subPrototype = clazz.prototype;

    // set flag to prevent initialize method invoke
    superClazz.$p = true;

    // this is prototypal inheritance
    clazz.prototype = new superClazz();

    // reset the flag
    delete superClazz.$p;

    // reset the properties from original subClass
    M.extend(clazz.prototype, subPrototype);

    // correct constructor
    clazz.prototype.constructor = clazz;

    // save superClass reference for further usage
    clazz.superClass = superClazz;
};

exports.create = create;
exports.inherit = inherit;
