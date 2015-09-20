// utf-8
//  baseado no código de Paul Irish com pequenas modificações para otimizar minificação
(function(window) {
	var lastTime = 0, x, pref,
		vendors = ['webkit', 'o', 'ms', 'moz'];
	for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		pref = vendors[x];
		window.requestAnimationFrame = window[pref+'RequestAnimationFrame'];
		window.cancelAnimationFrame =
		window[pref+'CancelAnimationFrame'] || window[pref+'CancelRequestAnimationFrame'];
	}

	if(!window.requestAnimationFrame){
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = setTimeout(function() {callback(currTime + timeToCall);}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if(!window.cancelAnimationFrame){
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
})(window);
