var fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	mysql = require('mysql'),
	nomnom = require('nomnom'),
	esprima = require('./esprima.js'),

	config = require('./config.json'),
	debug = !!config.debug,

	CONST_ANONIMA = 'Anonymous function',

	argumentos, caminhoFornecido, listaAST = {};

require('./MooTools-Core-Server.js');

nomnom.options({
	'cidade': {
		abbr: 'c',
		help: 'Nome da cidade a criar.',
		default: ''
	},
	'projeto': {
		position: 0,
		metavar: 'PATH_PROJETO',
		help: 'Caminho do projeto.',
		required: true
	},
	'verbose': {
		abbr: 'v',
		help: 'Imprime mensagens extras além dos erros.',
		flag: true
	}
});
argumentos = nomnom.parse();
caminhoFornecido = argumentos.projeto;
argumentos.projeto = path.resolve(process.cwd(), argumentos.projeto);
if(!argumentos.cidade || argumentos.cidade=='') {
	argumentos.cidade = path.basename(argumentos.projeto);
}
//console.log(argumentos);
//process.exit();

fs.exists(argumentos.projeto, function(exists) {
	if(exists) {
		if(argumentos.verbose) {
			console.log('Iniciando varredura.');
		}
		processaPath(argumentos.projeto);
	} else {
		console.log('Caminho incorreto: ' + argumentos.projeto);
	}
});

/**
 * Não é um semaforo verdadeiro
 */
Semaforo = new Class(function (cb, nome, max) {
	var itens = {
		'padrao':{'cb':function(){}, n:0, max: Infinity}
	};
	function _nome(val) {
		if(typeof(val)!='string') {
			val = 'padrao';
		}
		return val;
	}
	this.inicio = function(cb, nome, max) {
		nome = _nome(nome);
		if(typeof(max)!='number') {
			max = Infinity;
		}
		itens[nome] = {'cb': cb, 'n': 0, 'max': max};
	};
	this.aumentar = function (nome) {
		nome = _nome(nome);
		if(itens[nome].n < itens[nome].max) {
			++itens[nome].n;
			return false;
		}
		return true;
	};
	this.fim = function(nome) {
		nome = _nome(nome);
		--itens[nome].n;
		if(itens[nome].n<=0) {
			itens[nome].cb.call();
		}
	};
	this.inicio(cb, nome, max);
	return this;
});
Espera = new Semaforo(processaAST);

function processaPath(caminho) {
	Espera.aumentar();
	fs.stat(caminho, function direcionaTipo(error, stats) {
		if(error) {
			console.log('Caminho inválido: ' + caminho);
			Espera.fim();
		} else if(stats.isDirectory()) {
			if(argumentos.verbose) {
				console.log('Processando diretório: ' + caminho);
			}
			fs.readdir(caminho, function (error, arqs) {
				if(error) {
					console.log(error);
				} else {
					var i;
					arqs.sort();
					for(i=0; i<arqs.length; ++i) {
						processaPath(path.resolve(caminho, arqs[i]));
					}
				}
				Espera.fim();
			});
		} else {
			var tipo = mime.lookup(caminho), validos = ['text/javascript', 'application/javascript'];
			if(validos.indexOf(tipo)<0) {
				caminho = path.relative(argumentos.projeto, caminho);
				if(argumentos.verbose) {
					console.log('Ignorando arquivo: ' + caminho);
				}
				Espera.fim();
			} else {
				fs.readFile(caminho, function(error, content) {
					var err, tmp;
					caminho = path.relative(argumentos.projeto, caminho);
					if(error) {
						console.log(error);
					} else {
						if(caminho == '') {
							// projeto de um só arquivo
							caminho = path.basename(argumentos.projeto);
						}
						if(argumentos.verbose) {
							console.log('Analisando arquivo: ' + caminho);
						}
						err = false;
						try {
							tmp = esprima.parse(content, {loc: true, tolerant: true});
							if(tmp.errors && tmp.errors.length) {
								console.log(caminho, tmp);
								err = tmp.errors;
								tmp = {
									type: 'Program',
									tooltip: 'File: ' + caminho + ', ' + tmp.errors[0].toString(),
									loc: {
										start: {
											line: 1
										},
										end: {
											line: err.length
										}
									}
								};
							}
						} catch(e) {
							console.log(caminho, e);
							tmp = {
								type: 'Program',
								tooltip: 'File: ' + caminho + ', ' + e.toString(),
								loc: {
									start: {
										line: 1
									},
									end: {
										line: 1
									}
								}
							};
						}
						(function (obj, caminho, val) {
							var i, t,
								atual = '',
								partes = caminho.split(path.sep);
							for (i = 0, t = partes.length; i < t; i++) {
								if(i>0) {
									atual += path.sep;
								}
								atual += partes[i];
								if (!hasOwnProperty.call(obj, partes[i])) {
									obj[partes[i]] = {
										filhos: {},
										caminho: atual
									};
								}

								if((i+1)<t) {
									obj = obj[partes[i]].filhos;
								} else {
									obj[partes[i]] = val;
								}
							}
						})(listaAST, caminho, tmp);
					}
					Espera.fim();
				});
			}
		}
	});
}

function processaAST() {
	var arvoreBD = {
			'name': argumentos.cidade,
			'tooltip': argumentos.cidade + ' @ ' + caminhoFornecido,
			'tb_distrito': []
		},
		cores = {
			'diretorio': '0xF0AD4E',
			'Program': '0xD9534F',
			'FunctionDeclaration': '0x337AB7',
			'FunctionExpression': '0x337AB7'
		};
	cores[CONST_ANONIMA] = '0x4CAE4C';
/*
	var n = 0, timer;
	timer = setInterval(function () {
		progresso(n++, 60);
		if(n>60) {
			clearInterval(timer);
		}
	}, 1500);
*/

	if(argumentos.verbose) {
		console.log('Preparando cidade para inclusão em BD.');
	}
	function constroi(arvore, nome, deep, pai) {
		if(!deep) deep = 0;
		var registro = null, loc;

		function add(no) {
			if(no){
				var filho, deepLocal = deep, onde = registro||pai;
				if(no.type == 'BlockStatement') {
					++deepLocal;
				} else if(onde.width && no.type == 'VariableDeclarator') {
					//onde.width++;
					onde.addWidth(1);
				}
				filho = constroi(no, nome, deepLocal, onde);
				if(filho) {
					if(onde.addWidth && filho.width) {
						onde.addWidth(filho.width);
					}
					filho.pai = onde;
					onde.tb_construcao.push(filho);
				}
			}
		}

		if(typeOf(arvore)=='object') {
			if(arvore.type=='Program' || arvore.type=='FunctionDeclaration' || arvore.type=='FunctionExpression') {
				loc = 1+arvore.loc.end.line-arvore.loc.start.line;
				if(arvore.type != 'Program') {
					nome = (arvore['id'] && (typeof(arvore['id']['name'])=='string')?arvore['id']['name']:CONST_ANONIMA);
					registro = {
						name: nome,
						height: loc,
						width: 1,
						addWidth: function (n) {
							this.width += n;
							if(this.pai && this.pai.addWidth) {
								this.pai.addWidth(n);
							}
						},
						color: cores[nome==CONST_ANONIMA?nome:arvore.type],
						tooltip: arvore.tooltip || nome + ', LOC: ' + loc + ' [' + arvore.loc.start.line + '-' +arvore.loc.end.line + ']',
						tb_construcao: []
					};
				} else {
					registro = {
						name: nome,
						color: cores[arvore.type],
						tooltip: arvore.tooltip || nome + ', LOC: ' + loc + ' [' + arvore.loc.start.line + '-' +arvore.loc.end.line + ']',
						tb_construcao: []
					};
				}
			}
			Object.each(arvore, add);
		} else if(Array.isArray(arvore)) {
			arvore.each(add);
		}
		return registro;
	}

	// gerar arvore para BD
	// formato = {campo: Mixed valor[, campo: Mixed valor][, filho: Array valores]]}
	function dir(aAST, aBD) {
		Object.each(aAST, function (ast, nome) {
			var dist;
			if(ast.type) {
				dist = constroi(ast, nome);
				Object.each(dist, function excluiAuxiliares(o, n, ref) {
					if(n=='pai' || n=='addWidth') {
						delete ref[n];
					} else if(typeof(o) == 'object') {
						Object.each(o, excluiAuxiliares);
					} else if(Array.isArray(o)) {
						o.each(o, excluiAuxiliares);
					}
				});
			} else {
				dist = {
					name: nome,
					color: cores['diretorio'],
					tooltip: 'Folder: ' + ast.caminho,
					tb_distrito: [],
					tb_construcao: []
				};
				dir(ast.filhos, dist);
			}
			aBD.tb_distrito.push(dist);
		});
	}
	dir(listaAST, arvoreBD);

	if(debug) {
		console.log(JSON.stringify(listaAST, null, '\t'));
		console.log(JSON.stringify(arvoreBD, null, '\t'));
		process.exit();
	}

	var connection = mysql.createConnection(config.conexoes[config.conexao]);
	connection.connect(function(err) {
		if(err) {
			console.log(err)
		} else {
			//if()
			if(argumentos.verbose) {
				console.log('Criando cidade...');
			}
			connection.beginTransaction(function(err) {
				function trataErro(err, connection) {
					console.log('Falha ao inserir dados no banco. Desfazendo transação e encerrando o processo.');
					if(debug) {
						console.log(err);
					}
					connection.rollback();
					connection.end();
					process.exit();
				}
				function final() {
					connection.commit(function(err) {
						if(err) {
							trataErro(err, connection);
						} else if(argumentos.verbose) {
							console.log('Concluido!');
						}
						connection.end();
					});
				}
				Espera.inicio(final, 'inserir');
				if(err) {
					trataErro(err, connection);
				} else {
					inserir(arvoreBD, 'tb_cidade', connection, trataErro);
				}
			});
		}
	});

	if(debug) {
		console.log(listaAST);
	}
}

function inserir(arvore, nome, connection, trataErro) {
	var sSQL = '',
		filhos = {}, id = 0,
		// assume prefixo = "tb_" e chave = nome_da_tabela_sem_prefixo + "_id"
		fk = nome.replace(/^tb_/i, '')+'_id',
		fmt1 = [], fmt2 = [],
		campos = [], valores = [];

	Espera.aumentar('inserir');
	Object.each(arvore, function (campo, chave) {
		if(Array.isArray(campo)) {
			filhos[chave] = campo;
		} else {
			fmt1.push('??');
			fmt2.push('?');
			campos.push(chave);
			valores.push(campo);
		}
	});
	if(valores.length) {
		sSQL = mysql.format(
			'INSERT INTO ??(' + fmt1.join(', ') + ') VALUES (' + fmt2.join(', ') + ')',
			Array.from(nome).append(campos.append(valores))
		);
		connection.query(sSQL, function (err, result) {
			if(err) {
				console.log(sSQL);
				trataErro(err, connection);
			} else {
				id = result.insertId;
				Object.each(filhos, function (filho, nome) {
					filho.each(function (arvore) {
						arvore[fk] = id;
						inserir(arvore, nome, connection, trataErro);
					});
				});
			}
			Espera.fim('inserir');
		});
	}
}

function progresso(pos, fim) {
	var str = '',
		max = 50,
		razao = pos/fim,
		cmp = (max*razao)|0;

	if(pos == fim) {
		str = 'Completo!\n';
	} else {
		str += (razao*100).toFixed(2) + '%\t';
		str += new Array(cmp + 1).join('!');
		str += new Array(max - cmp + 1).join('.');
	}

	if(progresso.ultStr != str) {
		if(progresso.ultStr && str.length < progresso.ultStr.length) {
			process.stdout.clearLine();
		}
		process.stdout.cursorTo(0);
		process.stdout.write(str);
		progresso.ultStr = str;
	}
}
