var clazz = require("./clazz"),
	array = require("./array"),
	lang = require("./lang");

var EventBus = clazz.create({
	initialize: function(option) {
		var DEFAULT_CONFIG = {
			channelSize:1
		}
		var config = lang.extend({}, DEFAULT_CONFIG, option);
		this.events = [{channelCluster:["event1","event2","event3"],callback:function(ret1,ret2,ret3){}}];
		this.emitStorage = {
			"event1":[[],[]],
			"event2":[[],[]]
		};
		
		this.getConfig = function() {
			return config;
		}
	},
	// addlistener("event1","event2","event3",function(ret1, ret2, ret3){ })
	addListener: function() {
		 var l = arguments.length, callback = arguments[l - 1], channels = [], channelCluster = [];
		 if(lang.getType(callback) !== "Function") {
		 	throw new Error("the last parameter should be a function");
		 }

		 channelCluster = Array.prototype.slice.call(arguments, 0, -1);
		 array.unique(channelCluster);
		 this.events.push({channelCluster:channelCluster,callback:callback})
	},
	emit: function(events, args) {
		var me = this, es = this.emitStorage, channelSize = this.getConfig().channelSize;
		es[events] = es[events] || [];
		es[events].unshift(Array.prototype.slice.call(arguments, 1)),
		emittedChannel = {};
		array.forEach(this.events, function(elm) {
			var cc = elm.channelCluster,
				allCount = 0, callbackArg = [];
			if(array.isInArray(events, cc)) {
				array.forEach(cc, function(elm) {
					if(es[elm] && es[elm].length!== 0 && es[elm].length >= channelSize) {
						allCount++;
						if(channelSize > 1) {
							callbackArg.push(lang.clone(es[elm]).reverse());
						} else {
							callbackArg.push(es[elm][0]);
						}
						
					}
				});
				// all channels have ready
				if(allCount === cc.length) {
					elm.callback.apply(me, callbackArg);	
				}
			}
		});	
	},
	clearStack: function(channel) {
		var me = this;
		switch (lang.getType(channel)) {
			case "Undefined":
				this.emitStorage = {};
			break;
			case "String":
				this.emitStorage[channel] && (this.emitStorage[channel] = []);
			break;
			case "Array":
				 array.forEach(channel, function(elm) {
				 	me.emitStorage[elm] && (me.emitStorage[elm] = []);
				 })
			break;
			default:
		}

	}

});

var eb = new EventBus({channelSize:1});

eb.addListener("a", "b", "c",function(){
	console.dir(arguments);
});





eb.emit("a","a1");
eb.emit("b","b1");
eb.emit("c","c1");

eb.emit("a","a2");
eb.emit("b","b2");
eb.emit("c","c2");





exports.EventBus = EventBus;