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
	/**
	 * Return friendly message or developer message.
	 *
	 * @method msg
	 * @param {} amigavel
	 * @param {} dev
	 *
	 * @return {}
	*/
	function msg(amigavel, dev) {
		if(debug) {
			return dev;
		} else {
			return amigavel;
		}
	}
	/**
	 * Get a int value
	 *
	 * @method getInt
	 * @param {} val
	 *
	 * @return {}
	*/
	function getInt(val) {
		if(typeof(val)!='undefined' && val) {
			val = parseInt(val);
		} else {
			val = NaN;
		}
		return val;
	}
	//
	/**
	 * extrair parametros
	 *
	 * @method extParams
	 *
	 * @return {}
	*/
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
	/**
	 * description
	 *
	 * @method mkdir
	 * @param {} nome
	 * @param {} cb Calback function
	 *
	 * @return {void}
	*/
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
	/**
	 * Write data in a file
	 *
	 * @method
	 * @param {} nome
	 * @param {} dados
	 * @param {} cb Calback
	 *
	 * @return {void}
	*/
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
			responseObj = {
				'message': msg('Unexpected error. ',' Is there a bug or is testing security !!')
			},
			base = path.resolve(__dirname, config.paths.raiz_web),
			pathAbs = path.normalize(parsed.pathname),
			contentType,
			ended = false;

		if(debug) {
			responseObj.parsed = parsed;
		}
	/**
	 * description
	 *
	 * @method writeEnd
	 * @param {} str
	 * @param {} type
	 * @param {} status
	 * @param {} cachelocal
	 *
	 * @return {}
	*/
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
				if(config['cache-local'] && typeof(cacheLocal)=='string' && validFile.test(cacheLocal)) {
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
						writeEnd(JSON.stringify(responseObj), "application/json", 500);
					}
					pool.getConnection(function(err, connection) {
						var sSQL = 'SELECT * FROM ?? WHERE ?? = ?', format = null, params;
						if(err) {
							responseObj.message = msg('Internal Error. {I can not connect to mysql}', err.message);
							writeEnd(JSON.stringify(responseObj), "application/json", 500);
						} else {
							if(connection.listeners('error').length<=0) {
								connection.on('error', errConexao);
							}

							params = extParams(parsed.pathname, '/-/');
							switch(params.pathname) {
								case '/api/city':
								case '/api/district':
								case '/api/building':
									params.id = getInt(params.id);
									if(params.id>0) {
										format = [params.pathname.replace('/api/', 'tb_'), 'id', params.id];
									}
								break;
								case '/api/cities':
									sSQL = 'SELECT * FROM ??';
									format = ['tb_city'];
								break;
								case '/api/districts':
									params.district = getInt(params.district);
									params.city = getInt(params.city);
									if(params.city>0) {
										format = ['tb_district', 'city_id', params.city];
									} else if(params.district>0) {
										format = ['tb_district', 'district_id', params.district];
									}
									break;
								case '/api/buildings':
									params.district = getInt(params.district);
									params.building = getInt(params.building);
									if(params.district>0) {
										format = ['tb_building', 'district_id', params.district];
									} else if(params.building>0) {
										format = ['tb_building', 'building_id', params.building];
									}
								break;
								default:
									responseObj.message = msg('Access Denied. {RAD}', JSON.stringify(params));
									writeEnd(JSON.stringify(responseObj), "application/json", 403);
									connection.release();
									return;
								break;
							}

							if(sSQL != '' && format !== null) {
								sSQL = mysql.format(sSQL, format);
								connection.query(sSQL, function(err, rows, fields) {
									if(err) {
										responseObj.message = msg('Internal Error. {FCBD}', err.message);
										writeEnd(JSON.stringify(responseObj), "application/json", 500);
									} else {
										responseObj.message = '';
										if(rows.length==1) {
											responseObj.register = rows[0];
										} else {
											responseObj.registers = rows;
										}
										if(debug) {
											responseObj.campos = fields;
										}

										writeEnd(JSON.stringify(responseObj), "application/json", 200, path.normalize(base + parsed.path));
									}
								});
							} else {
								responseObj.message = msg('Internal Error. {FCWS}', 'Invalid Query : ' + parsed.path);
								writeEnd(JSON.stringify(responseObj), "application/json", 500);
							}

							connection.release();
						}
					});
				}
			}
		});
	});

	server.listen(process.env.PORT || config.porta);
	console.log("Server Started.");
