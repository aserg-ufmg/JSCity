	/**
	 * Base class that represents a block item on screen.
	 *
	 * @class Block
	 */
	Block = new Class({
		Implements: [Events, Options],
		options: {
			colorBlock: 0xDDDDDD,
			widthBlock: 1,
			heightBlock: 3,
			depthBlock: 1,
			marginBlock: 0,
			spaceChildren: 2,
			x: 0,
			y: 0,
			z: 0,
			autoResize: false
		},
		_pause: true,
		_childrens: [],
		parentBlock: null,
		/**
		 * Class constructor
		 *
		 * @constructor
		 * @method initialize
		 * @param {String} name
		 * @param {THREE.Scene} scene
		 * @param {Object} ops
		 *
		 * @return {void}
		*/
		initialize: function (name, scene, ops) {
			this.setOptions(ops)
			this.scene = scene;
			this.name = name;
			this.reset();
			this.fireEvent('loaded');
		},
		/**
		 * calculates the height of the blocks considering the children
		 *
		 * @method getHeight
		 *
		 * @return { }
		*/
		getHeight: function () {
			var h = this.options.heightBlock, maxF = 0;
			this._childrens.each(function (child) {
				var hF = child.getHeight();
				if(hF > maxF) {
					maxF = hF;
				}
			});
			return h + maxF;
		},
		/**
		 * Recreates the block if it exists.
		 *If it does not exist creates a new block .
		 *
		 * @method reset
		 *
		 *
		 * @return {void}
		*/
		reset: function () {
			var geometry = new THREE.BoxGeometry(1, 1, 1),
				//tex = null,
				material = new THREE.MeshPhongMaterial({color: this.options.colorBlock, map: THREE.ImageUtils.loadTexture( "img/rect.png" )/**/});
			this._pause = true;
			if(this.mesh) {
				this.scene.remove(this.mesh);
			}
			geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
			this.mesh = new THREE.Mesh(geometry, material);
				this.mesh.name = this.name?this.name:(this.name?this.name:'');
			this.scene.add(this.mesh);
			this.killChildren();
			this.unPauseUp();
		},
		/**
		 * add a child block on current block um filho ao bloco atual
		 *
		 * @method addChild
		 * @param {} name
		 * @param {Object} ops
		 *
		 * @return {}
		*/
		addChild: function (name, ops) {
			var n = this._childrens.length;
			if(typeof(name)=='string') {
				this._childrens[n] = new Block(name, this.scene, ops);
			} else if(instanceOf(name, Block)) {
				this._childrens[n] = name;
			} else {
				n = -1;
			}
			if(n>=0) {
				this._childrens[n].parentBlock = this;
				this.unPauseUp();
			}
			return n;
		},
		/**
		 * Removes the pause this element and chains to the parent elements
		 *
		 * @method unPauseUp
		 * @param {} name
		 * @param {} ops
		 *
		 * @return {void}
		*/
		unPauseUp: function () {
			this._pause = false;
			if(this.parentBlock) {
				this.parentBlock.unPauseUp();
			}
		},
		/**
		 * Get the child based on parameter
		 *
		 * @method getChild
		 * @param {} i Id of child
		 *
		 * @return {void}
		*/
		getChild: function (i) {
			return this._childrens[i];
		},
		/**
		 *  Update status block (width, height, depth , position)
		 *
		 * @method update
		 * @param {} timestamp
		 *
		 * @return {void}
		*/
		update: function (timestamp) {
			if(this._pause) return;

			var o = this.options,
				columns = this._childrens.length,
				column = 0,
				line = 0,
				x = o.x,
				y = o.y + o.heightBlock,
				z = o.z,
				xm = x,
				pm = 0,
				xi = x, zi = z,
				ex = 0, ez = 0;
				columns = columns.sqrt().floor().max(1);

			if(o.autoResize) {
				x += o.marginBlock;
				xi += o.marginBlock;
				z += o.marginBlock;
				zi += o.marginBlock;
			}

			this._childrens.each(function (child, i) {
				if(column) {
					x += o.spaceChildren;
					//ex += o.spaceChildren;
				} else if(line) {
					z += o.spaceChildren;
					//ez += o.spaceChildren;
				}
				child.setOptions({
					x: x,
					y: y,
					z: z
				});
				child._pause = false;
				child.update(timestamp);

				x += child.options.widthBlock;
				if(pm < child.options.depthBlock) {
					pm = child.options.depthBlock;
				}
				if(++column == columns || (i+1)==this._childrens.length) {
					column = 0;
					++line;
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
					widthBlock: xm - xi + o.marginBlock*2,
					depthBlock: z - zi + o.marginBlock*2
				});
			}

			this.mesh.scale.set(o.widthBlock, o.heightBlock, o.depthBlock);
			this.mesh.position.set(o.x, o.y, o.z);
			this._pause = true;
		},
		/**
		 *  Hide a block
		 *
		 * @method hideBlock
		 *
		 *
		 * @return {void}
		*/
		hideBlock: function () {
			this.mesh.visible = false;
			this._childrens.each(function (child) {
				child.hideBlock();
			});
		},
		/**
		 *  Display a block
		 *
		 * @method showBlock
		 *
		 *
		 * @return {void}
		*/
		showBlock: function () {
			this.mesh.visible = true;
			this._childrens.each(function (child) {
				child.showBlock();
			});
		},
		/**
		 *  Destructor of the object. To actual removal should be used " obj = null " or "delete obj " after this method
		 *  Ex.: obj.kill(); , obj = null;
		 *
		 * @method kill
		 *
		 *
		 * @return {void}
		*/
		kill: function () {
			this.fireEvent('kill');
			this.removeEvents();
			this._pause = true;
			this.killChildren();
			this.scene.remove(this.mesh);
		},
		/**
		 *  Kill children of this block
		 *
		 * @method killChildren
		 *
		 *
		 * @return {void}
		*/
		killChildren: function () {
			this._childrens.each(function (child, i) {
				this._childrens[i].kill();
			}.bind(this));
			this._childrens = [];
		}
	});
	/**
	* Block class extension that gets data using ajax .
	* Set the reference record block
	*
	* @class BlockAjax
	* @extends Block
	*/
	BlockAjax = new Class({
		Extends: Block,
		options: {
			urlItem: 'block?id={id}',
			urlChildren: 'blocks?block_id={id}',
			classChild: null
		},
		/**
		 * Class constructor
		 *
		 * @method initialize
		 * @param {String} name
		 * @param {THREE.Scene} scene
		 * @param {Object} ops
		 *
		 * @return {void}
		*/
		initialize: function (record, scene, ops) {
			this.setOptions(ops);
			if(this.options.classChild === null) {
				this.options.classChild = this.$constructor;
			}
			this.scene = scene;
			if(typeOf(record)=='number') {
				this.id = record;
				this.load();
			} else {
				this.set(record);
				this.fireEvent('loaded');
			}
		},
		/**
		 *  Set the reference record block
		 *
		 * @method set
		 *
		 * @return {void}
		*/
		set: function (record) {
			this.fireEvent('starting');
			Object.each(record, function (value, name) {
				this[name] = value;
			}.bind(this));
			this.reset();
			Object.each(record, function (value, name) {
				this.mesh.userData[name] = value;
			}.bind(this));
			this.loadChildren();
		},
		/**
		 * Load block according to the attributes of the class
		 *
		 * @method load
		 *
		 * @return {void}
		*/
		load: function () {
			if(this.id) {
				new Request.JSON({
					url: this.options.urlItem.replace('{id}', this.id),
					method: 'get',
					onSuccess: function (result) {
						this.set(result.register);
						this.fireEvent('loaded');
					}.bind(this)
				}).send();
			}
		},
		/**
		 * Helper function to trigger the complete event
		 *
		 * @method isComplete
		 *
		 *
		 * @return {void}
		*/
		_complete: function () {
			if(this.isComplete()) {
				this._pause = false;
				this.fireEvent('complete');
			}
		},
		/**
		 * Returns the status of the block loading (complete or not)
		 *
		 * @method isComplete
		 *
		 * @return {}
		*/
		isComplete: function () {
			var ok = this._requests==0;
			if(ok && this._childrens.length>0) {
				ok = this._childrens.every(function (child) {
					return child.isComplete();
				});
			}
			return ok;
		},
		_requests: 0,
		/**
		 * Load informations of child blocks
		 *
		 * @method loadChildren
		 * @param {} url
		 * @param {} classChild
		 * @param {} kill
		 *
		 * @return {void}
		*/
		loadChildren: function (url, classChild, kill) {
			if(this.id) {
				if(typeof(url)!='string' || url == '') {
					url = this.options.urlChildren;
				}
				if(typeOf(classChild)!='class') {
					classChild = this.options.classChild;
				}
				if(kill === null || typeof(kill)=='undefined') {
					kill = true;
				}
				++this._requests;
				new Request.JSON({
					url: url.replace('{id}', this.id),
					method: 'get',
					onSuccess: function (result) {
						--this._requests;
						var children = result.register?[result.register]:result.registers;
						if(kill) {
							this.killChildren();
						}
						children.each(function (item) {
							var ops = {
								onChildren: function () {
									this.fireEvent('children');
									this.fireEvent('childrenChild');
								}.bind(this),
								onComplete: this._complete.bind(this)
							}, child;
							if(item.color) {
								ops.colorBlock = parseInt(item.color);
							}
							if(item.height) {
								ops.heightBlock = item.height;
							}
							if(item.width) {
								ops.widthBlock = item.width;
								ops.depthBlock = item.width;
							}
							if(item.name) {
								item.name = this.mesh.name + '>' + item.name;
								if(item.tooltip) {
									item.tooltip += ' .. ' + item.name;
								}
							}
							if(!classChild) console.log(this);
							child = new classChild(item, this.scene, ops);
							this.addChild(child);
							this.fireEvent('child', [child]);
						}.bind(this));
						this.fireEvent('children');
						this.fireEvent('childrenLocal');

						if(children.length == 0 && this._requests == 0) {
							this._complete();
						}
					}.bind(this)
				}).send();
			}
		}
	});
	/**
	* class that represents any building of a city.
	*
	* @class Building
	* @extends BlockAjax
	*/
	Building = new Class({
		Extends: BlockAjax,
		options: {

			spaceChildren: 0,
			marginBlock: 0,

			urlItem: 'api/building/-/id={id}',
			urlChildren: 'api/buildings/-/building={id}',
			classChild: null,
			color: 0xBBDDFF
		},
		buildings: function () {
			return this.loadChildren.apply(this, arguments);
		}
	});
	/**
	* class that represents a District of a city.
	*
	* @class District
	* @extends BlockAjax
	*/
	District = new Class({
		Extends: BlockAjax,
		options: {
			urlItem: 'api/district/-/id={id}',
			urlChildren: 'api/buildings/-/district={id}',
			classChild: Building,
			color: 0xDDBBFF,
			marginBlock: 10,
			autoResize: true
		},
		_loadDist: true,
		/**
		 * Class constructor
		 *
		 * @constructor
		 * @method initialize
		 * @param {String} record
		 * @param {THREE.Scene} scene
		 * @param {Object} ops
		 *
		 * @return {void}
		*/
		initialize: function (record, scene, ops) {
			this.addEvent('childrenLocal', function () {
				if(this._loadDist) {
					this.districts();
				}
			}, true);
			this.parent(record, scene, ops);
		},
		buildings: function () {
			return this.loadChildren();
		},
		districts: function () {
			this._loadDist = false;
			return this.loadChildren('api/districts/-/district={id}', District, false);
		}
	});
	/**
	* Class that represents a city.
	*
	* @class City
	* @extends BlockAjax
	*/
	City = new Class({
		Extends: BlockAjax,
		options: {
			urlItem: 'api/city/-/id={id}',
			urlChildren: 'api/districts/-/city={id}',
			classChild: District,
			color: 0xDDDDDD,
			marginBlock: 10,
			spaceChildren: 5,
			autoResize: true
		},

		districts: function () {
			return this.loadChildren.apply(this, arguments);
		}
	});

