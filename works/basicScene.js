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
	var velocidadeMaxima = 100;
	var velocidadeAtual = 0;

	// Controle do ângulo em que o kart fará curvas
	var pneuDianteiroDireito;
	var pneuDianteiroEsquerdo;
	var anguloMaximo = Math.PI * 0.15;
	var anguloMinimo = Math.PI * -0.15;
	var angulo = 0;

	// Controle da inércia
	var kartEstaEmInercia = true;
	var volanteEstaSolto = true;

	var objetoThreeJs = criarKart();

	return {
		objetoThreeJs: objetoThreeJs,
		acelerar: function () {
			if (velocidadeAtual >= velocidadeMaxima) return;

			kartEstaEmInercia = false;
			velocidadeAtual += 0.5;
		},
		frear: function () {
			if (velocidadeAtual <= 0) return;

			kartEstaEmInercia = false;
			velocidadeAtual -= velocidadeAtual < 0.7
				? velocidadeAtual
				: 0.7;
		},
		entrarEmInercia: function () {
			kartEstaEmInercia = true;
		},
		virarADireita: function () {
			if (angulo < anguloMinimo) return;

			volanteEstaSolto = false;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(-0.05));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(-0.05));
			angulo -= 0.05;
		},
		virarAEsquerda: function () {
			if (angulo > anguloMaximo) return;

			volanteEstaSolto = false;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(0.05));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(0.05));
			angulo += 0.05;
		},
		soltarVolante: function () {
			volanteEstaSolto = true;
		},
		atualizarPosicao: function () {
			if (kartEstaEmInercia && velocidadeAtual > 0)
				velocidadeAtual -= velocidadeAtual < 0.3
					? velocidadeAtual
					: 0.3;

			var distanciaPercorrer = velocidadeAtual * 0.02;
			objetoThreeJs.translateY(distanciaPercorrer);

			if (velocidadeAtual > 0)
				objetoThreeJs.rotation.z += angulo * 0.04;
		},
		atualizarAnguloPneus: function () {
			if (angulo === 0 || !volanteEstaSolto) return;

			var anguloParcial = Math.abs(angulo) < 0.05
				? -angulo
				: (Math.abs(angulo) * -1) / angulo * 0.05;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(anguloParcial));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(anguloParcial));
			angulo += anguloParcial;
		},
		reset: function () {
			objetoThreeJs.rotation.z = 0;
			pneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationY(-angulo));
			pneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationY(-angulo));
			angulo = 0;
			objetoThreeJs.position.set(0.0, 0.0, 0.0);
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

		// Junção das partes
		baseCockpit.add(bico);
		baseCockpit.add(limiteFrontalCockpit);
		baseCockpit.add(limiteTraseiroCockpit);
		baseCockpit.add(limiteLateralDireitoCockpit);
		baseCockpit.add(limiteLateralEsquerdoCockpit);
		baseCockpit.add(baseBanco);
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

function Camera(kart) {
	var cameraModoDeJogo = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	cameraModoDeJogo.position.copy(new THREE.Vector3(kart.position.x, kart.position.y - 13, kart.position.z + 5));
	cameraModoDeJogo.lookAt(kart.position);
	cameraModoDeJogo.up.set(0, 0, 1);

	var modoCamera = 'jogo';

	return {
		cameraPerspectiva: cameraModoDeJogo,
		modo: modoCamera,
		trocarModoCamera: function () {
			modoCamera = modoCamera === 'jogo' ? 'inspecao' : 'jogo';
		},
		update: function () {
			if (modoCamera === 'jogo') {
				var cameraX = kart.position.x - (13 * Math.sin(-kart.rotation.z));
				var cameraY = kart.position.y - (13 * Math.cos(-kart.rotation.z));

				cameraModoDeJogo.position.copy(new THREE.Vector3(cameraX, cameraY , kart.position.z + 5));
				cameraModoDeJogo.lookAt(kart.position);
			}
		}
	}
}

function Iluminacao(kart) {
	var holofote = new THREE.SpotLight(0xffffff);
	holofote.target = kart;
	holofote.position.set(kart.position.x, kart.position.y - 10, kart.position.z + 5);
	holofote.shadow.mapSize.width = 2048;
	holofote.shadow.mapSize.height = 2048;
	holofote.shadow.camera.fov = 60;
	holofote.castShadow = true;
	holofote.decay = 2;
	holofote.penumbra = 0.05;
	holofote.name = "Holofote";

	var luzAmbiente = new THREE.AmbientLight(0x343434);
	luzAmbiente.name = "LuzAmbiente";

	return {
		holofote: holofote,
		luzAmbiente: luzAmbiente,
		update: function () {
			holofote.position.copy(new THREE.Vector3(kart.position.x + 7, kart.position.y + 7, kart.position.z + 7));
		}
	}
}

function main() {
	var stats = initStats();          // To show FPS information
	var scene = new THREE.Scene();    // Create main scene
	var renderer = initRenderer();    // View function in util/utils

	var keyboard = new KeyboardState();

	// Show axes (parameter is size of each axis)
	var axesHelper = new THREE.AxesHelper(12);
	scene.add(axesHelper);

	// create the ground plane
	var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 40, 40);
	planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
	var planeMaterial = new THREE.MeshBasicMaterial({
		color: "rgba(20, 30, 110)",
		side: THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value pushes polygon further away
		polygonOffsetUnits: 1
	});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(plane);

	var wireframe = new THREE.WireframeGeometry(planeGeometry);
	var line = new THREE.LineSegments(wireframe);
	line.material.color.setStyle("rgb(180, 180, 180)");
	scene.add(line);

	// create the kart
	var kart = new Kart();
	scene.add(kart.objetoThreeJs);

	// Initialize camera
	var camera = new Camera(kart.objetoThreeJs);

	var iluminacao = new Iluminacao(kart.objetoThreeJs);
	scene.add(iluminacao.holofote);
	scene.add(iluminacao.luzAmbiente);

	// Enable mouse rotation, pan, zoom etc.
	var trackballControls = new THREE.TrackballControls(camera.cameraPerspectiva, renderer.domElement);


	var controls = new function () {
		this.trocarModoCamera = function () {
			camera.trocarModoCamera();
		}
	};

	var gui = new dat.GUI();
	gui.add(controls, 'trocarModoCamera').name("Trocar câmera");


	// Listen window size changes
	window.addEventListener(
		'resize',
		function () { onWindowResize(camera.cameraPerspectiva, renderer) },
		false
	);

	render();

	function keyboardUpdate() {
		keyboard.update();

		if (keyboard.pressed("up")) kart.acelerar();
		if (keyboard.up("up")) kart.entrarEmInercia();

		if (keyboard.pressed("down")) kart.frear();
		if (keyboard.up("down")) kart.entrarEmInercia();

		if (keyboard.pressed("left")) kart.virarAEsquerda();
		if (keyboard.up("left")) kart.soltarVolante();

		if (keyboard.pressed("right")) kart.virarADireita();
		if (keyboard.up("right")) kart.soltarVolante();

		if (keyboard.pressed("R")) kart.reset();

		kart.atualizarPosicao();
		kart.atualizarAnguloPneus();
	}

	function render() {
		stats.update(); // Update FPS
		trackballControls.update(); // Enable mouse movements
		camera.update();
		iluminacao.update();
		keyboardUpdate();
		requestAnimationFrame(render);
		renderer.render(scene, camera.cameraPerspectiva) // Render scene
	}
}

function grausParaRadianos(degrees) {
	var pi = Math.PI;
	return degrees * (pi / 180);
}