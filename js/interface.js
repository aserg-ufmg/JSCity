/*
Requer: [Class, Class.Extras, Element, Request.JSON, Cidade]
*/
Interface = new Class({
	Implements: [Events],
	_listaCidades: [],
	_atualizarDOM: true,
	_container: null,
	_campos: {},
	_camposAtualizar: [],
	cidade: null,
	initialize: function (el, cena, camera) {
		el = (el)? $(el) : $('interface');
		this.cena = cena;
		this.camera = camera;
		this._vwCidades = $('cidades');
		if(!this._vwCidades) {
			this._vwCidades = new Element('ul', {'class':'cidades'});
			el.grab(this._vwCidades);
		}
		this._container = el;

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
				this.cidade = null;
				this.setCidade(this.qs.id);
			}
		}

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
				var conteudo = bt.getNext('.conteudo'),
					dsp, oculto;
				if(conteudo) {
					dsp = conteudo.getStyle('display');
					oculto = (dsp == 'none');
					if(oculto) {
						dsp = 'block';
					}
					conteudo.setStyles({
						'position':'absolute',
						'left': '50%',
						'top': '10%',
						'z-index': 1001
					});
					bt.addEvent('click', function pop(ev) {
						if(oculto) {
							var tamW = window.getSize(),
								tamC;
							conteudo.setStyle('display', dsp);
							// se elemento estiver oculto: size=[0,0]
							tamC = conteudo.getSize();
							conteudo.setStyles({
								'left': (tamW.x - tamC.x)/2,
								'top': (tamW.y - tamC.y)/2
							});
							if(overlay) {
								overlay.setStyles({
									'display': 'block',
									'width': tamW.x,
									'height': tamW.y
								});
								overlay.addEvent('click', pop);
							}
						} else {
							conteudo.setStyle('display', 'none');
							if(overlay) {
								overlay.setStyle('display', 'none');
								overlay.removeEvents();
							}
						}
						oculto = !oculto;
					});
					bt.setStyle('cursor', 'pointer');
				}
			});
		});

		$$('.alternar').each(function (e) {
			var dsp = e.getStyle('display'),
				oculto = (dsp=='none'),
				head = e.getElements('h1,h2,h3,h4,h5,h6'),
				btn = new Element('button', {
					text: 'alternar',
					events: {
						'click': function (ev) {
							if(oculto) {
								e.setStyle('display', dsp);
							} else {
								e.setStyle('display', 'none');
							}
							oculto = !oculto;
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

		this.listaCidades();
	},
	setCampo: function (nome, item, valor) {
		if(!this._campos[nome]) {
			this._campos[nome] = {'anterior':{}};
		}
		if(this._campos[nome][item] != valor) {
			// comparando objetos, {"a":0, "b":0} != {"b":0, "a":0} porem {"a":0, "b":0} == {"a":0, "b":0}
			if(typeof(valor)!='object' || JSON.stringify(valor)!=JSON.stringify(this._campos[nome][item])) {
				this._campos[nome]['anterior'][item] = this._campos[nome][item];
				this._campos[nome][item] = valor;
				if(item != 'dom') {
					this._camposAtualizar.push([nome, item]);
				}
			}
		}
	},
	listaCidades: function (pagina) {
		var url = 'api/cidades';
		if(typeOf(pagina)!='number') {
			pagina = 0;
		}
		if(pagina>0) {
			url += '?p=' + pagina;
		}
		new Request.JSON({
			url: url,
			onSuccess: function (lista) {
				if(lista.mensagem != '') {
					console.log(lista.mensagem);
				} else {
					this._listaCidades.combine(lista.registro ? Array.from(lista.registro) : lista.registros);
					this._listaCidades.sort(function (a, b) {
						return a.name.localeCompare(b.name)||(a.id-b.id);
					});
					this._atualizarDOM = true;
					this.fireEvent('cidades');
				}
			}.bind(this)
		}).send();
	},
	atualizar: function(timestamp) {
		var campo, el;
		if(this._atualizarDOM && this._container) {
			this._atualizarDOM = false;
			this._vwCidades.empty();
			if(this._listaCidades.length) {
				this._listaCidades.each(function (cidade) {
					el = new Element('span', {
						'class': 'cidade',
						'styles': {
							'cursor':'pointer'
						},
						'events': {
							'click': function (cidade, ref) {
								this.getParent('ul').getElements('li>*').removeClass('ativo');
								this.addClass('ativo');
							}
						},
						'html': '<i class="fa fa-cube"></i> ' + cidade.name
					});
					el.addEvent('click', this.setCidade.pass([cidade], this));
					this._vwCidades.grab(new Element('li').grab(el));
				}.bind(this));
			} else {
				this._vwCidades.set('html', '<li><span onclick="location.reload()">Nenhuma cidade encontrada.</span></li>');
			}
			this.fireEvent('atualizado');
		}
		if(this.cidade) {
			this.cidade.atualizar(timestamp);
			//luz2.position.set(100, 100, 5);
		}
		while(this._camposAtualizar.length) {
			campo = this._camposAtualizar.pop();
			if(this._campos[campo[0]]['dom']) {
				this._campos[campo[0]]['dom'].set(campo[1], this._campos[campo[0]][campo[1]]);
			}
		}
	},
	nivelarCamera: function () {},
	resetaCamera: function () {
		if(this.cidade) {
			var refCamera = Object.clone(this.cidade.mesh.position);
			/*this.camera.position.set(
				refCamera.x + (this.cidade.options.largura * .5),
				refCamera.y + (this.cidade.getAltura() + 12),
				refCamera.z + (this.cidade.options.profundidade * .5)
			);*/
			this.camera.position.set(1300, 800, 500);
			this.camera.lookAt(refCamera);
		}
	},
	escondeLoader: function () {
		if(this._loader) {
			this._loader.setStyle('display', 'none');
		}
	},
	mostraLoader: function () {
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
	setCidade: function(cidade) {
		this.mostraLoader();
		if(this.cidade) {
			this.cidade.set(cidade);
		} else {
			this.cidade = new Cidade(cidade, this.cena, {
				'onFilhos': this.resetaCamera.bind(this),
				'onCompleto': function () {
					this.escondeLoader();
					this.setCampo('nomeCidade', 'text', this.cidade.name);
				}.bind(this)
			});
			this.setCampo('nomeCidade', 'dom', $('nomeCidade'));
		}
	}
});

