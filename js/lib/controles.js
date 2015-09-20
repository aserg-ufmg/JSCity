Controls = new Class({
	Implements: [Events],
	initialize: function (keyconf, elRef) {
		var self = this, cmd = {},
			mouse = {x: 0, y: 0},
			mouseRef = {x: 0, y: 0};

		// TODO: garantir funcionamento em browsers+os que repetem envio de keydown/up
		if(!elRef) elRef = document;
		elRef.addEvents({
			'keydown': function (ev) {
				if(typeof(keyconf[ev.key])!='undefined') {
					cmd[keyconf[ev.key]] = true;
					self.fireEvent(keyconf[ev.key], [true]);
				}
			},
			'keyup': function (ev) {
				if(typeof(keyconf[ev.key])!='undefined') {
					cmd[keyconf[ev.key]] = false;
					self.fireEvent(keyconf[ev.key], [false]);
				}
			},
			'mousedown': function (ev) {
				if(typeof(keyconf['mouse'])!='undefined') {
					cmd[keyconf['mouse']] = true;
					self.fireEvent(keyconf['mouse'], [true]);
				}
				mouseRef = ev.client;
			},
			'mousemove': function (ev) {
				mouse = ev.client;
			},
			'mouseup': function (/*ev*/) {
				if(typeof(keyconf['mouse'])!='undefined') {
					cmd[keyconf['mouse']] = false;
					self.fireEvent(keyconf['mouse'], [false]);
				}
			}
		});
		self.active = function (nome) {
			return !!cmd[nome];
		};
		self.mouse = function (nref) {
			if(nref) {
				mouseRef = nref;
			}
			return {
				'pos': Object.clone(mouse),
				'ref': Object.clone(mouseRef)
			};
		};
		self.ativos = function () {
			return Object.filter(cmd, function (v, n) {
				return v;
			});
		};
		self.setCmd = function (tecla, nome) {
			var valido = (typeof(tecla)=='string' && typeof(nome) == 'string');
			if(valido) {
				keyconf[tecla] = nome;
			}
			return valido;
		}.overloadSetter();
	}
});
