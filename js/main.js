	/**
	 * Creates a scene  to design the city
	 *
	 * @method mkdir
	 *
	 * @return {void}
	*/
	(function($, $$){
		window.addEvent('domready', function() {
			var scene = new THREE.Scene(),
				renderer = new THREE.WebGLRenderer(),
				camera = new THREE.PerspectiveCamera(45, 1920/1080, 0.1, 10000000),
				quaternionLook = {x: new THREE.Quaternion(), y: new THREE.Quaternion()}, refCamera = null,
				ambientLight = new THREE.AmbientLight(0x777777),
				light = new THREE.PointLight(0xFFFFFF, 1, 0),
				light2 = new THREE.PointLight(0xFFFFFF, 1, 160),
				light3 = new THREE.PointLight(0xFFFF99, .3, 75),
				light4 = new THREE.PointLight(0xFFFF99, .3, 75),
				raycaster = new THREE.Raycaster(),
				canvas = $('vis'), width=0, height=0,
				interface = $('interface'),
				btOrbital = $('btOrbital'),
				btFPerson = $('btFPerson'),
				ultTimestamp = 0, n = 0, speed = 12.8,
				control = 'orbital',
				controlOrbital = new THREE.OrbitControls(camera),
				controls = new Controls({
					'+': 'accelerate',
					'-': 'slowdown',
					'*': 'defaultspeed',
					'up': 'foward',
					'w': 'foward',
					'down': 'backward',
					's': 'backward',
					'left': 'left',
					'a': 'left',
					'right': 'right',
					'd': 'right',
					'space': 'jump',
					'mouse': 'looking'
				}), mouse = {};
			DOMEvent.defineKeys({
				'106': '*',
				'107': '+',
				'109': '-'
			});
			/**
			 * Resizer an windw
			 *
			 * @method onWindowResize
			 * @return {void}
			*/
			function onWindowResize() {
				var size = canvas.getSize();
				camera.aspect = size.x / size.y;
				camera.updateProjectionMatrix();
				renderer.setSize(size.x, size.y);
				width = size.x;
				height = size.y;
			}
			window.addEvent('resize', onWindowResize);
			onWindowResize();
			renderer.setClearColor(0xbfd1e5);
			canvas.grab(renderer.domElement);
			light.position.set(-5, 150, -5);
			light2.position.set(5, 150, 5);
			light3.position.set(5, 75, 5);
			light4.position.set(5, 75, 5);
			scene.add(ambientLight);
			scene.add(light);
			scene.add(light2);
			scene.add(light3);
			scene.add(light4);
			/**
			 * Stop an event.
			 *
			 * @method stopper
			 * @param {ev}
			 *
			 * @return {}
			*/
			function stopper(ev) {
				ev.stop();
			}
			new Elements([interface, $('tooltip')]).addEvents({'click': stopper, 'mousedown': stopper, 'contextmenu': stopper, 'selectstart': stopper});
			canvas.addEvent('contextmenu', stopper);
			renderer.domElement.addEvent('contextmenu', stopper);
			this.interface = interface = new Interface(interface, scene, camera);
			interface.setField('speed', 'dom', $('speed'));
			interface.setField('mouseX', 'dom', $('mouseX'));
			interface.setField('mouseY', 'dom', $('mouseY'));
			interface.setField('blockName', 'dom', $('blockName'));
			interface.setField('tooltip', 'dom', $('tooltip'));
			/**
			 * Stet the type of city control .
			 *
			 * @method setControl
			 * @param {type}
			 *
			 * @return {void}
			*/
			function setControl(type) {
				switch(type) {
					case 'orbital':
						controlOrbital.enabled = true;
						controlOrbital.damping = 0.2;
						control = type;
						btOrbital.addClass('active');
						btFPerson.removeClass('active');
						break;
					case 'fperson':
						controlOrbital.enabled = false;
						control = type;
						btFPerson.addClass('active');
						btOrbital.removeClass('active');
						break;
				}
			}
			btOrbital.addEvent('click', setControl.pass('orbital'));
			btOrbital.setStyle('cursor', 'pointer');
			btFPerson.addEvent('click', setControl.pass('fperson'));
			btFPerson.setStyle('cursor', 'pointer');
			setControl('orbital');
			/**
			 * Render the city
			 *
			 * @method render
			 * @param {} timestamp
			 *
			 * @return {void}
			*/
			function render(timestamp) {

				var tmp, intersects, i;

				if((timestamp - ultTimestamp)>=40) {
					ultTimestamp = timestamp;

					tmp = new THREE.Vector2();
					mouse = controls.mouse();
					tmp.x = (mouse.pos.x / width) * 2 - 1;
					tmp.y = -(mouse.pos.y / height) * 2 + 1;
					raycaster.setFromCamera(tmp, camera);
					intersects = raycaster.intersectObjects(scene.children);
					for (i = 0; i < scene.children.length; i++) {
						if(typeOf(scene.children[i].userData.previousColor)=='number') {
							scene.children[i].material.color.set(scene.children[i].userData.previousColor);
							scene.children[i].userData.previousColor = null;
							i = scene.children.length;
						}
					}
					if(intersects.length) {
						if(typeOf(intersects[0].object.userData.previousColor)!='number') {
							intersects[0].object.userData.previousColor = intersects[0].object.material.color.getHex();
							intersects[0].object.material.color.set(0x333333 | intersects[0].object.userData.previousColor);
							interface.setField('blockName', 'text', intersects[0].object.userData.tooltip || intersects[0].object.userData.name || intersects[0].object.name);
							interface.setField('tooltip', 'styles', {
								'display': 'block',
								'left': mouse.pos.x+1,
								'top': mouse.pos.y+1
							});
						}
					} else {
						interface.setField('tooltip', 'styles', {
							'display': 'none',
						});
					}
					if(control == 'fperson') {
						if(controls.active('foward')) {
							camera.translateZ(-speed);
						} else if(controls.active('backward')) {
							camera.translateZ(speed);
						}
						if(controls.active('left')) {
							camera.translateX(-speed);
						} else if (controls.active('right')) {
							camera.translateX(speed);
						}
						if(controls.active('accelerate')) {
							speed *= 2;
						} else if(controls.active('slowdown')) {
							speed /= 2;
						} else if(controls.active('defaultspeed')) {
							speed = 12.8;
						}
						if(controls.active('looking')) {
							if(mouse.ref.x != mouse.pos.x || mouse.ref.y != mouse.pos.y) {
								tmp = -Math.PI/width * (mouse.pos.x - mouse.ref.x);
								quaternionLook.x.setFromAxisAngle(new THREE.Vector3(0, 1, 0), tmp);
								tmp = -Math.PI/height * (mouse.pos.y - mouse.ref.y);
								quaternionLook.y.setFromAxisAngle(new THREE.Vector3(1, 0, 0), tmp);
								camera.quaternion.multiply(quaternionLook.y);
								camera.quaternion.multiply(quaternionLook.x);
							}
							controls.mouse(mouse.pos);
						} else if(controls.active('jump')) {
							interface.resetaCamera();
						}
					} else if(control == 'orbital') {
						controlOrbital.update();
					}

					interface.setField('speed', 'text', speed);
					interface.setField('mouseX', 'text', mouse.pos.x);
					interface.setField('mouseY', 'text', mouse.pos.y);

					interface.update(timestamp);
					if(interface.city) {
						light2.position.set(interface.city.options.widthBlock + 5, 150, interface.city.options.depthBlock + 5);
						light3.position.set((interface.city.options.widthBlock)/3, 75, (interface.city.options.depthBlock)/3);
						light4.position.set((interface.city.options.widthBlock)*2/3, 75, (interface.city.options.depthBlock)*2/3);
					}
				}

				renderer.render(scene, camera);

				requestAnimationFrame(render);
			}
			render();
		});
	})(document.id, document.getElements);
