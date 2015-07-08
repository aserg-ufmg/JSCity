(function($, $$){
	window.addEvent('domready', function() {
		var cena = new THREE.Scene(),
			renderer = new THREE.WebGLRenderer(),
			camera = new THREE.PerspectiveCamera(45, 1920/1080, 0.1, 10000000),
			quaternionOlhar = {x: new THREE.Quaternion(), y: new THREE.Quaternion()}, refCamera = null,
			luzAmbiente = new THREE.AmbientLight(0x777777),
			//lampada = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshPhongMaterial({color: 0x999900})),
			luz = new THREE.PointLight(0xFFFFFF, 1, 0),
			luz2 = new THREE.PointLight(0xFFFFFF, 1, 160),
			luz3 = new THREE.PointLight(0xFFFF99, .3, 75),
			luz4 = new THREE.PointLight(0xFFFF99, .3, 75),
			//lanterna = new THREE.SpotLight(0xFFFFFF, 1, 10, Math.PI/3),
			raycaster = new THREE.Raycaster(),

			canvas = $('vis'), largura=0, altura=0,
			interface = $('interface'),
			btOrbital = $('btOrbital'),
			btFPerson = $('btFPerson'),

			ultTimestamp = 0, n = 0, velocidade = 12.8,
			controle = 'orbital',
			controleOrbital = new THREE.OrbitControls(camera),
			controles = new Controles({
				'+': 'acelera',
				'-': 'desacelera',
				'*': 'velocidadePadrao',
				'up': 'frente',
				'w': 'frente',
				'down': 'tras',
				's': 'tras',
				'left': 'esquerda',
				'a': 'esquerda',
				'right': 'direita',
				'd': 'direita',
				'space': 'salto',
				'mouse': 'olhando'
			}), mouse = {};

		DOMEvent.defineKeys({
			'106': '*',
			'107': '+',
			'109': '-'
		});

		function onWindowResize() {
			var tam = canvas.getSize();
			camera.aspect = tam.x / tam.y;
			camera.updateProjectionMatrix();

			renderer.setSize(tam.x, tam.y);
			largura = tam.x;
			altura = tam.y;
		}
		window.addEvent('resize', onWindowResize);
		onWindowResize();
		renderer.setClearColor(0xbfd1e5);
		canvas.grab(renderer.domElement);

		//camera.add(lanterna);
		//lanterna.castShadow = true;
		//lanterna.position.set(0,0,-1);
		//lanterna.target = camera;

		/*
		luz.add(lampada);
		luz2.add(lampada.clone());
		luz3.add(lampada.clone());
		luz4.add(lampada.clone());
		*/
		luz.position.set(-5, 150, -5);
		luz2.position.set(5, 150, 5);
		luz3.position.set(5, 75, 5);
		luz4.position.set(5, 75, 5);
		//luz.shadowDarkness = .5;
		//luz.castShadow = true;
		//luz.shadowCameraVisible = true;
		cena.add(luzAmbiente);
		cena.add(luz);
		cena.add(luz2);
		cena.add(luz3);
		cena.add(luz4);

		function stopper(ev) {
			ev.stop();
		}

		new Elements([interface, $('tooltip')]).addEvents({'click': stopper, 'mousedown': stopper, 'contextmenu': stopper, 'selectstart': stopper});

		canvas.addEvent('contextmenu', stopper);
		renderer.domElement.addEvent('contextmenu', stopper);

		this.interface = interface = new Interface(interface, cena, camera);
		interface.setCampo('velocidade', 'dom', $('velocidade'));
		interface.setCampo('mouseX', 'dom', $('mouseX'));
		interface.setCampo('mouseY', 'dom', $('mouseY'));
		/*
		interface.setCampo('rayX', 'dom', $('rayX'));
		interface.setCampo('rayY', 'dom', $('rayY'));
		interface.setCampo('rayZ', 'dom', $('rayZ'));
		*/
		interface.setCampo('nomeBloco', 'dom', $('nomeBloco'));
		interface.setCampo('tooltip', 'dom', $('tooltip'));

		function setControle(tipo) {
			switch(tipo) {
				case 'orbital':
					controleOrbital.enabled = true;
					controleOrbital.damping = 0.2;
					controle = tipo;
					btOrbital.addClass('ativo');
					btFPerson.removeClass('ativo');
					break;
				case 'fperson':
					controleOrbital.enabled = false;
					controle = tipo;
					btFPerson.addClass('ativo');
					btOrbital.removeClass('ativo');
					break;
			}
		}
		btOrbital.addEvent('click', setControle.pass('orbital'));
		btOrbital.setStyle('cursor', 'pointer');
		btFPerson.addEvent('click', setControle.pass('fperson'));
		btFPerson.setStyle('cursor', 'pointer');
		setControle('orbital');

		//renderer.shadowMapEnabled = true;
		function render(timestamp) {

			var tmp, intersects, i;

			if((timestamp - ultTimestamp)>=40) {
				ultTimestamp = timestamp;

				tmp = new THREE.Vector2();
				mouse = controles.mouse();
				tmp.x = (mouse.pos.x / largura) * 2 - 1;
				tmp.y = -(mouse.pos.y / altura) * 2 + 1;
				raycaster.setFromCamera(tmp, camera);
				intersects = raycaster.intersectObjects(cena.children);

				/*
				interface.setCampo('rayX', 'text', raycaster.ray.origin.x);
				interface.setCampo('rayY', 'text', raycaster.ray.origin.y);
				interface.setCampo('rayZ', 'text', raycaster.ray.origin.z);
				*/

				// reset
				for (i = 0; i < cena.children.length; i++) {
					if(typeOf(cena.children[i].userData.corAnterior)=='number') {
						cena.children[i].material.color.set(cena.children[i].userData.corAnterior);
						cena.children[i].userData.corAnterior = null;
						i = cena.children.length;
					}
				}
				// marcar
				if(intersects.length) {
					if(typeOf(intersects[0].object.userData.corAnterior)!='number') {
						intersects[0].object.userData.corAnterior = intersects[0].object.material.color.getHex();
						intersects[0].object.material.color.set(0x333333 | intersects[0].object.userData.corAnterior);
						interface.setCampo('nomeBloco', 'text', intersects[0].object.userData.tooltip || intersects[0].object.userData.name || intersects[0].object.name);
						interface.setCampo('tooltip', 'styles', {
							'display': 'block',
							'left': mouse.pos.x+1,
							'top': mouse.pos.y+1
						});
					}
				} else {
					interface.setCampo('tooltip', 'styles', {
						'display': 'none',
					});
				}

				if(controle == 'fperson') {
					if(controles.ativo('frente')) {
						camera.translateZ(-velocidade);
					} else if(controles.ativo('tras')) {
						camera.translateZ(velocidade);
					}
					if(controles.ativo('esquerda')) {
						camera.translateX(-velocidade);
					} else if (controles.ativo('direita')) {
						camera.translateX(velocidade);
					}
					if(controles.ativo('acelera')) {
						velocidade *= 2;
					} else if(controles.ativo('desacelera')) {
						velocidade /= 2;
					} else if(controles.ativo('velocidadePadrao')) {
						velocidade = 12.8;
					}
					if(controles.ativo('olhando')) {
						if(mouse.ref.x != mouse.pos.x || mouse.ref.y != mouse.pos.y) {
							tmp = -Math.PI/largura * (mouse.pos.x - mouse.ref.x);
							quaternionOlhar.x.setFromAxisAngle(new THREE.Vector3(0, 1, 0), tmp);
							tmp = -Math.PI/altura * (mouse.pos.y - mouse.ref.y);
							quaternionOlhar.y.setFromAxisAngle(new THREE.Vector3(1, 0, 0), tmp);
							camera.quaternion.multiply(quaternionOlhar.y);
							camera.quaternion.multiply(quaternionOlhar.x);
						}
						controles.mouse(mouse.pos);
					} else if(controles.ativo('salto')) {
						interface.resetaCamera();
					}
				} else if(controle == 'orbital') {
					controleOrbital.update();
				}

				interface.setCampo('velocidade', 'text', velocidade);
				interface.setCampo('mouseX', 'text', mouse.pos.x);
				interface.setCampo('mouseY', 'text', mouse.pos.y);

				interface.atualizar(timestamp);
				if(interface.cidade) {
					luz2.position.set(interface.cidade.options.largura + 5, 150, interface.cidade.options.profundidade + 5);
					luz3.position.set((interface.cidade.options.largura)/3, 75, (interface.cidade.options.profundidade)/3);
					luz4.position.set((interface.cidade.options.largura)*2/3, 75, (interface.cidade.options.profundidade)*2/3);
				}
			}

			renderer.render(cena, camera);

			requestAnimationFrame(render);
		}
		render();
	});
})(document.id, document.getElements);
