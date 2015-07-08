Bloco = new Class({
	Implements: [Events, Options],
	options: {
		cor: 0x008800,
		largura: 1,
		altura: 3,
		profundidade: 1,
		margem: 0,
		espacoFilhos: 2,
		x: 0,
		y: 0,
		z: 0,
		autoResize: false
	},
	_pause: true,
	_filhos: [],
	pai: null,
	initialize: function (nome, cena, ops) {
		this.setOptions(ops)
		this.cena = cena;
		this.nome = nome;
		this.reset();
		this.fireEvent('carregado');
	},
	getAltura: function () {
		var h = this.options.altura, maxF = 0;
		this._filhos.each(function (filho) {
			var hF = filho.getAltura();
			if(hF > maxF) {
				maxF = hF;
			}
		});
		return h + maxF;
	},
	reset: function () {
		var geometry = new THREE.BoxGeometry(1, 1, 1),
			//tex = null,
			material = new THREE.MeshPhongMaterial({color: this.options.cor, map: THREE.ImageUtils.loadTexture( "img/rect.png" )/**/});
		this._pause = true;
		if(this.mesh) {
			this.cena.remove(this.mesh);
		}
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
		this.mesh = new THREE.Mesh(geometry, material);
	/*	this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;*/
		this.mesh.name = this.nome?this.nome:(this.name?this.name:'');
		this.cena.add(this.mesh);
		this.destroiFilhos();
		this.unPauseUp();
	},
	addFilho: function (nome, ops) {
		var n = this._filhos.length;
		if(typeof(nome)=='string') {
			this._filhos[n] = new Bloco(nome, this.cena, ops);
		} else if(instanceOf(nome, Bloco)) {
			this._filhos[n] = nome;
		} else {
			n = -1;
		}
		if(n>=0) {
			this._filhos[n].pai = this;
			this.unPauseUp();
		}
		return n;
	},
	// remove a pause deste elemento e encadeia para os elementos pais
	unPauseUp: function () {
		this._pause = false;
		if(this.pai) {
			this.pai.unPauseUp();
		}
	},
	getFilho: function (i) {
		return this._filhos[i];
	},
	atualizar: function (timestamp) {
		if(this._pause) return;

		var o = this.options,
			colunas = this._filhos.length,
			coluna = 0,
			linha = 0,
			x = o.x,
			y = o.y + o.altura,
			z = o.z,
			xm = x,
			pm = 0,
			xi = x, zi = z,
			ex = 0, ez = 0;
		colunas = colunas.sqrt().floor().max(1);

		if(o.autoResize) {
			x += o.margem;
			xi += o.margem;
			z += o.margem;
			zi += o.margem;
		}

		this._filhos.each(function (filho, i) {
			if(coluna) {
				x += o.espacoFilhos;
				//ex += o.espacoFilhos;
			} else if(linha) {
				z += o.espacoFilhos;
				//ez += o.espacoFilhos;
			}
			filho.setOptions({
				x: x,
				y: y,
				z: z
			});
			filho._pause = false;
			filho.atualizar(timestamp);

			x += filho.options.largura;
			if(pm < filho.options.profundidade) {
				pm = filho.options.profundidade;
			}
			if(++coluna == colunas || (i+1)==this._filhos.length) {
				coluna = 0;
				++linha;
				if(xm < x) {
					xm = x;
				}
				x = xi;
				z += pm;
				pm = 0;
			}
		}.bind(this));

		if(o.autoResize) {
			this.setOptions({
				largura: xm - xi + o.margem*2,
				profundidade: z - zi + o.margem*2
			});
		}

		this.mesh.scale.set(o.largura, o.altura, o.profundidade);
		this.mesh.position.set(o.x, o.y, o.z);
		//this.mesh.updateMatrix();
		// performance: o estado não precisa ser atualizado sem motivo
		this._pause = true;
	},
	esconder: function () {
		this.mesh.visible = false;
		this._filhos.each(function (filho) {
			filho.esconder();
		});
	},
	mostrar: function () {
		this.mesh.visible = true;
		this._filhos.each(function (filho) {
			filho.mostrar();
		});
	},
	/**
	 * Destrutor do objeto, para remoção real deve-se usar "obj = null" ou "delete obj" logo após este método.
	 * Ex.:
	 * 	obj.destroi();
	 * 	obj = null;
	 */
	destroi: function () {
		this.fireEvent('destroi');
		this.removeEvents();
		this._pause = true;
		this.destroiFilhos();
		this.cena.remove(this.mesh);
	},
	destroiFilhos: function () {
		this._filhos.each(function (filho, i) {
			this._filhos[i].destroi();
		}.bind(this));
		this._filhos = [];
	}
});


BlocoAjax = new Class({
	Extends: Bloco,
	options: {
		urlItem: 'bloco?id={id}',
		urlFilhos: 'blocos?bloco_id={id}',
		classFilho: null
	},
	initialize: function (registro, cena, ops) {
		this.setOptions(ops);
		if(this.options.classFilho === null) {
			this.options.classFilho = this.$constructor;
		}
		this.cena = cena;
		if(typeOf(registro)=='number') {
			this.id = registro;
			this.carregar();
		} else {
			this.set(registro);
			this.fireEvent('carregado');
		}
	},
	set: function (registro) {
		this.fireEvent('inicializando');
		Object.each(registro, function (valor, nome) {
			this[nome] = valor;
		}.bind(this));
		this.reset();
		Object.each(registro, function (valor, nome) {
			this.mesh.userData[nome] = valor;
		}.bind(this));
		this.carregaFilhos();
	},
	carregar: function () {
		if(this.id) {
			new Request.JSON({
				url: this.options.urlItem.replace('{id}', this.id),
				method: 'get',
				onSuccess: function (resultado) {
					this.set(resultado.registro);
					this.fireEvent('carregado');
				}.bind(this)
			}).send();
		}
	},
	_completo: function () {
		if(this.estaCompleto()) {
			this._pause = false;
			this.fireEvent('completo');
		}
	},
	estaCompleto: function () {
		var ok = this._requests==0;
		if(ok && this._filhos.length>0) {
			ok = this._filhos.every(function (filho) {
				return filho.estaCompleto();
			});
		}
		return ok;
	},
	_requests: 0,
	carregaFilhos: function (url, classFilho, destroi) {
		if(this.id) {
			if(typeof(url)!='string' || url == '') {
				url = this.options.urlFilhos;
			}
			if(typeOf(classFilho)!='class') {
				classFilho = this.options.classFilho;
			}
			if(destroi === null || typeof(destroi)=='undefined') {
				destroi = true;
			}
			++this._requests;
			new Request.JSON({
				url: url.replace('{id}', this.id),
				method: 'get',
				onSuccess: function (resultado) {
					--this._requests;
					var filhos = resultado.registro?[resultado.registro]:resultado.registros;
					if(destroi) {
						this.destroiFilhos();
					}
					filhos.each(function (item) {
						var ops = {
							onFilhos: function () {
								this.fireEvent('filhos');
								this.fireEvent('filhosFilho');
							}.bind(this),
							onCompleto: this._completo.bind(this)
						}, filho;
						if(item.color) {
							ops.cor = parseInt(item.color);
						}
						if(item.height) {
							ops.altura = item.height;
						}
						if(item.width) {
							ops.largura = item.width;
							ops.profundidade = item.width;
						}
						if(item.name) {
							item.name = this.mesh.name + '>' + item.name;
							if(item.tooltip) {
								item.tooltip += ' .. ' + item.name;
							}
						}
						if(!classFilho) console.log(this);
						filho = new classFilho(item, this.cena, ops);
						this.addFilho(filho);
						this.fireEvent('filho', [filho]);
					}.bind(this));
					this.fireEvent('filhos');
					this.fireEvent('filhosLocal');

					if(filhos.length == 0 && this._requests == 0) {
						this._completo();
					}
				}.bind(this)
			}).send();
		}
	}
});

Construcao = new Class({
	Extends: BlocoAjax,
	options: {

		espacoFilhos: 0,
		margem: 0,

		urlItem: 'api/construcao/-/id={id}',
		urlFilhos: 'api/construcoes/-/construcao={id}',
		classFilho: null,
		cor: 0xBBDDFF
	},
	construcoes: function () {
		return this.carregaFilhos.apply(this, arguments);
	}
});

Distrito = new Class({
	Extends: BlocoAjax,
	options: {
		urlItem: 'api/distrito/-/id={id}',
		urlFilhos: 'api/construcoes/-/distrito={id}',
		classFilho: Construcao,
		cor: 0xDDBBFF,
		margem: 10,
		autoResize: true
	},
	_loadDist: true,
	initialize: function (registro, cena, ops) {
		this.addEvent('filhosLocal', function () {
			if(this._loadDist) {
				this.distritos();
			}
		}, true);
		this.parent(registro, cena, ops);
	},
	construcoes: function () {
		return this.carregaFilhos();
	},
	distritos: function () {
		this._loadDist = false;
		return this.carregaFilhos('api/distritos/-/distrito={id}', Distrito, false);
	}
});

Cidade = new Class({
	Extends: BlocoAjax,
	options: {
		urlItem: 'api/cidade/-/id={id}',
		urlFilhos: 'api/distritos/-/cidade={id}',
		classFilho: Distrito,
		cor: 0xDDDDDD,
		margem: 10,
		espacoFilhos: 5,
		autoResize: true
	},
	distritos: function () {
		return this.carregaFilhos.apply(this, arguments);
	}
});

