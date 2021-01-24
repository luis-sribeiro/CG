function Kart() {
	var material = new THREE.MeshPhongMaterial({ color: 'rgb(100,255,100)' });
	var matrizRotacao = new THREE.Matrix4();

	var tamanhoCockpit = { x: 2.5, y: 3.5, z: 0.7 };
	var tamanhoBico = { x: tamanhoCockpit.z, y: tamanhoCockpit.y * 0.5, z: tamanhoCockpit.z };
	var tamanhoAsaDianteira = { x: tamanhoCockpit.x, y: tamanhoBico.y * 0.3, z: tamanhoBico.z * 0.5 };
	var tamanhoLigacaoTraseira = { x: tamanhoBico.x, y: tamanhoBico.y * 0.5, z: tamanhoBico.z };
	var tamanhoBaseAsaTraseira = { x: tamanhoLigacaoTraseira.x * 0.05, y: tamanhoLigacaoTraseira.y * 0.5, z: tamanhoLigacaoTraseira.z * 0.5 };
	var tamanhoAsaTraseira = { x: (tamanhoCockpit.x - tamanhoLigacaoTraseira.x) * 1.2, y: tamanhoBaseAsaTraseira.y, z: tamanhoBaseAsaTraseira.x };
	var tamanhoEixoPneu = { raio: tamanhoBico.z * 0.15, altura: ((tamanhoAsaDianteira.x - tamanhoBico.x) * 0.5) };
	var tamanhoPneu = { raioTorus: 0.3, raioTubo: tamanhoEixoPneu.altura * 0.25 };

	var cockpit = criarCockpit();
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
	var pneuDianteiroDireito = criarPneuDianteiroDireito();
	var pneuDianteiroEsquerdo = criarPneuDianteiroEsquerdo();
	var pneuTraseiroDireito = criarPneuTraseiroDireito();
	var pneuTraseiroEsquerdo = criarPneuTraseiroEsquerdo();

	cockpit.add(bico);
	bico.add(asaDianteira);
	bico.add(eixoPneuDianteiroDireito);
	bico.add(eixoPneuDianteiroEsquerdo);
	eixoPneuDianteiroDireito.add(pneuDianteiroDireito);
	eixoPneuDianteiroEsquerdo.add(pneuDianteiroEsquerdo);

	cockpit.add(ligacaoTraseira);
	ligacaoTraseira.add(eixoPneuTraseiroDireito);
	ligacaoTraseira.add(eixoPneuTraseiroEsquerdo);
	eixoPneuTraseiroDireito.add(pneuTraseiroDireito);
	eixoPneuTraseiroEsquerdo.add(pneuTraseiroEsquerdo);
	ligacaoTraseira.add(baseDireitaAsaTraseira);
	ligacaoTraseira.add(baseEsquerdaAsaTraseira);
	ligacaoTraseira.add(asaTraseira);

	cockpit.position.set(0.0, 0.0, (tamanhoCockpit.z / 2) + 0.15);

	return cockpit;

	// Funções auxiliares para criação dos sólidos
	function criarCockpit() {
		return criarParalelepípedo(tamanhoCockpit);
	}

	function criarBico() {
		return criarParalelepípedo(tamanhoBico)
			.translateY((tamanhoCockpit.y * 0.5) + (tamanhoBico.y * 0.5));
	}

	function criarAsaDianteira() {
		return criarParalelepípedo(tamanhoAsaDianteira)
			.translateY((tamanhoBico.y * 0.5) - (tamanhoAsaDianteira.y * 0.5))
			.translateZ(tamanhoBico.z * -0.25);
	}

	function criarLigacaoTraseira() {
		return criarParalelepípedo(tamanhoLigacaoTraseira)
			.translateY((tamanhoCockpit.y * -0.5) + (tamanhoLigacaoTraseira.y * -0.5));
	}

	function criarBaseDireitaAsaTraseira() {
		return criarParalelepípedo(tamanhoBaseAsaTraseira)
			.translateX((tamanhoLigacaoTraseira.x * 0.25))
			.translateZ((tamanhoLigacaoTraseira.z + tamanhoBaseAsaTraseira.z) * 0.5);
	}

	function criarBaseEsquerdaAsaTraseira() {
		return criarParalelepípedo(tamanhoBaseAsaTraseira)
			.translateX((tamanhoLigacaoTraseira.x * -0.25))
			.translateZ((tamanhoLigacaoTraseira.z + tamanhoBaseAsaTraseira.z) * 0.5);
	}

	function criarAsaTraseira() {
		return criarParalelepípedo(tamanhoAsaTraseira)
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
		eixoPneuDianteiroDireito.matrix.multiply(matrizRotacao.makeRotationZ(degreesToRadians(90)));
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
		eixoPneuDianteiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationZ(degreesToRadians(90)));
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
		eixoPneuTraseiroDireito.matrix.multiply(matrizRotacao.makeRotationZ(degreesToRadians(90)));
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
		eixoPneuTraseiroEsquerdo.matrix.multiply(matrizRotacao.makeRotationZ(degreesToRadians(90)));
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
	function criarParalelepípedo(tamanho) {
		var geometria = new THREE.BoxGeometry(tamanho.x, tamanho.y, tamanho.z);
		return new THREE.Mesh(geometria, material);
	}

	function criarCilindro(tamanho) {
		var geometria = new THREE.CylinderGeometry(tamanho.raio, tamanho.raio, tamanho.altura, 32);
		var cilindro = new THREE.Mesh(geometria, material);
		cilindro.matrixAutoUpdate = false;
		cilindro.matrix.identity();
		return cilindro;
	}

	function criarTorus(tamanho) {
		var geometria = new THREE.TorusGeometry(tamanho.raioTorus, tamanho.raioTubo, 50, 50);
		var torus = new THREE.Mesh(geometria, material);
		torus.matrixAutoUpdate = false;
		torus.matrix.identity();
		return torus;
	}
}

function main() {
	var stats = initStats();          // To show FPS information
	var scene = new THREE.Scene();    // Create main scene
	var renderer = initRenderer();    // View function in util/utils
	var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

	var light = initDefaultLighting(scene, new THREE.Vector3(7, 7, 7));

	// Enable mouse rotation, pan, zoom etc.
	var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

	// Show axes (parameter is size of each axis)
	var axesHelper = new THREE.AxesHelper(12);
	scene.add(axesHelper);

	// create the ground plane
	var planeGeometry = new THREE.PlaneGeometry(20, 20);
	planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
	var planeMaterial = new THREE.MeshBasicMaterial({
		color: "rgba(150, 150, 150)",
		side: THREE.DoubleSide,
	});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	// add the plane to the scene
	scene.add(plane);

	// create the kart
	var kart = new Kart();

	// add the kart to the scene
	scene.add(kart);

	// Use this to show information onscreen
	controls = new InfoBox();
	controls.add("Basic Scene");
	controls.addParagraph();
	controls.add("Use mouse to interact:");
	controls.add("* Left button to rotate");
	controls.add("* Right button to translate (pan)");
	controls.add("* Scroll to zoom in/out.");
	controls.show();

	// Listen window size changes
	window.addEventListener(
		'resize',
		function () { onWindowResize(camera, renderer) },
		false
	);

	render();

	function render() {
		stats.update(); // Update FPS
		trackballControls.update(); // Enable mouse movements
		requestAnimationFrame(render);
		renderer.render(scene, camera) // Render scene
	}
}

function degreesToRadians(degrees) {
	var pi = Math.PI;
	return degrees * (pi / 180);
}
