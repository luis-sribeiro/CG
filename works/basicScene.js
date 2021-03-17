function Kart() {
	var materialCorpoKart = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
	var materialRodas = new THREE.MeshPhongMaterial({ color: 'rgb(35,23,9)' });
	var materialEixos = new THREE.MeshPhongMaterial({ color: 'rgb(80,80,80)' });

	var matrizRotacao = new THREE.Matrix4();

	var tamanhoBaseCockpit = { x: 2.5, y: 3.5, z: 0.2 };
	var tamanhoLimiteFrontalCockpit = { x: tamanhoBaseCockpit.x, y: tamanhoBaseCockpit.y * 0.25, z: tamanhoBaseCockpit.z * 3.5 };
	var tamanhoLimiteLateralCockpit = { x: tamanhoBaseCockpit.x * 0.25, y: tamanhoBaseCockpit.y, z: tamanhoBaseCockpit.z * 3.5 };
	var tamanhoBaseBanco = { x: tamanhoBaseCockpit.x * 0.3, y: tamanhoBaseCockpit.y * 0.2, z: tamanhoBaseCockpit.z * 0.5 };
	var tamanhoEncostoBanco = { x: tamanhoBaseCockpit.x * 0.3, y: tamanhoBaseCockpit.z * 0.5, z: tamanhoBaseCockpit.z * 5 };

	var tamanhoBico = { x: tamanhoLimiteFrontalCockpit.z, y: tamanhoBaseCockpit.y * 0.5, z: tamanhoLimiteFrontalCockpit.z };
	var tamanhoAsaDianteira = { x: tamanhoBaseCockpit.x, y: tamanhoBico.y * 0.3, z: tamanhoBico.z * 0.5 };
	var tamanhoLigacaoTraseira = { x: tamanhoBico.x, y: tamanhoBico.y * 0.7, z: tamanhoBico.z };
	var tamanhoBaseAsaTraseira = { x: tamanhoLigacaoTraseira.x * 0.05, y: tamanhoLigacaoTraseira.y * 0.5, z: tamanhoLigacaoTraseira.z * 0.5 };
	var tamanhoAsaTraseira = { x: (tamanhoBaseCockpit.x - tamanhoLigacaoTraseira.x) * 1.2, y: tamanhoBaseAsaTraseira.y, z: tamanhoBaseAsaTraseira.x };
	var tamanhoEixoPneu = { raio: tamanhoBico.z * 0.15, altura: ((tamanhoAsaDianteira.x - tamanhoBico.x) * 0.5) };
	var tamanhoPneu = { raioTorus: 0.3, raioTubo: tamanhoEixoPneu.altura * 0.25 };

	// Controle da velocidade do kart
	var velocidadeMaxima = 150;
	var velocidadeMaximaRe = -25;
	var velocidadeAtual = 0;

	// Controle do ângulo em que o kart fará curvas
	var pneuDianteiroDireito;
	var pneuDianteiroEsquerdo;
	var anguloMaximo = Math.PI * 0.25;
	var anguloMinimo = Math.PI * -0.25;
	var passoAtualizacaoAngulo = 0.08;
	var angulo = 0;

	// Controle da inércia
	var kartEstaEmInercia = true;
	var volanteEstaSolto = true;

	// Polígonos do kart
	var objetoThreeJs = criarKart();

	// Controle do estado do kart para ser recuperado após mudança de câmera
	var valoresOriginaisAoEntrarEmInspecao = {
		posicao: new THREE.Vector3(
			objetoThreeJs.position.x,
			objetoThreeJs.position.y,
			objetoThreeJs.position.z
		),
		rotacaoZ: objetoThreeJs.rotation.z
	};

	return {
		objetoThreeJs: objetoThreeJs,
		acelerar: function () {
			if (velocidadeAtual >= velocidadeMaxima) return;

			kartEstaEmInercia = false;
			velocidadeAtual += 1;
		},
		frearOuDarRe: function () {
			if (velocidadeAtual <= velocidadeMaximaRe) return;

			kartEstaEmInercia = false;
			velocidadeAtual -= velocidadeAtual >= 0 ? 1.5 : 0.5;
		},
		entrarEmInercia: function () {
			kartEstaEmInercia = true;
		},
		virarADireita: function () {
			if (angulo < anguloMinimo) return;

			volanteEstaSolto = false;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(-passoAtualizacaoAngulo));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(-passoAtualizacaoAngulo));
			angulo -= passoAtualizacaoAngulo;
		},
		virarAEsquerda: function () {
			if (angulo > anguloMaximo) return;

			volanteEstaSolto = false;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(passoAtualizacaoAngulo));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(passoAtualizacaoAngulo));
			angulo += passoAtualizacaoAngulo;
		},
		soltarVolante: function () {
			volanteEstaSolto = true;
		},
		atualizarPosicao: function () {
			if (kartEstaEmInercia && velocidadeAtual !== 0) {
				var moduloVelocidadeAtual = Math.abs(velocidadeAtual);
				var unidadeVelocidadeAtual = (velocidadeAtual / moduloVelocidadeAtual);
				velocidadeAtual -= moduloVelocidadeAtual < 0.3
					? velocidadeAtual
					: 0.3 * unidadeVelocidadeAtual;
			}

			var distanciaPercorrer = velocidadeAtual * 0.02;
			objetoThreeJs.translateY(distanciaPercorrer);

			if (velocidadeAtual === 0) return;

			var anguloParaRotacionarKart = velocidadeAtual > 0
				? angulo * 0.04
				: angulo * -0.04;
			objetoThreeJs.rotation.z += anguloParaRotacionarKart;
		},
		atualizarAnguloPneus: function () {
			if (angulo === 0 || !volanteEstaSolto) return;

			var anguloParcial = Math.abs(angulo) < passoAtualizacaoAngulo
				? -angulo
				: (Math.abs(angulo) * -1) / angulo * passoAtualizacaoAngulo;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(anguloParcial));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(anguloParcial));
			angulo += anguloParcial;
		},
		entrarEmModoDeInspecao: function () {
			valoresOriginaisAoEntrarEmInspecao = {
				posicao: new THREE.Vector3(
					objetoThreeJs.position.x,
					objetoThreeJs.position.y,
					objetoThreeJs.position.z
				),
				rotacaoZ: objetoThreeJs.rotation.z
			}

			objetoThreeJs.rotation.z = 0;
			objetoThreeJs.position.set(0, 0, objetoThreeJs.position.z);
			velocidadeAtual = 0;
		},
		sairDoModoDeInspecao: function () {
			objetoThreeJs.position.copy(valoresOriginaisAoEntrarEmInspecao.posicao);
			objetoThreeJs.rotation.z = valoresOriginaisAoEntrarEmInspecao.rotacaoZ;
		},
		definirPosicao: function (novaPosicao) {
			objetoThreeJs.position.copy(novaPosicao);
		}
	};

	// Função principal para criação do objeto Kart
	function criarKart() {
		// Corpo principal
		var baseCockpit = criarBaseCockpit();
		var limiteFrontalCockpit = criarLimiteDianteiroCockpit();
		var limiteTraseiroCockpit = criarLimiteTraseiroCockpit();
		var limiteLateralDireitoCockpit = criarLimiteLateralDireitoCockpit();
		var limiteLateralEsquerdoCockpit = criarLimiteLateralEsquerdoCockpit();
		var baseBanco = criarBaseBanco();
		var encostoBanco = criarEncostoBanco();

		var bico = criarBico();
		var asaDianteira = criarAsaDianteira();
		var ligacaoTraseira = criarLigacaoTraseira();
		var baseDireitaAsaTraseira = criarBaseDireitaAsaTraseira();
		var baseEsquerdaAsaTraseira = criarBaseEsquerdaAsaTraseira();
		var asaTraseira = criarAsaTraseira();

		// Eixos dos pneus
		var eixoPneuDianteiroDireito = criarEixoPneuDianteiroDireito();
		var eixoPneuDianteiroEsquerdo = criarEixoPneuDianteiroEsquerdo();
		var eixoPneuTraseiroDireito = criarEixoPneuTraseiroDireito();
		var eixoPneuTraseiroEsquerdo = criarEixoPneuTraseiroEsquerdo();

		// Pneus
		pneuDianteiroDireito = criarPneuDianteiroDireito();
		pneuDianteiroEsquerdo = criarPneuDianteiroEsquerdo();
		var pneuTraseiroDireito = criarPneuTraseiroDireito();
		var pneuTraseiroEsquerdo = criarPneuTraseiroEsquerdo();


		var textureLoader = new THREE.TextureLoader();

		//Cria o plano que levará o logo da Ferrari
		var logoFerrari = textureLoader.load('assets/textures/ferrari_logo.jpg');
		logoFerrari.generateMipmaps = false;
		logoFerrari.minFilter = THREE.LinearFilter;
		logoFerrari.needsUpdate = true;
		const ferraritGeometry = new THREE.PlaneGeometry(0.75, 1, 32);
		const ferrariMaterial = new THREE.MeshLambertMaterial({ map: logoFerrari, side: THREE.DoubleSide });
		const ferrariPlane = new THREE.Mesh(ferraritGeometry, ferrariMaterial);
		ferrariPlane.translateY(0.075);
		ferrariPlane.rotateX(grausParaRadianos(90));

		//Cria o plano que levará o primeiro adeviso de chamas
		var flame1Logo = textureLoader.load('assets/textures/flame_1.png');
		flame1Logo.generateMipmaps = false;
		flame1Logo.minFilter = THREE.LinearFilter;
		flame1Logo.needsUpdate = true;
		const flame1Geometry = new THREE.PlaneGeometry(2, 0.5, 50);
		const flame1Material = new THREE.MeshLambertMaterial({ map: flame1Logo, side: THREE.DoubleSide });
		const flame1Plane = new THREE.Mesh(flame1Geometry, flame1Material);
		flame1Plane.translateX(0.33);
		flame1Plane.rotateX(grausParaRadianos(90));
		flame1Plane.rotateY(grausParaRadianos(90));

		//Cria o plano que levará o segundo adeviso de chamas
		var flame2Logo = textureLoader.load('assets/textures/flame_2.png');
		flame2Logo.generateMipmaps = false;
		flame2Logo.minFilter = THREE.LinearFilter;
		flame2Logo.needsUpdate = true;
		const flame2Geometry = new THREE.PlaneGeometry(2, 0.5, 50);
		const flame2Material = new THREE.MeshLambertMaterial({ map: flame2Logo, side: THREE.DoubleSide });
		const flame2Plane = new THREE.Mesh(flame2Geometry, flame2Material);
		flame2Plane.translateX(-0.33);
		flame2Plane.rotateX(grausParaRadianos(90));
		flame2Plane.rotateY(grausParaRadianos(90));


		//Cria o plano que levará o adeviso das folhas
		var leafLogo = textureLoader.load('assets/textures/leaf.png');
		leafLogo.generateMipmaps = false;
		leafLogo.minFilter = THREE.LinearFilter;
		leafLogo.needsUpdate = true;
		const leafGeometry = new THREE.PlaneGeometry(2, 0.7, 50);
		const leafMaterial = new THREE.MeshLambertMaterial({ map: leafLogo, side: THREE.DoubleSide });
		const leafPlane = new THREE.Mesh(leafGeometry, leafMaterial);
		leafPlane.translateZ(0.36);

		// Junção das partes
		baseCockpit.add(bico);
		baseCockpit.add(limiteFrontalCockpit);
		limiteFrontalCockpit.add(leafPlane);
		baseCockpit.add(limiteTraseiroCockpit);
		limiteLateralDireitoCockpit.add(flame1Plane);
		baseCockpit.add(limiteLateralDireitoCockpit);
		limiteLateralEsquerdoCockpit.add(flame2Plane);
		baseCockpit.add(limiteLateralEsquerdoCockpit);
		baseCockpit.add(baseBanco);
		encostoBanco.add(ferrariPlane);
		baseCockpit.add(encostoBanco);

		bico.add(asaDianteira);
		bico.add(eixoPneuDianteiroDireito);
		bico.add(eixoPneuDianteiroEsquerdo);
		eixoPneuDianteiroDireito.add(pneuDianteiroDireito);
		eixoPneuDianteiroEsquerdo.add(pneuDianteiroEsquerdo);

		baseCockpit.add(ligacaoTraseira);
		ligacaoTraseira.add(eixoPneuTraseiroDireito);
		ligacaoTraseira.add(eixoPneuTraseiroEsquerdo);
		eixoPneuTraseiroDireito.add(pneuTraseiroDireito);
		eixoPneuTraseiroEsquerdo.add(pneuTraseiroEsquerdo);
		ligacaoTraseira.add(baseDireitaAsaTraseira);
		ligacaoTraseira.add(baseEsquerdaAsaTraseira);
		ligacaoTraseira.add(asaTraseira);

		return baseCockpit;
	}

	// Funções auxiliares para criação dos sólidos
	function criarBaseCockpit() {
		return criarParalelepipedo(tamanhoBaseCockpit)
			.translateZ((tamanhoBaseCockpit.z * 0.5) + 0.15);
	}

	function criarLimiteDianteiroCockpit() {
		return criarParalelepipedo(tamanhoLimiteFrontalCockpit)
			.translateY((tamanhoBaseCockpit.y - tamanhoLimiteFrontalCockpit.y) * 0.5)
			.translateZ((tamanhoBaseCockpit.z - tamanhoLimiteFrontalCockpit.z) * -0.5);
	}

	function criarLimiteTraseiroCockpit() {
		return criarParalelepipedo(tamanhoLimiteFrontalCockpit)
			.translateY((tamanhoBaseCockpit.y - tamanhoLimiteFrontalCockpit.y) * -0.5)
			.translateZ((tamanhoBaseCockpit.z - tamanhoLimiteFrontalCockpit.z) * -0.5);
	}

	function criarLimiteLateralDireitoCockpit() {
		return criarParalelepipedo(tamanhoLimiteLateralCockpit)
			.translateX((tamanhoBaseCockpit.x - tamanhoLimiteLateralCockpit.x) * 0.5)
			.translateZ((tamanhoBaseCockpit.z - tamanhoLimiteLateralCockpit.z) * -0.5);
	}

	function criarLimiteLateralEsquerdoCockpit() {
		return criarParalelepipedo(tamanhoLimiteLateralCockpit)
			.translateX((tamanhoBaseCockpit.x - tamanhoLimiteLateralCockpit.x) * -0.5)
			.translateZ((tamanhoBaseCockpit.z - tamanhoLimiteLateralCockpit.z) * -0.5);
	}

	function criarBaseBanco() {
		return criarParalelepipedo(tamanhoBaseBanco)
			.translateY((tamanhoBaseCockpit.y - tamanhoLimiteFrontalCockpit.y * 2 - tamanhoBaseBanco.y) * -0.5)
			.translateZ((tamanhoBaseCockpit.z + tamanhoBaseBanco.z) * 0.5);
	}

	function criarEncostoBanco() {
		return criarParalelepipedo(tamanhoEncostoBanco)
			.translateY((tamanhoBaseCockpit.y - tamanhoLimiteFrontalCockpit.y * 2 - tamanhoEncostoBanco.y) * -0.5)
			.translateZ((tamanhoBaseCockpit.z + tamanhoEncostoBanco.z) * 0.5);
	}

	function criarBico() {
		return criarParalelepipedo(tamanhoBico)
			.translateY((tamanhoBaseCockpit.y + tamanhoBico.y) * 0.5)
			.translateZ((tamanhoLimiteFrontalCockpit.z - tamanhoBaseCockpit.z) * 0.5);
	}

	function criarAsaDianteira() {
		return criarParalelepipedo(tamanhoAsaDianteira)
			.translateY((tamanhoBico.y - tamanhoAsaDianteira.y) * 0.5)
			.translateZ(tamanhoBico.z * -0.25);
	}

	function criarLigacaoTraseira() {
		return criarParalelepipedo(tamanhoLigacaoTraseira)
			.translateY((tamanhoBaseCockpit.y + tamanhoLigacaoTraseira.y) * -0.5)
			.translateZ((tamanhoLimiteFrontalCockpit.z - tamanhoBaseCockpit.z) * 0.5);
	}

	function criarBaseDireitaAsaTraseira() {
		return criarParalelepipedo(tamanhoBaseAsaTraseira)
			.translateX((tamanhoLigacaoTraseira.x * 0.25))
			.translateZ((tamanhoLigacaoTraseira.z + tamanhoBaseAsaTraseira.z) * 0.5);
	}

	function criarBaseEsquerdaAsaTraseira() {
		return criarParalelepipedo(tamanhoBaseAsaTraseira)
			.translateX((tamanhoLigacaoTraseira.x * -0.25))
			.translateZ((tamanhoLigacaoTraseira.z + tamanhoBaseAsaTraseira.z) * 0.5);
	}

	function criarAsaTraseira() {
		return criarParalelepipedo(tamanhoAsaTraseira)
			.translateZ((tamanhoBaseAsaTraseira.z) + ((tamanhoLigacaoTraseira.z + tamanhoAsaTraseira.z) * 0.5));
	}

	function criarEixoPneuDianteiroDireito() {
		var eixoPneuDianteiroDireito = criarCilindro(tamanhoEixoPneu);
		eixoPneuDianteiroDireito.matrix.multiply(
			matrizRotacao.makeTranslation(
				(tamanhoBico.x + tamanhoEixoPneu.altura) * 0.5,
				tamanhoAsaDianteira.y * -0.5,
				0
			)
		);
		eixoPneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationZ(grausParaRadianos(90)));
		return eixoPneuDianteiroDireito;
	}

	function criarEixoPneuDianteiroEsquerdo() {
		var eixoPneuDianteiroEsquerdo = criarCilindro(tamanhoEixoPneu);
		eixoPneuDianteiroEsquerdo.matrix.multiply(
			matrizRotacao.makeTranslation(
				(tamanhoBico.x + tamanhoEixoPneu.altura) * -0.5,
				tamanhoAsaDianteira.y * -0.5,
				0
			)
		);
		eixoPneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationZ(grausParaRadianos(90)));
		return eixoPneuDianteiroEsquerdo;
	}

	function criarEixoPneuTraseiroDireito() {
		var eixoPneuTraseiroDireito = criarCilindro(tamanhoEixoPneu);
		eixoPneuTraseiroDireito.matrix.multiply(
			matrizRotacao.makeTranslation(
				(tamanhoBico.x + tamanhoEixoPneu.altura) * 0.5,
				0,
				0
			)
		);
		eixoPneuTraseiroDireito.matrix.multiply(matrizRotacao.makeRotationZ(grausParaRadianos(90)));
		return eixoPneuTraseiroDireito;
	}

	function criarEixoPneuTraseiroEsquerdo() {
		var eixoPneuTraseiroEsquerdo = criarCilindro(tamanhoEixoPneu);
		eixoPneuTraseiroEsquerdo.matrix.multiply(
			matrizRotacao.makeTranslation(
				(tamanhoBico.x + tamanhoEixoPneu.altura) * -0.5,
				0,
				0
			)
		);
		eixoPneuTraseiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationZ(grausParaRadianos(90)));
		return eixoPneuTraseiroEsquerdo;
	}

	function criarPneuDianteiroDireito() {
		var pneuDianteiroDireito = criarTorus(tamanhoPneu);
		pneuDianteiroDireito.matrix.multiply(
			matrizRotacao.makeTranslation(
				0,
				tamanhoEixoPneu.altura * -0.5,
				0
			)
		);
		pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationX(degreesToRadians(90)));
		return pneuDianteiroDireito;
	}

	function criarPneuDianteiroEsquerdo() {
		var pneuDianteiroEsquerdo = criarTorus(tamanhoPneu);
		pneuDianteiroEsquerdo.matrix.multiply(
			matrizRotacao.makeTranslation(
				0,
				tamanhoEixoPneu.altura * 0.5,
				0
			)
		);
		pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationX(degreesToRadians(90)));
		return pneuDianteiroEsquerdo;
	}

	function criarPneuTraseiroDireito() {
		var pneuTraseiroDireito = criarTorus(tamanhoPneu);
		pneuTraseiroDireito.matrix.multiply(
			matrizRotacao.makeTranslation(
				0,
				tamanhoEixoPneu.altura * -0.5,
				0
			)
		);
		pneuTraseiroDireito.matrix.multiply(matrizRotacao.makeRotationX(degreesToRadians(90)));
		return pneuTraseiroDireito;
	}

	function criarPneuTraseiroEsquerdo() {
		var pneuTraseiroEsquerdo = criarTorus(tamanhoPneu);
		pneuTraseiroEsquerdo.matrix.multiply(
			matrizRotacao.makeTranslation(
				0,
				tamanhoEixoPneu.altura * 0.5,
				0
			)
		);
		pneuTraseiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationX(degreesToRadians(90)));
		return pneuTraseiroEsquerdo;
	}

	// Funções de criação genéricas
	function criarParalelepipedo(tamanho) {
		var geometria = new THREE.BoxGeometry(tamanho.x, tamanho.y, tamanho.z);
		return new THREE.Mesh(geometria, materialCorpoKart);
	}

	function criarCilindro(tamanho) {
		var geometria = new THREE.CylinderGeometry(tamanho.raio, tamanho.raio, tamanho.altura, 32);
		var cilindro = new THREE.Mesh(geometria, materialEixos);
		cilindro.matrixAutoUpdate = false;
		cilindro.matrix.identity();
		return cilindro;
	}

	function criarTorus(tamanho) {
		var geometria = new THREE.TorusGeometry(tamanho.raioTorus, tamanho.raioTubo, 50, 50);
		var torus = new THREE.Mesh(geometria, materialRodas);
		torus.matrixAutoUpdate = false;
		torus.matrix.identity();
		return torus;
	}
}

function Camera(kart, renderer) {
	const cameraModoDeInspecao = criarCameraInspecao();
	const cameraModoDeJogoPadrao = criarCameraJogoPadrao();
	const cameraModoDeJogoCockpit = criarCameraJogoCockpit();

	var trackballControlsCameraInspecao = new THREE.TrackballControls(cameraModoDeInspecao, renderer.domElement);

	const modosCamera = {
		0: cameraModoDeJogoPadrao,
		1: cameraModoDeJogoCockpit,
		2: cameraModoDeInspecao,
		indiceAtual: 0,
		proximoModoCamera: function () {
			this.indiceAtual = (modosCamera.indiceAtual + 1) % 3;
			return modosCamera[this.indiceAtual];
		}
	}

	var modoCameraAlterado = false; // Para não trocar mais de 1x por vez que a tecla é pressionada

	return {
		cameraJogoPadrao: cameraModoDeJogoPadrao,
		cameraJogoCockpit: cameraModoDeJogoCockpit,
		cameraInspecao: cameraModoDeInspecao,
		cameraAtual: modosCamera[modosCamera.indiceAtual],
		trocarModoCamera: function () {
			if (modoCameraAlterado)
				return;

			const cameraAntiga = this.cameraAtual;
			this.cameraAtual = modosCamera.proximoModoCamera();

			if (this.cameraAtual === cameraModoDeInspecao) {
				kart.entrarEmModoDeInspecao();
			}
			else if (cameraAntiga === cameraModoDeInspecao) {
				kart.sairDoModoDeInspecao();
			}

			modoCameraAlterado = true;
		},
		possibilitarNovaTrocaDoModoDeCamera: function () {
			modoCameraAlterado = false;
		},
		update: function () {
			if (this.cameraAtual === cameraModoDeJogoPadrao)
				atualizarCameraJogoPadrao();
			else if (this.cameraAtual === cameraModoDeJogoCockpit)
				atualizarCameraCockpit();
			else
				trackballControlsCameraInspecao.update();
		}
	}

	function criarCameraJogoPadrao() {
		var kartPosition = kart.objetoThreeJs.position;
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
		camera.lookAt(kartPosition);
		camera.up.set(0, 0, 1);

		window.addEventListener(
			'resize',
			function () { onWindowResize(cameraModoDeJogoPadrao, renderer) },
			false
		);

		return camera;
	}

	function criarCameraInspecao() {
		var kartPosition = kart.objetoThreeJs.position;
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
		camera.position.copy(new THREE.Vector3(7, 10, kartPosition.z + 3.3));
		camera.lookAt(0, 0, kart.objetoThreeJs.position.z);
		camera.up.set(0, 0, 1);

		window.addEventListener(
			'resize',
			function () { onWindowResize(cameraModoDeInspecao, renderer) },
			false
		);

		return camera;
	}

	function criarCameraJogoCockpit() {
		var kartPosition = kart.objetoThreeJs.position;
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
		camera.lookAt(kartPosition);
		camera.up.set(0, 0, 1);

		window.addEventListener(
			'resize',
			function () { onWindowResize(cameraModoDeJogoPadrao, renderer) },
			false
		);

		return camera;
	}

	function atualizarCameraJogoPadrao() {
		var kartPosition = kart.objetoThreeJs.position;
		var kartRotation = kart.objetoThreeJs.rotation;

		var cameraX = kartPosition.x - (13 * Math.sin(-kartRotation.z));
		var cameraY = kartPosition.y - (13 * Math.cos(-kartRotation.z));
		var cameraZ = kartPosition.z + 3.3;

		cameraModoDeJogoPadrao.position.copy(new THREE.Vector3(cameraX, cameraY, cameraZ));
		cameraModoDeJogoPadrao.lookAt(kartPosition);
		cameraModoDeJogoPadrao.up.set(0, 0, 1);
	}

	function atualizarCameraCockpit() {
		var kartPosition = kart.objetoThreeJs.position;
		var kartRotation = kart.objetoThreeJs.rotation;

		const distanciaCamera = -0.8;
		var cameraX = kartPosition.x + (distanciaCamera * Math.sin(-kartRotation.z));
		var cameraY = kartPosition.y + (distanciaCamera * Math.cos(-kartRotation.z));
		var cameraZ = kartPosition.z + 1;

		const distanciaLookAt = 5;
		var lookAtX = kartPosition.x + (distanciaLookAt * Math.sin(-kartRotation.z));
		var lookAtY = kartPosition.y + (distanciaLookAt * Math.cos(-kartRotation.z));
		var lookAtZ = kartPosition.z + 1;

		cameraModoDeJogoCockpit.position.copy(new THREE.Vector3(cameraX, cameraY, cameraZ));
		cameraModoDeJogoCockpit.lookAt(lookAtX, lookAtY, lookAtZ);
		cameraModoDeJogoCockpit.up.set(0, 0, 1);
	}
}

function Teclado(camera, kart) {
	const tecladoModoJogo = new KeyboardState();
	const tecladoModoInspecao = new KeyboardState();

	var tecladoAtual = camera.cameraAtual !== camera.cameraInspecao
		? tecladoModoJogo
		: tecladoModoInspecao;

	return {
		update: function () {
			tecladoAtual.update();
			if (camera.cameraAtual !== camera.cameraInspecao) {
				tecladoAtual = tecladoModoJogo;
				configurarTecladoJogo();
			}
			else {
				tecladoAtual = tecladoModoInspecao;
				configurarTecladoInspecao();
			}
		}
	}

	function configurarTecladoJogo() {
		if (tecladoModoJogo.pressed("up")) kart.acelerar();
		if (tecladoModoJogo.up("up")) kart.entrarEmInercia();

		if (tecladoModoJogo.pressed("down")) kart.frearOuDarRe();
		if (tecladoModoJogo.up("down")) kart.entrarEmInercia();

		if (tecladoModoJogo.pressed("left")) kart.virarAEsquerda();
		if (tecladoModoJogo.up("left")) kart.soltarVolante();

		if (tecladoModoJogo.pressed("right")) kart.virarADireita();
		if (tecladoModoJogo.up("right")) kart.soltarVolante();

		if (tecladoModoJogo.pressed("space")) camera.trocarModoCamera();
		if (tecladoModoJogo.up("space")) camera.possibilitarNovaTrocaDoModoDeCamera();
	}

	function configurarTecladoInspecao() {
		if (tecladoModoInspecao.pressed("space")) camera.trocarModoCamera();
		if (tecladoModoInspecao.up("space")) camera.possibilitarNovaTrocaDoModoDeCamera();

		if (tecladoModoJogo.pressed("left")) kart.virarAEsquerda();
		if (tecladoModoJogo.up("left")) kart.soltarVolante();

		if (tecladoModoJogo.pressed("right")) kart.virarADireita();
		if (tecladoModoJogo.up("right")) kart.soltarVolante();
	}
}

function Montanhas() {
	const materialBase = new THREE.MeshLambertMaterial({ color: 'rgb(100,70,20)' });
	const pontosBase = definirPontosBase();

	var m1 = criarM1();
	var m2 = criarM2();

	return {
		montanha1: m1,
		montanha2: m2
	}

	function criarM1() {
		var m1Pequena = criarMontanhaBase(4);
		var m1Media = criarMontanhaBase(6);
		var m1Grande = criarMontanhaBase(10);

		m1Pequena
			.translateY(50)
			.rotateZ(grausParaRadianos(83));
		m1Media
			.translateX(35)
			.translateY(35)
			.rotateZ(grausParaRadianos(20));
		m1Grande
			.translateX(300)
			.rotateZ(grausParaRadianos(-43));

		m1Grande.add(m1Pequena);
		m1Grande.add(m1Media);

		m1Grande.translateX(-220);
		m1Grande.translateY(-205);
		m1Grande.scale.set(0.27, 0.27, 0.27);

		return m1Grande;
	}

	function criarM2() {
		var m2Pequena = criarMontanhaBase(3);
		var m2Grande = criarMontanhaBase(5);

		m2Pequena
			.translateX(10)
			.translateY(20)
			.rotateZ(grausParaRadianos(38));
		m2Grande
			.translateX(-50)
			.translateY(400)
			.rotateZ(51);

		m2Grande.translateX(-145);
		m2Grande.translateY(-365);
		m2Grande.scale.set(0.5, 0.5, 0.5);

		m2Grande.add(m2Pequena);
		return m2Grande;
	}

	function criarMontanhaBase(escala) {
		var pontosMontanha = pontosBase.map(function (ponto) {
			return new THREE.Vector3(ponto.x * escala, ponto.y * escala, ponto.z * escala);
		});

		var geometriaMontanha = new THREE.ConvexBufferGeometry(pontosMontanha);
		var montanha = new THREE.Mesh(geometriaMontanha, materialBase);
		montanha.castShadow = true;
		return montanha;
	}

	function definirPontosBase() {
		var pontos = [];

		function adicionarPontoBase(x, y) {
			adicionarPonto(x, y, 0);
		}

		function adicionarPonto(x, y, z) {
			pontos.push(new THREE.Vector3(x, y, z));
		}

		adicionarPontoBase(-4.1, 3.56);
		adicionarPontoBase(-5.36, 2.3);
		adicionarPontoBase(-6.12, -0.32);
		adicionarPontoBase(-5, -3);
		adicionarPontoBase(-3.1, -6.2);
		adicionarPontoBase(0.62, -7.04);
		adicionarPontoBase(5, -6);
		adicionarPontoBase(6.92, -3.5);
		adicionarPontoBase(7.04, -0.6);
		adicionarPontoBase(5.8, 2.04);
		adicionarPontoBase(3.58, 4);
		adicionarPontoBase(0.16, 5.02);
		adicionarPontoBase(-2.24, 4.96);

		adicionarPonto(-3.76, 2.7, 3.2);
		adicionarPonto(-4.24, 0.78, 3.3);
		adicionarPonto(-3.9, -1.58, 3.1);
		adicionarPonto(-3, -3.7, 3.6);
		adicionarPonto(-0.48, -5.48, 3.1);
		adicionarPonto(1.9, -5.62, 3.7);
		adicionarPonto(4.72, -4.48, 3.2);
		adicionarPonto(5.08, -1.86, 3.6);
		adicionarPonto(5.14, 0.38, 3.7);
		adicionarPonto(3.96, 2.26, 3.2);
		adicionarPonto(1.88, 2.32, 3.0);
		adicionarPonto(0.26, 3.7, 3.2);
		adicionarPonto(-2.2, 3.9, 3.7);

		adicionarPonto(-2.58, 1.54, 6.0);
		adicionarPonto(-2.46, 0.1, 6.2);
		adicionarPonto(-1.64, -1.7, 6.8);
		adicionarPonto(2.54, -1.56, 6.4);
		adicionarPonto(3.42, 0.5, 6.7);
		adicionarPonto(1.94, 1.66, 6.3);
		adicionarPonto(-0.46, 2.62, 6.5);

		adicionarPonto(1.3, 0.2, 7);
		adicionarPonto(-1.3, -0.2, 7);
		adicionarPonto(0.5, -0.4, 7);

		adicionarPonto(0, 0, 8);
		return pontos;
	}
}

function Iluminacao(kart) {
	const corPadrao = 'rgb(255,255,255)';

	var luzDirecional = criarLuzDirecional();
	var luzAmbiente = criarLuzAmbiente();
	var holofoteKart = criarHolofoteDoKart();

	var postes = new Array(); 	// Contém poste + lâmpada + PointLight
	var lampadas = new Array(); // Contém apenas o PointLight

	return {
		luzDirecional: luzDirecional,
		luzAmbiente: luzAmbiente,
		holofoteKart: holofoteKart,
		luzesPontuais: lampadas,
		postes: postes,
		update: function () {
			holofoteKart.position.set(kart.position.x, kart.position.y, kart.position.z + 10);
		},
		adicionarPostesPadrao: function () {
			adicionarPosteComLampada(60, -90);
			adicionarPosteComLampada(20, -90);
			adicionarPosteComLampada(-20, -90);
			adicionarPosteComLampada(-60, -90);

			adicionarPosteComLampada(80, 105);
			adicionarPosteComLampada(13, 40);

			adicionarPosteComLampada(-50, 10);
			adicionarPosteComLampada(-100, 70);
		},
		toggleLuzDirecional: function () {
			luzDirecional.visible = !luzDirecional.visible;
		},
		toggleHolofoteKart: function () {
			holofoteKart.visible = !holofoteKart.visible;
		},
		toggleLuzesPontuais: function () {
			lampadas.forEach(function (lampada) {
				lampada.visible = !lampada.visible;
			});
		}
	};

	function criarLuzDirecional() {
		var luzDirecional = new THREE.DirectionalLight(corPadrao);
		luzDirecional.position.copy(new THREE.Vector3(0, 0, 500));
		luzDirecional.shadow.mapSize.width = 2048;
		luzDirecional.shadow.mapSize.height = 2048;
		luzDirecional.castShadow = true;
		var offset = 200;
		luzDirecional.shadow.camera.left = -offset;
		luzDirecional.shadow.camera.right = offset;
		luzDirecional.shadow.camera.top = offset;
		luzDirecional.shadow.camera.bottom = -offset;
		return luzDirecional;
	}

	function criarLuzAmbiente() {
		var luzAmbiente = new THREE.AmbientLight('rgb(50,50,50)');
		return luzAmbiente;
	}

	function criarHolofoteDoKart() {
		var holofote = new THREE.SpotLight(corPadrao);
		holofote.target = kart;
		holofote.position.set(kart.position.x, kart.position.y, kart.position.z + 10);
		holofote.shadow.mapSize.width = 2048;
		holofote.shadow.mapSize.height = 2048;
		holofote.shadow.camera.fov = 60;
		holofote.castShadow = true;
		holofote.decay = 2;
		holofote.penumbra = 0.05;
		holofote.name = "Holofote do Kart";
		return holofote;
	}

	// Adiciona um poste e uma lâmpada aos seus respectivos arrays.
	// As lâmpadas são guardadas separadas para facilitar sua ativação e desativação.
	function adicionarPosteComLampada(x, y) {
		var tamanhoPoste = { raio: 0.2, altura: 20 };
		var materialPoste = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)', shininess: "200" });
		var geometriaPoste = new THREE.CylinderGeometry(tamanhoPoste.raio, tamanhoPoste.raio, tamanhoPoste.altura, 32);
		var poste = new THREE.Mesh(geometriaPoste, materialPoste);
		poste.position.set(x, y, 0);
		poste.translateZ(tamanhoPoste.altura * 0.5);
		poste.rotation.x = grausParaRadianos(90);

		var raioLampada = 1;
		var geometriaLampada = new THREE.SphereGeometry(raioLampada, 32, 32);
		var materialLampada = new THREE.MeshPhongMaterial({ color: corPadrao });
		var lampada = new THREE.Mesh(geometriaLampada, materialLampada);
		lampada.translateY((tamanhoPoste.altura * 0.5) + (raioLampada * 0.5));
		poste.add(lampada);

		var luzLampada = new THREE.SpotLight(corPadrao);
		luzLampada.position.copy(lampada.position);
		luzLampada.angle = Math.PI / 4;
		luzLampada.penumbra = 0.1;
		luzLampada.decay = 2;
		luzLampada.distance = 200;
		luzLampada.castShadow = true;
		luzLampada.shadow.mapSize.width = 512;
		luzLampada.shadow.mapSize.height = 512;
		luzLampada.shadow.camera.near = 10;
		luzLampada.shadow.camera.far = 200;
		luzLampada.shadow.focus = 1;
		luzLampada.target = lampada;
		lampada.add(luzLampada);

		postes.push(poste);
		lampadas.push(lampada);
	}
}


function setaEscala(obj, newScale) {
	var scale = getMaxSize(obj);
	obj.scale.set(
		newScale * (1.0 / scale),
		newScale * (1.0 / scale),
		newScale * (1.0 / scale)
	);
	return obj;
}

function criaEstatua(scene) {
	loader = new THREE.OBJLoader();
	loader.load(
		'assets/lucy_angel.obj',
		function (obj) {
			var materialEstatua = new THREE.MeshPhongMaterial({ color: 'rgb(150,150,150)' })
			obj.castShadow = true;
			obj = setaEscala(obj, 30);
			obj.rotateX(grausParaRadianos(90)); //Objeto está deitado ao ser carregado
			obj.rotateY(grausParaRadianos(90)); //Objeto está deitado ao ser carregado
			obj.translateZ(-47);
			obj.translateX(50);
			obj.traverse(function (child) {

				if (child instanceof THREE.Mesh) {
					child.material = materialEstatua;
				}

			});

			scene.add(obj);
		}
	)
}



function criaCaixa(scene) {
	const manager = new THREE.LoadingManager();
	const textureLoader = new THREE.TextureLoader();
	textureLoader.setPath('assets/wood_boxes/');
	manager.addHandler(/\.jpg$/i, textureLoader);
	new THREE.MTLLoader(manager)
		.setPath('assets/wood_boxes/')
		.load('Wooden_stuff.mtl', function (materials) {

			materials.preload();

			new THREE.OBJLoader(manager)
				.setMaterials(materials)
				.setPath('assets/wood_boxes/')
				.load('Wooden_stuff.obj', function (obj) {

					obj.castShadow = true;
					const scale = 4;
					obj = setaEscala(obj, scale);
					obj.position.x = 12;
					obj.position.y = 50;
					obj.position.z = scale / 2.0;
					scene.add(obj);

				});

		});
}


function criaCone(scene) {
	const manager = new THREE.LoadingManager();
	const textureLoader = new THREE.TextureLoader();
	textureLoader.setPath('assets/cone/');
	manager.addHandler(/\.jpg$/i, textureLoader);
	new THREE.MTLLoader(manager)
		.setPath('assets/cone/')
		.load('Cone.mtl', function (materials) {

			materials.preload();

			new THREE.OBJLoader(manager)
				.setMaterials(materials)
				.setPath('assets/cone/')
				.load('Cone.obj', function (obj) {

					obj.castShadow = true;
					const scale = 3;
					obj.rotateX(grausParaRadianos(90));
					obj = setaEscala(obj, scale);
					obj.position.x = 30;
					obj.position.y = -60;
					obj.position.z = 0;
					scene.add(obj);

				});

		});
}



function main() {
	var stats = initStats();          // To show FPS information
	var scene = new THREE.Scene();    // Create main scene
	var renderer = initRenderer();    // View function in util/utils

	// Show axes (parameter is size of each axis)
	var axesHelper = new THREE.AxesHelper(12);
	scene.add(axesHelper);

	//Carregamento das texturas
	var textureLoader = new THREE.TextureLoader();
	var trackTexture = textureLoader.load('assets/textures/pista.jpg');
	var sandTexture = textureLoader.load('assets/textures/sand.jpg');

	//Repetição da textura de area
	sandTexture.wrapS = THREE.RepeatWrapping;
	sandTexture.wrapT = THREE.RepeatWrapping;
	sandTexture.repeat.set(275, 275);

	// create the ground plane
	var planeGeometry = new THREE.PlaneGeometry(200, 200, 40, 40);
	planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
	var planeMaterial = new THREE.MeshLambertMaterial({
		//color: "rgba(20, 30, 110)",
		side: THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value pushes polygon further away
		polygonOffsetUnits: 1
	});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(plane);
	plane.material.map = trackTexture;

	// Cria o plano auxiliar que receberá a textura de areia
	var auxPlaneGeometry = new THREE.PlaneGeometry(20000, 20000, 40, 40);
	auxPlaneGeometry.translate(0.0, 0.0, -0.12); // To avoid conflict with ground plane
	var auxPlaneMaterial = new THREE.MeshLambertMaterial({
		//color: "rgba(20, 30, 110)",
		side: THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value pushes polygon further away
		polygonOffsetUnits: 1
	});
	var auxPlane = new THREE.Mesh(auxPlaneGeometry, auxPlaneMaterial);
	scene.add(auxPlane);
	auxPlane.material.map = sandTexture;

	// Cria skybox
	var skyboxGeometry = new THREE.BoxGeometry(20000, 20000, 20000);
	var skyboxPath = 'assets/textures/skyboxes/';

	// Algumas texturas para testar (talvez alterar na versão final do game)
	var envs = ['crimson-tide_', 'bloody-heresy_'];
	var skyboxTexture = envs[0];

	var skyboxUp = textureLoader.load(skyboxPath + skyboxTexture + 'up.png');
	var skyboxDown = textureLoader.load(skyboxPath + skyboxTexture + 'dn.png');
	var skyboxRight = textureLoader.load(skyboxPath + skyboxTexture + 'rt.png');
	var skyboxLeft = textureLoader.load(skyboxPath + skyboxTexture + 'lf.png');
	var skyboxBack = textureLoader.load(skyboxPath + skyboxTexture + 'bk.png');
	var skyboxFront = textureLoader.load(skyboxPath + skyboxTexture + 'ft.png');

	var skyboxMaterials = [
		new THREE.MeshLambertMaterial({ map: skyboxFront, side: THREE.DoubleSide }),
		new THREE.MeshLambertMaterial({ map: skyboxBack, side: THREE.DoubleSide }),
		new THREE.MeshLambertMaterial({ map: skyboxUp, side: THREE.DoubleSide }),
		new THREE.MeshLambertMaterial({ map: skyboxDown, side: THREE.DoubleSide }),
		new THREE.MeshLambertMaterial({ map: skyboxRight, side: THREE.DoubleSide }),
		new THREE.MeshLambertMaterial({ map: skyboxLeft, side: THREE.DoubleSide })
	];

	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
	skybox.rotateX(grausParaRadianos(90));
	scene.add(skybox);

	// Cria o kart
	var kart = new Kart();
	kart.definirPosicao(new THREE.Vector3(0, -65, kart.objetoThreeJs.position.z));
	kart.objetoThreeJs.rotateZ(grausParaRadianos(-90));
	scene.add(kart.objetoThreeJs);

	// Adiciona as montanhas
	var montanhas = new Montanhas();
	scene.add(montanhas.montanha1);
	scene.add(montanhas.montanha2);

	// Adiciona a estátua
	criaEstatua(scene);

	// Adiciona Caixa
	criaCaixa(scene);

	// Adiciona Cone
	criaCone(scene);

	// Inicializa os modos de câmera
	var camera = new Camera(kart, renderer);

	// Habilita controles do teclado
	var teclado = new Teclado(camera, kart);

	// Configura a iluminação
	var iluminacao = new Iluminacao(kart.objetoThreeJs);
	iluminacao.adicionarPostesPadrao();

	scene.add(iluminacao.luzDirecional);
	scene.add(iluminacao.holofoteKart);
	scene.add(iluminacao.luzAmbiente);
	iluminacao.postes.forEach(function (poste) { scene.add(poste); });

	buildInterface();
	render();

	function buildInterface() {

		var controls = new function () {
			this.luzDirecional = true;
			this.holofoteKart = true;
			this.luzesPontuais = true;

			this.switchLuzDirecional = function () {
				iluminacao.toggleLuzDirecional();
			};

			this.switchHolofoteKart = function () {
				iluminacao.toggleHolofoteKart();
			};

			this.switchLuzesPontuais = function () {
				iluminacao.toggleLuzesPontuais();
			};
		}

		var gui = new dat.GUI();

		gui.add(controls, 'luzDirecional', true)
			.name("Luz Direcional")
			.onChange(function (e) { controls.switchLuzDirecional() });

		gui.add(controls, 'holofoteKart', true)
			.name("Holofote Kart")
			.onChange(function (e) { controls.switchHolofoteKart() });

		gui.add(controls, 'luzesPontuais', true)
			.name("Luzes Pontuais")
			.onChange(function (e) { controls.switchLuzesPontuais() });
	}

	function render() {
		stats.update(); // Update FPS
		iluminacao.update();
		teclado.update();
		kart.atualizarPosicao();
		kart.atualizarAnguloPneus();
		camera.update();
		requestAnimationFrame(render);
		renderer.render(scene, camera.cameraAtual) // Render scene
	}
}

function grausParaRadianos(graus) {
	return graus * (Math.PI / 180);
}