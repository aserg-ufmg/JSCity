require('./MooTools-Core-Server.js');
var fs = require('fs'),
	path = require('path'),
	mysql = require('mysql'),
	nomnom = require('nomnom'),

	config = require('./config.json'),
	debug = !!config.debug,

	argumentos, listaStats = [],
	pool = mysql.createPool(config.conexoes[config.conexao]);


nomnom.options({
	'output': {
		abbr: 'o',
		help: 'Arquivo de saída dos resultados.',
		default: './stats.json'
	},
	'filhos': {
		abbr: 'f',
		help: 'Inclui estatísticas dos itens filhos.',
		flag: true
	},
	'verbose': {
		abbr: 'v',
		help: 'Imprime mensagens extras além dos erros.',
		flag: true
	},
	'start': {
		abbr: 's',
		help: 'Cidade inicial a verificar. Inicia com "0".',
		default: 0
	},
	'limit': {
		abbr: 'l',
		help: 'Quantidade de cidades a verificar. "0" ou menor verifica todas.',
		default: 0
	}
});

argumentos = nomnom.parse();
argumentos.output = path.resolve(process.cwd(), argumentos.output);
argumentos.start = parseInt(argumentos.start);
argumentos.limit = parseInt(argumentos.limit);

function trataErro(msg, err) {
	console.log(msg);
	if(debug) {
		console.log(err);
	}
	process.exit();
}

ObjStats = new Class({
	Implements: [Events],
	filhos: [],
	initialize: function (tb, fk, registro) {
		this.ref = registro;
		this.tb = tb;
		this.fk = fk;
		if(argumentos.verbose) {
			console.log('Inicializando: ' + tb + '.' + fk + '=' + this.ref.id);
		}
	},
	getChildren: function (connection, tb, fk) {
		var sSQL = "SELECT * FROM ?? WHERE ?? = ?";
		if(argumentos.verbose) {
			console.log('Filhos: ' + tb + '.' + this.fk + '=' + this.ref.id);
		}
		sSQL = mysql.format(sSQL, [tb, this.fk, this.ref.id]);
		connection.query(sSQL, function (err, linhas, fields) {
			if(err) {
				trataErro('Falha ao obter filhos.', err);
			} else {
				linhas.each(function (registro, i) {
					var filho = new ObjStats(tb, fk, registro);
					filho.pai = this;
					this.addUp('num' + filho.tipo(), 1);
					if(registro.height && registro.distrito_id) {
						filho.addUp('loc', registro.height);
					}
					this.filhos.push(filho);
				}.bind(this));
				this.fireEvent('filhos', [tb, fk]);
			}
		}.bind(this));
	},
	addUp: function (nome, n) {
		if(!this[nome]) {
			this[nome] = 0;
		}
		this[nome] += n;
		if(this.pai) {
			this.pai.addUp(nome, n);
		}
	},
	isDir: function () {
		var rex = /.+\(dir\).*/i;
		return this.tb == 'tb_distrito' && this.ref.tooltip && rex.test(this.ref.tooltip);
	},
	isFile: function () {
		return this.tb == 'tb_distrito' && !this.isDir();
	},
	tipo: function () {
		if(this.isDir()) {
			return 'Dir';
		} else if(this.isFile()) {
			return 'File';
		} else {
			return (this.ref.name == 'anonima')?'FnAnon':'FnNamed';
		}
	},
	toJSON: function () {
		var ret = {};
		Object.each(this, function (v, n) {
			if(typeOf(v)=='string' || typeOf(v)=='number') {
				ret[n] = v;
			}
		});
		ret.ref = this.ref;
		//ret.filhos = this.filhos;
		return ret;
	}
});

pool.getConnection(function (err, connection) {
	var sSQL = "SELECT * FROM ?? ORDER BY ??, ??", formato = ['tb_cidade', 'name', 'id'];
	if(err) {
		trataErro('Falha ao obter conexão.', err);
	} else {
		if(argumentos.limit>0 && argumentos.start >=0) {
			sSQL += ' LIMIT ?, ?';
			formato.append([argumentos.start, argumentos.limit]);
		}
		sSQL = mysql.format(sSQL, formato);
		connection.query(sSQL, function (err, rows, fields) {
			if(err) {
				trataErro('Falha ao obter cidades.', err);
			} else {
				// total de linhas de código, fn anonimas, fn nomeadas, diretorios, arquivos
				function maisFilhos(tb, fk) {
					this.filhos.each(function (filho) {
						filho.addEvent('filhos', maisFilhos);
						maisFilhos.i++;
						filho.getChildren(connection, tb, fk);
						if(tb == 'tb_distrito') {
							maisFilhos.i++;
							filho.getChildren(connection, 'tb_construcao', 'construcao_id');
						}
					});
					maisFilhos.i--;
					if(debug) {
						console.log('Tarefas', maisFilhos.i);
					}
					if(maisFilhos.i<=0) {
						if(argumentos.verbose) {
							console.log('Gravando dados...');
						}
						var stats = JSON.stringify(listaStats, null, '\t');
						fs.writeFile(argumentos.output, stats, {flag: 'w+'}, function (err) {
							if(err) {
								trataErro('Falha ao gravar arquivo '+argumentos.output, err);
							} else {
								console.log('Gravado em '+argumentos.output);
							}
							process.exit();
						});
						connection.release();
					}
				}
				if(rows.length) {
					maisFilhos.i = 0;
					rows.each(function (registro) {
						var cidade = new ObjStats('tb_cidade', 'cidade_id', registro);
						listaStats.push(cidade);
						cidade.addEvent('filhos', maisFilhos);
						maisFilhos.i++;
						cidade.getChildren(connection, 'tb_distrito', 'distrito_id');
					});
				} else {
					console.log('Nenhuma cidade selecionada.');
					connection.release();
					process.exit();
				}
			}
		});
	}
});
