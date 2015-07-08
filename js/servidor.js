var mysql = require('mysql'),
	http = require('http'),
	mime = require('mime'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	config = require('./config.json'),
	server,
	debug = !!config.debug,
	pool = mysql.createPool(config.conexoes[config.conexao]);


function msg(amigavel, dev) {
	if(debug) {
		return dev;
	} else {
		return amigavel;
	}
}

function getInt(val) {
	if(typeof(val)!='undefined' && val) {
		val = parseInt(val);
	} else {
		val = NaN;
	}
	return val;
}

function extParams(str, sep) {
	var i, r = {pathname: str};
	if(typeof(sep)!='string') {
		sep = '?';
	}
	i = str.indexOf(sep);
	if(i>=0) {
		r = url.parse('?' + str.substr(i+sep.length), true).query;
		r.pathname = str.substr(0, i);
	}
	return r;
}

function mkdir(nome, cb) {
	function resp(error) {
		if(error && error.code == 'ENOENT') {
			mkdir(path.dirname(nome), resp);
		} else {
			cb(error);
		}
	}
	fs.mkdir(nome, resp);
}

function writeFile(nome, dados, cb) {
	fs.writeFile(nome, dados, function (error) {
		if(error && error.code == 'ENOENT') {
			mkdir(path.dirname(nome), function (error) {
				writeFile(nome, dados, cb);
			});
		} else {
			if(cb) cb(error);
		}
	});
}
server = http.createServer(function(request, response) {
	var parsed = url.parse(request.url, true),
		resposta = {
			'mensagem': msg('Erro inesperado.', 'Tem algum bug ou está testando segurança!!')
		},
		base = path.resolve(__dirname, config.paths.raiz_web),
		pathAbs = path.normalize(parsed.pathname),
		contentType,
		ended = false;

	if(debug) {
		resposta.parsed = parsed;
	}
	function writeEnd(str, type, status, cacheLocal) {
		var head = {}, exp, validFile = /^[^\*\?]+$/gi;
		//if(debug) console.log(str.length+'chars', status, type, cacheLocal);
		if(ended) {
			// debug.
			console.log(arguments);
			return;
		}
		ended = true;
		if(typeof(type)!='string') {
			//type = 'text/plain';
			type = 'application/xhtml+xml';
		}
		if(typeof(status)!='number') {
			status = 200;
		}

		if(status==200) {
			exp = config.expires[type];
			if(typeof(exp)=='undefined') {
				exp = config.expires.padrao;
			}
			if(exp) {
				head['Expires'] = new Date(Date.now() + exp * 1000).toUTCString();
				head['Cache-Control'] = 'cache, must-revalidate';
				head['Pragma'] = 'cache';
			}
			if(typeof(cacheLocal)=='string' && validFile.test(cacheLocal)) {
				//if(debug) console.log(cacheLocal, validFile, validFile.test(cacheLocal));
				writeFile(cacheLocal, str, function(error){console.log(error);/* log, maybe... */});
			}
		}

		head['Content-Type'] = type;
		response.writeHead(status, head);
		response.write(str);
		response.end();
	}

	pathAbs = base + pathAbs;

	if (pathAbs.length && pathAbs[pathAbs.length-1] == path.sep) {
		pathAbs += 'index.xhtml';
	}

	//var extname = path.extname(pathAbs);
	contentType = mime.lookup(pathAbs);
	if(contentType == 'application/octet-stream' && request.headers['x-request']=='JSON') {
		contentType = 'application/json';
	}

	fs.exists(pathAbs, function(exists) {
		if (exists) {
			fs.readFile(pathAbs, function(error, content) {
				if (error) {
					writeEnd(msg('Falha interna. {LAI}', error), 'text/plain', 500);
				} else {
					writeEnd(content, contentType, 200);
				}
			});
		} else {
			if(parsed.pathname.slice(0, 5)!='/api/') {
				writeEnd('Arquivo não encontrado.'/*+pathAbs*/, 'text/plain', 404);
			} else {
				function errConexao(err) {
					if(debug) {
						console.log(err); // 'ER_BAD_DB_ERROR'
					}
					writeEnd(JSON.stringify(resposta), "application/json", 500);
				}
				pool.getConnection(function(err, connection) {
					var sSQL = 'SELECT * FROM ?? WHERE ?? = ?', formato = null, params;
					if(err) {
						resposta.mensagem = msg('Erro interno. {FCM}', err.message);
						writeEnd(JSON.stringify(resposta), "application/json", 500);
					} else {
						if(connection.listeners('error').length<=0) {
							connection.on('error', errConexao);
						}

						params = extParams(parsed.pathname, '/-/');
						switch(params.pathname) {
							case '/api/cidade':
							case '/api/distrito':
							case '/api/construcao':
								params.id = getInt(params.id);
								if(params.id>0) {
									formato = [params.pathname.replace('/api/', 'tb_'), 'id', params.id];
								}
							break;
							case '/api/cidades':
								sSQL = 'SELECT * FROM ??';
								formato = ['tb_cidade'];
							break;
							case '/api/distritos':
								params.distrito = getInt(params.distrito);
								params.cidade = getInt(params.cidade);
								if(params.cidade>0) {
									formato = ['tb_distrito', 'cidade_id', params.cidade];
								} else if(params.distrito>0) {
									formato = ['tb_distrito', 'distrito_id', params.distrito];
								}
								break;
							case '/api/construcoes':
								params.distrito = getInt(params.distrito);
								params.construcao = getInt(params.construcao);
								if(params.distrito>0) {
									formato = ['tb_construcao', 'distrito_id', params.distrito];
								} else if(params.construcao>0) {
									formato = ['tb_construcao', 'construcao_id', params.construcao];
								}
							break;
							default:
								resposta.mensagem = msg('Acesso negado. {RAD}', JSON.stringify(params));
								writeEnd(JSON.stringify(resposta), "application/json", 403);
								connection.release();
								return;
							break;
						}

						if(sSQL!='' && formato!==null) {
							sSQL = mysql.format(sSQL, formato);
							connection.query(sSQL, function(err, rows, fields) {
								if(err) {
									resposta.mensagem = msg('Erro interno. {FCBD}', err.message);
									writeEnd(JSON.stringify(resposta), "application/json", 500);
								} else {
									resposta.mensagem = '';
									if(rows.length==1) {
										resposta.registro = rows[0];
									} else {
										resposta.registros = rows;
									}
									if(debug) {
										resposta.campos = fields;
									}

									writeEnd(JSON.stringify(resposta), "application/json", 200, path.normalize(base + parsed.path));
								}
							});
						} else {
							resposta.mensagem = msg('Erro interno. {FCWS}', 'Query inválida: ' + parsed.path);
							writeEnd(JSON.stringify(resposta), "application/json", 500);
						}

						connection.release();
					}
				});
			}
		}
	});
});

server.listen(process.env.PORT || config.porta);
console.log("Servidor iniciado.");
