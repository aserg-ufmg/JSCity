	/**
	 * Requer: [Class, Class.Extras, Element, Request.JSON, City].
	 *This class Manages the interface elements , creates a list of cities etc
	 *
	 * @class Interface
	 */
	Interface = new Class({
		Implements: [Events],
		_listCities: [],
		_updateDOM: true,
		_container: null,
		_fields: {},
		_fieldsUpdate: [],
		city: null,
		/**
		 * Class constructor
		 *
		 * @constructor
		 * @method initialize
		 * @param {String} el
		 * @param {THREE.Scene} scene
		 * @param {Object} camera
		 *
		 * @return {void}
		*/
		initialize: function (el, scene, camera) {
			el = (el)? $(el) : $('interface');
			this.scene = scene;
			this.camera = camera;
			this._vwCities = $('cities');
			if(!this._vwCities) {
				this._vwCities = new Element('ul', {'class':'cities'});
				el.grab(this._vwCities);
			}
			this._container = el;
			/**
			 * Return query string to use without combo.
			*/
			this.qs = (function (a) {
				if (a == "")
					return {};
				var b = {};
				for (var i = 0; i < a.length; ++i)
				{
					var p = a[i].split('=', 2);
					if (p.length == 1)
						b[p[0]] = "";
					else
						b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
				}
				return b;
			})(window.location.search.substr(1).split('&'));

			if(this.qs.id) {
				this.qs.id = parseInt(this.qs.id);
				if(this.qs.id && this.qs.id>0) {
					this.city = null;
					this.setCity(this.qs.id);
				}
			}
			/**
			 * Responsable for the help popup.
			 *
			 * @method
			 * @param {} e
			 *
			 *
			 * @return {void}
			*/
			$$('.pop').each(function (e) {
				var overlay = e.hasClass('with-overlay')?
					new Element('div', {
						styles: {
							display: 'none',
							position: 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							'background-color':'rgba(0,0,0,.7)',
							'z-index':1000
						}
					})
					: null;
				if(overlay) {
					e.getParent().grab(overlay);
				}
				e.getChildren('.botao').each(function (bt) {
					var content = bt.getNext('.content'),
						dsp, hidden;
					if(content) {
						dsp = content.getStyle('display');
						hidden = (dsp == 'none');
						if(hidden) {
							dsp = 'block';
						}
						content.setStyles({
							'position':'absolute',
							'left': '50%',
							'top': '10%',
							'z-index': 1001
						});
						bt.addEvent('click', function pop(ev) {
							if(hidden) {
								var sizeW = window.getSize(),
									sizeC;
								content.setStyle('display', dsp);
								// se elemento estiver hidden: size=[0,0]
								sizeC = content.getSize();
								content.setStyles({
									'left': (sizeW.x - sizeC.x)/2,
									'top': (sizeW.y - sizeC.y)/2
								});
								if(overlay) {
									overlay.setStyles({
										'display': 'block',
										'width': sizeW.x,
										'height': sizeW.y
									});
									overlay.addEvent('click', pop);
								}
							} else {
								content.setStyle('display', 'none');
								if(overlay) {
									overlay.setStyle('display', 'none');
									overlay.removeEvents();
								}
							}
							hidden = !hidden;
						});
						bt.setStyle('cursor', 'pointer');
					}
				});
			});
			/**
			 * Alterantiva for menu display.
			 *
			 * @method
			 * @param {} e
			 *
			 *
			 * @return {void}
			*/
			$$('.alternate').each(function (e) {
				var dsp = e.getStyle('display'),
					hidden = (dsp=='none'),
					head = e.getElements('h1,h2,h3,h4,h5,h6'),
					btn = new Element('button', {
						text: 'alternate',
						events: {
							'click': function (ev) {
								if(hidden) {
									e.setStyle('display', dsp);
								} else {
									e.setStyle('display', 'none');
								}
								hidden = !hidden;
							}
						}
					});
				if(head[0]) {
					btn.set('text', head[0].get('text'));
				}
				head = null;
				btn.inject(e, 'before');
				btn.fireEvent('click');
			});

			this.listCities();
		},
		/**
		 * seta valores aos campos do topbar
		 *
		 * @method setField
		 * @param {} name
		 * @param {} item
		 * @param {} value
		 *
		 * @return {void}
		*/
		setField: function (name, item, value) {
			if(!this._fields[name]) {
				this._fields[name] = {'previous':{}};
			}
			if(this._fields[name][item] != value) {
				if(typeof(value)!='object' || JSON.stringify(value)!=JSON.stringify(this._fields[name][item])) {
					this._fields[name]['previous'][item] = this._fields[name][item];
					this._fields[name][item] = value;
					if(item != 'dom') {
						this._fieldsUpdate.push([name, item]);
					}
				}
			}
		},
		/**
		 * Load list of cities
		 *
		 * @method listCities
		 * @param {} page
		 *
		 * @return {void}
		*/
		listCities: function (page) {
			var url = 'api/cities';
			if(typeOf(page)!='number') {
				page = 0;
			}
			if(page>0) {
				url += '?p=' + page;
			}
			new Request.JSON({
				url: url,
				onSuccess: function (list) {
					if(list.message != '') {
						console.log(list.message);
					} else {
						this._listCities.combine(list.register ? Array.from(list.register) : list.registers);
						this._listCities.sort(function (a, b) {
							return a.name.localeCompare(b.name)||(a.id-b.id);
						});
						this._updateDOM = true;
						this.fireEvent('cities');
					}
				}.bind(this)
			}).send();
		},
		/**
		 * updated inteface status according to the selection of the city combo
		 *
		 * @method update
		 * @param {} timestamp
		 *
		 * @return {void}
		*/
		update: function(timestamp) {
			var field, el;
			if(this._updateDOM && this._container) {
				this._updateDOM = false;
				this._vwCities.empty();
				if(this._listCities.length) {
					this._listCities.each(function (city) {
						el = new Element('span', {
							'class': 'city',
							'styles': {
								'cursor':'pointer'
							},
							'events': {
								'click': function (city, ref) {
									this.getParent('ul').getElements('li>*').removeClass('active');
									this.addClass('active');
								}
							},
							'html': '<i class="fa fa-cube"></i> ' + city.name
						});
						el.addEvent('click', this.setCity.pass([city], this));
						this._vwCities.grab(new Element('li').grab(el));
					}.bind(this));
				} else {
					this._vwCities.set('html', '<li><span onclick="location.reload()">No city was found.</span></li>');
				}
				this.fireEvent('updated');
			}
			if(this.city) {
				this.city.update(timestamp);
			}
			while(this._fieldsUpdate.length) {
				field = this._fieldsUpdate.pop();
				if(this._fields[field[0]]['dom']) {
					this._fields[field[0]]['dom'].set(field[1], this._fields[field[0]][field[1]]);
				}
			}
		},
		/**
		 * Adjusts the camera position according to the base positionn
		 *
		 * @method levelCamera
		 *
		 * @return {void}
		*/
		levelCamera: function () {},
		/**
		 * Reposition the camera in a standard place - spacebar
		 *
		 * @method resetCamera
		 *
		 * @return {void}
		*/
		resetCamera: function () {
			if(this.city) {
				var refCamera = Object.clone(this.city.mesh.position);
				this.camera.position.set(1300, 800, 500);
				this.camera.lookAt(refCamera);
			}
		},
		/**
		 * Hide loader
		 *
		 * @method hideLoader
		 *
		 * @return {void}
		*/
		hideLoader: function () {
			if(this._loader) {
				this._loader.setStyle('display', 'none');
			}
		},
		/**
		 * Show loader
		 *
		 * @method showLoader
		 *
		 * @return {void}
		*/
		showLoader: function () {
			if(this._loader) {
				this._loader.setStyle('display', 'block');
			} else {
				this._loader = new Element('div', {
					'class': 'loader',
					'styles': {
						'position': 'absolute',
						'top': 0,
						'left': 0,
						'overflow': 'hidden',
						'height': '100%',
						'width': '100%',
						'background-color': 'rgba(0, 0, 0, .7)',
						'text-align': 'center',
						'z-index':1000
					}
				}).grab(new Element('div', {
					'text': 'Wait ... After loading use mouse scroll to zoom in/out',
					'styles': {
						'background-color': '#FFF',
						'border': '1px solid #DDD',
						'color': '#000',
						'display': 'inline-block',
						'margin': '1em auto',
						'padding': '.25em .5em'
					}
				}));
				document.body.grab(this._loader);
			}
		},
		/**
		 * Sets the current city
		 *
		 * @method setCity
		 *
		 * @return {void}
		*/
		setCity: function(city) {
			this.showLoader();
			if(this.city) {
				this.city.set(city);
			} else {
				this.city = new City(city, this.scene, {
					'onChildren': this.resetCamera.bind(this),
					'onComplete': function () {
						this.hideLoader();
						this.setField('nameCity', 'text', this.city.name);
					}.bind(this)
				});
				this.setField('nameCity', 'dom', $('nameCity'));
			}
		}
	});

