var fs = require('fs'),
path = require('path'),
mime = require('mime'),
mysql = require('mysql'),
nomnom = require('nomnom'),
esprima = require('./lib/esprima.js'),
config = require('./config.json'),
debug = !!config.debug,
CONST_ANONYMOUS = 'Anonymous function',
consoleArguments, projectPath, listAST = {};
require('./lib/MooTools-Core-Server.js');


//Help of generator
nomnom.options({
	'city': {
		abbr: 'c',
		help: 'Name of your city.',
		default: ''
	},
	'project': {
		position: 0,
		metavar: 'PATH_project',
		help: 'Project path.',
		required: true
	},
	'verbose': {
		abbr: 'v',
		help: 'Print message and errors.',
		flag: true
	}
});

consoleArguments = nomnom.parse();
projectPath = consoleArguments.project;
consoleArguments.project = path.resolve(process.cwd(), consoleArguments.project);
if(!consoleArguments.city || consoleArguments.city=='') {
	consoleArguments.city = path.basename(consoleArguments.project);
}
//console.log(consoleArguments);
//process.exit();
fs.exists(consoleArguments.project, function(exists) {
	if(exists) {
		if(consoleArguments.verbose) {
			console.log('Starting scan.');
		}
		processPath(consoleArguments.project);
	} else {
		console.log('Wrong path: ' + consoleArguments.project);
	}
});
/**
* Control events.
*
* @class Stack
* @constructor
*/
Stack = new Class(function (cb, name, max) {
	var itens = {
		'default':{'cb':function(){}, n:0, max: Infinity}
	};
	/**
	 * description
	 *
	 * @method _name
	 * @param {} val
	 *
	 * @return {} val
	*/
	function _name(val) {
		if(typeof(val)!='string') {
			val = 'default';
		}
		return val;
	}
	/**
	 * description
	 *
	 * @method start
	 * @param {} cb
	 * @param {} name
	 * @param {} max
	 *
	 * @return {void}
	*/
	this.start = function(cb, name, max) {
		name = _name(name);
		if(typeof(max)!='number') {
			max = Infinity;
		}
		itens[name] = {'cb': cb, 'n': 0, 'max': max};
	};
	/**
	 * description
	 *
	 * @method up
	 * @param {} name
	 *
	 * @return {Bolean}
	*/
	this.up = function (name) {
		name = _name(name);
		if(itens[name].n < itens[name].max) {
			++itens[name].n;
			return false;
		}
		return true;
	};
	/**
	 * description
	 *
	 * @method end
	 * @param {} name
	 *
	 * @return {}
	*/

	this.end = function(name) {
		name = _name(name);
		--itens[name].n;
		if(itens[name].n<=0) {
			itens[name].cb.call();
		}
	};
	/**
	 * description
	 *
	 * @method start
	 * @param {} cb
	 * @param {} name
	 * @param {} max
	 *
	 * @return {}
	*/
	this.start(cb, name, max);
	return this;
});
Waiting = new Stack(processAST);
/**
* Process js files from a directories

* @method processPath
* @param {String} currentPath
*
* @return {Boolean} Returns true on success
*/
function processPath(currentPath) {
	Waiting.up();
	fs.stat(currentPath, function defineType(error, stats) {
		if(error) {
			console.log('Invalid paht: ' + currentPath);
			Waiting.end();
		} else if(stats.isDirectory()) {
			if(consoleArguments.verbose) {
				console.log('Processing directory: ' + currentPath);
			}
			fs.readdir(currentPath, function (error, arqs) {
				if(error) {
					console.log(error);
				} else {
					var i;
					arqs.sort();
					for(i=0; i<arqs.length; ++i) {
						processPath(path.resolve(currentPath, arqs[i]));
					}
				}
				Waiting.end();
			});
		} else {
			var type = mime.lookup(currentPath), validos = ['text/javascript', 'application/javascript'];
			if(validos.indexOf(type)<0) {
				currentPath = path.relative(consoleArguments.project, currentPath);
				if(consoleArguments.verbose) {
					console.log('Ignoring file: ' + currentPath);
				}
				Waiting.end();
			} else {
				fs.readFile(currentPath, function(error, content) {
					var err, tmp;
					currentPath = path.relative(consoleArguments.project, currentPath);
					if(error) {
						console.log(error);
					} else {
						if(currentPath == '') {
							// project off only one file
							currentPath = path.basename(consoleArguments.project);
						}
						if(consoleArguments.verbose) {
							console.log('Analyzing file: ' + currentPath);
						}
						err = false;
						try {
							tmp = esprima.parse(content, {loc: true, tolerant: true});
							if(tmp.errors && tmp.errors.length) {
								console.log(currentPath, tmp);
								err = tmp.errors;
								tmp = {
									type: 'Program',
									tooltip: 'File: ' + currentPath + ', ' + tmp.errors[0].toString(),
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
							console.log(currentPath, e);
							tmp = {
								type: 'Program',
								tooltip: 'File: ' + currentPath + ', ' + e.toString(),
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
						(function (obj, currentPath, val) {
							var i, t,
							current = '',
							parts = currentPath.split(path.sep);
							for (i = 0, t = parts.length; i < t; i++) {
								if(i>0) {
									current += path.sep;
								}
								current += parts[i];
								if (!hasOwnProperty.call(obj, parts[i])) {
									obj[parts[i]] = {
										children: {},
										path: current
									};
								}

								if((i+1)<t) {
									obj = obj[parts[i]].children;
								} else {
									obj[parts[i]] = val;
								}
							}
						})(listAST, currentPath, tmp);
					}
					Waiting.end();
				});
			}
		}
	});
}
/**
 * Description
 *
 * @method processAST
 *
 *
 * @return {void}
*/
function processAST() {
	var treeDB = {
		'name': consoleArguments.city,
		'tooltip': consoleArguments.city + ' @ ' + projectPath,
		'tb_district': []
	},
	colors = {
		'Directory': '0xF7AB29',
		'Program': '0xCA202B',
		'FunctionDeclaration': '0x2A75B3',
		'FunctionExpression': '0x2A75B3',
		'CallExpression': '0x000000'
	};
	colors[CONST_ANONYMOUS] = '0x31A948';
	if(consoleArguments.verbose) {
		console.log('Preparing city to insert in database.');
	}
	/**
	 * description
	 *
	 * @method buildAST
	 * @param {} tree
	 * @param {} name
	 * @param {} deep
	 * @param {} father
	 *
	 * @return {}
	*/
	function buildAST(tree, name, deep, father) {
		if(!deep) deep = 0;
		var record = null, loc;

		function add(no) {
			if(no){
				var child, deepLocal = deep, place = record||father;
				if(no.type == 'BlockStatement') {
					++deepLocal;
				} else if(place.width && no.type == 'VariableDeclarator') {

					place.addWidth(1);
				}
				child = buildAST(no, name, deepLocal, place);
				if(child) {
					if(place.addWidth && child.width) {
						place.addWidth(child.width);
					}
					child.father = place;
					place.tb_building.push(child);
				}
			}
		}
		if(typeOf(tree)=='object') {
			if(tree.type=='Program' || tree.type=='FunctionDeclaration' || tree.type=='FunctionExpression') {
				loc = 1+tree.loc.end.line-tree.loc.start.line;
				if(tree.type != 'Program') {
					name = (tree['id'] && (typeof(tree['id']['name'])=='string')?tree['id']['name']:CONST_ANONYMOUS);
					record = {
						name: name,
						height: loc,
						width: 1,
						addWidth: function (n) {
							this.width += n;
							if(this.father && this.father.addWidth) {
								this.father.addWidth(n);
							}
						},
						color: colors[name==CONST_ANONYMOUS?name:tree.type],
						tooltip: tree.tooltip || name + ', LOC: ' + loc + ' [' + tree.loc.start.line + '-' +tree.loc.end.line + ']',
						tb_building: []
					};
				} else {
					record = {
						name: name,
						color: colors[tree.type],
						tooltip: tree.tooltip || name + ', LOC: ' + loc + ' [' + tree.loc.start.line + '-' +tree.loc.end.line + ']',
						tb_building: []
					};
				}
			} else if(tree.type=='CallExpression' &&
				(tree.callee.name == 'define' ||
					(tree.callee.object && tree.callee.object.name == 'angular' &&
						tree.callee.property && tree.callee.property.name == 'module'
					)
				)
			) {
				name = 'Module';
				if(tree.arguments.length && tree.arguments[0].type == 'Literal' && typeOf(tree.arguments[0].value)=='string') {
					name += ': ' + tree.arguments[0].value;
				}
				loc = 1+tree.loc.end.line-tree.loc.start.line;
				record = {
					name: name,
					height: 3,
					width: 1,
					addWidth: function (n) {
						this.width += n;
						if(this.father && this.father.addWidth) {
							this.father.addWidth(n);
						}
					},
					color: colors[tree.type],
					tooltip: tree.tooltip || name + ', LOC: ' + loc + ' [' + tree.loc.start.line + '-' +tree.loc.end.line + ']',
					tb_building: []
				};
			}
			Object.each(tree, add);
		} else if(Array.isArray(tree)) {
			tree.each(add);
		}
		return record;
	}
	/**
	 * Create tree to insert into db
	 * Format = { field : Mixed value [ field : Mixed value ] [ , child : array of values ​​] ]}
	 *
	 * @method dir
	 * @param {} aAST
	 * @param {} aBD
	 *
	 * @return {}
	*/
	function dir(aAST, aBD) {
		Object.each(aAST, function (ast, name) {
			var dist;
			if(ast.type) {
				dist = buildAST(ast, name);
				Object.each(dist, function deleteAuxiliary(o, n, ref) {
					if(n=='father' || n=='addWidth') {
						delete ref[n];
					} else if(typeof(o) == 'object') {
						Object.each(o, deleteAuxiliary);
					} else if(Array.isArray(o)) {
						o.each(o, deleteAuxiliary);
					}
				});
			} else {
				dist = {
					name: name,
					color: colors['Directory'],
					tooltip: 'Folder: ' + ast.path,
					tb_district: [],
					tb_building: []
				};
				dir(ast.children, dist);
			}
			aBD.tb_district.push(dist);
		});
	}
	dir(listAST, treeDB);

	if(debug) {
		console.log(JSON.stringify(listAST, null, '\t'));
		console.log(JSON.stringify(treeDB, null, '\t'));
		process.exit();
	}
	var connection = mysql.createConnection(config.conexoes[config.conexao]);
	connection.connect(function(err) {
		if(err) {
			console.log(err)
		} else {
			//if()
			if(consoleArguments.verbose) {
				console.log('Creating City...');
			}
			connection.beginTransaction(function(err) {
				/**
				 * ERROR treatment for insertion into database
				 *
				 * @method treatErro
				 * @param {} err
				 * @param {} connection
				 *
				 * @return {}
				*/
				function treatErro(err, connection) {
					console.log('Failed to insert data in the database . Undoing transaction and ending the process.');
					if(debug) {
						console.log(err);
					}
					connection.rollback();
					connection.end();
					process.exit();
				}
				/**
				 * description
				 *
				 * @method final
				 *
				 *
				 * @return {void}
				*/
				function final() {
					connection.commit(function(err) {
						if(err) {
							treatErro(err, connection);
						} else if(consoleArguments.verbose) {
							console.log('Finished!');
						}
						connection.end();
					});
				}
				Waiting.start(final, 'insert');
				if(err) {
					treatErro(err, connection);
				} else {
					insert(treeDB, 'tb_city', connection, treatErro);
				}
			});
		}
	});

	if(debug) {
		console.log(listAST);
	}
}
/**
 * Insert data  on database
 *
 * @method insert
 * @param {} tree
 * @param {} name
 * @param {} connection
 * @param {} treatErro
 *
 * @return {}
*/
function insert(tree, name, connection, treatErro) {
	var sSQL = '',
	children = {}, id = 0,
	// assume prefixo = "tb_" e chave = nome_da_tabela_sem_prefixo + "_id"
	fk = name.replace(/^tb_/i, '')+'_id',
	fmt1 = [], fmt2 = [],
	fields = [], values = [];

	Waiting.up('insert');
	Object.each(tree, function (campo, chave) {
		if(Array.isArray(campo)) {
			children[chave] = campo;
		} else {
			fmt1.push('??');
			fmt2.push('?');
			fields.push(chave);
			values.push(campo);
		}
	});
	if(values.length) {
		sSQL = mysql.format(
			'INSERT INTO ??(' + fmt1.join(', ') + ') VALUES (' + fmt2.join(', ') + ')',
			Array.from(name).append(fields.append(values))
			);
		connection.query(sSQL, function (err, result) {
			if(err) {
				console.log(sSQL);
				treatErro(err, connection);
			} else {
				id = result.insertId;
				Object.each(children, function (child, name) {
					child.each(function (tree) {
						tree[fk] = id;
						insert(tree, name, connection, treatErro);
					});
				});
			}
			Waiting.end('insert');
		});
	}
}

/**
 * description
 *
 * @method progress
 * @param {} pos
 * @param {} end
 *
 * @return {void}
*/
function progress(pos, end) {
	var str = '',
	max = 50,
	proportionality = pos/end,
	cmp = (max*proportionality)|0;

	if(pos == end) {
		str = 'Complete!\n';
	} else {
		str += (proportionality*100).toFixed(2) + '%\t';
		str += new Array(cmp + 1).join('!');
		str += new Array(max - cmp + 1).join('.');
	}

	if(progress.ultStr != str) {
		if(progress.ultStr && str.length < progress.ultStr.length) {
			process.stdout.clearLine();
		}
		process.stdout.cursorTo(0);
		process.stdout.write(str);
		progress.ultStr = str;
	}
}
