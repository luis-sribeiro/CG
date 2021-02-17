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
	const cameraModoDeInspecao = criarCameraInspecao();
	const cameraModoDeJogo = criarCameraJogo();

	var modoCameraAlterado = false; // Para não trocar mais de 1x por vez que a tecla é pressionada

	return {
		cameraJogo: cameraModoDeJogo,
		cameraInspecao: cameraModoDeInspecao,
		cameraAtual: cameraModoDeJogo,
		trocarModoCamera: function () {
			if (modoCameraAlterado)
				return;

			if (this.cameraAtual === cameraModoDeJogo) {
				this.cameraAtual = cameraModoDeInspecao;
				kart.entrarEmModoDeInspecao();
			}
			else {
				this.cameraAtual = cameraModoDeJogo;
				kart.sairDoModoDeInspecao();
			}

			modoCameraAlterado = true;
		},
		possibilitarNovaTrocaDoModoDeCamera: function () {
			modoCameraAlterado = false;
		},
		update: function () {
			if (this.cameraAtual === cameraModoDeJogo)
				atualizarCameraJogo();
		}
	}

	function criarCameraJogo() {
		var kartPosition = kart.objetoThreeJs.position;
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.copy(new THREE.Vector3(kartPosition.x, kartPosition.y - 13, kartPosition.z + 2));
		camera.lookAt(kartPosition);
		camera.up.set(0, 0, 1);
		return camera;
	}

	function criarCameraInspecao() {
		var kartPosition = kart.objetoThreeJs.position;
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.copy(new THREE.Vector3(7, 10, kartPosition.z + 3.3));
		camera.lookAt(0, 0, kart.objetoThreeJs.position.z);
		camera.up.set(0, 0, 1);
		return camera;
	}

	function atualizarCameraJogo() {
		var kartPosition = kart.objetoThreeJs.position;
		var kartRotation = kart.objetoThreeJs.rotation;

		var cameraX = kartPosition.x - (13 * Math.sin(-kartRotation.z));
		var cameraY = kartPosition.y - (13 * Math.cos(-kartRotation.z));

		cameraModoDeJogo.position.copy(new THREE.Vector3(cameraX, cameraY, kartPosition.z + 3.3));
		cameraModoDeJogo.lookAt(kartPosition);
		cameraModoDeJogo.up.set(0, 0, 1);
	}
}

function Teclado(camera, kart) {
	const tecladoModoJogo = new KeyboardState();
	const tecladoModoInspecao = new KeyboardState();

	var tecladoAtual = camera.cameraAtual === camera.cameraJogo
		? tecladoModoJogo
		: tecladoModoInspecao;

	return {
		update: function () {
			tecladoAtual.update();
			if (camera.cameraAtual === camera.cameraJogo) {
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

		if (tecladoModoJogo.pressed("down")) kart.frear();
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
			.rotateZ(grausParaRadianos(-43));

		m1Grande.add(m1Pequena);
		m1Grande.add(m1Media);

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
			adicionarPosteComLampada(495, -300);
			adicionarPosteComLampada(495, -100);
			adicionarPosteComLampada(495, 100);
			adicionarPosteComLampada(495, 300);

			adicionarPosteComLampada(-495, -300);
			adicionarPosteComLampada(-495, 300);

			adicionarPosteComLampada(-295, 50);
			adicionarPosteComLampada(-50, -150);
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
		luzDirecional.position.copy(new THREE.Vector3(500, 500, 1000));
		luzDirecional.shadow.mapSize.width = 2048;
		luzDirecional.shadow.mapSize.height = 2048;
		luzDirecional.castShadow = true;

		luzDirecional.shadow.camera.left = -200;
		luzDirecional.shadow.camera.right = 200;
		luzDirecional.shadow.camera.top = 200;
		luzDirecional.shadow.camera.bottom = -200;
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
		var tamanhoPoste = { raio: 0.1, altura: 20 };
		var materialPoste = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)', shininess: "200" });
		var geometriaPoste = new THREE.CylinderGeometry(tamanhoPoste.raio, tamanhoPoste.raio, tamanhoPoste.altura, 32);
		var poste = new THREE.Mesh(geometriaPoste, materialPoste);
		poste.position.set(x, y, 0);
		poste.translateZ(tamanhoPoste.altura * 0.5);
		poste.rotation.x = grausParaRadianos(90);

		var raioLampada = 0.5;
		var geometriaLampada = new THREE.SphereGeometry(raioLampada, 32, 32);
		var materialLampada = new THREE.MeshPhongMaterial({ color: corPadrao });
		var lampada = new THREE.Mesh(geometriaLampada, materialLampada);
		lampada.translateY((tamanhoPoste.altura * 0.5) + (raioLampada * 0.5));
		poste.add(lampada);

		var luzLampada = new THREE.PointLight();
		luzLampada.position.copy(lampada.position);
		luzLampada.intensity = 0.2;
		luzLampada.castShadow = true;
		lampada.add(luzLampada);

		postes.push(poste);
		lampadas.push(lampada);
	}
}


function normalizeAndRescale(obj, newScale) {
	var scale = getMaxSize(obj);
	obj.scale.set(
		newScale * (1.0 / scale),
		newScale * (1.0 / scale),
		newScale * (1.0 / scale)
	);
	return obj;
}

function fixPosition(obj) {
	// Fix position of the object over the ground plane
	var box = new THREE.Box3().setFromObject(obj);
	obj.rotateX(grausParaRadianos(90)); //Objeto está deixado ao ser carregado
	if (box.min.y > 0)
		obj.translateY(-box.min.y);
	else
		obj.translateY(-1 * box.min.y);

	//Posiciona o objeto no plano
	obj.translateZ(-150);
	obj.translateX(-150);

	return obj;
}

//Conferir material da estátua
function criaEstatua(scene) {
	loader = new THREE.OBJLoader();
	loader.load(
		'assets/lucy_angel.obj',
		function (object) {
			var obj = object;
			obj.traverse(function (node) {
				node.castShadow = true;
			});

			obj = normalizeAndRescale(obj, 50);
			obj = fixPosition(obj);
			scene.add(obj);
		}
	)
}


function main() {
	var stats = initStats();          // To show FPS information
	var scene = new THREE.Scene();    // Create main scene
	var renderer = initRenderer();    // View function in util/utils

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

	// Cria o kart
	var kart = new Kart();
	kart.definirPosicao(new THREE.Vector3(485, 0, kart.objetoThreeJs.position.z));
	kart.objetoThreeJs.receiveSh
	scene.add(kart.objetoThreeJs);

	// Adiciona as montanhas
	var montanhas = new Montanhas();
	scene.add(montanhas.montanha1);
	scene.add(montanhas.montanha2);

	// Adiciona a estátua
	criaEstatua(scene);

	// Inicializa os modos de câmera
	var camera = new Camera(kart);

	// Habilita controles do teclado
	var teclado = new Teclado(camera, kart);

	// Configura a iluminação
	var iluminacao = new Iluminacao(kart.objetoThreeJs);
	iluminacao.adicionarPostesPadrao();

	scene.add(iluminacao.luzDirecional);
	scene.add(iluminacao.holofoteKart);
	scene.add(iluminacao.luzAmbiente);
	iluminacao.postes.forEach(function (poste) { scene.add(poste) });

	// Enable mouse rotation, pan, zoom etc.
	var trackballControls = new THREE.TrackballControls(camera.cameraInspecao, renderer.domElement);

	// Listen window size changes
	window.addEventListener(
		'resize',
		function () { onWindowResize(camera.cameraJogo, renderer) },
		false
	);

	window.addEventListener(
		'resize',
		function () { onWindowResize(camera.cameraInspecao, renderer) },
		false
	);

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
		trackballControls.update(); // Enable mouse movements
		camera.update();
		iluminacao.update();
		teclado.update();
		kart.atualizarPosicao();
		kart.atualizarAnguloPneus();
		requestAnimationFrame(render);
		renderer.render(scene, camera.cameraAtual) // Render scene
	}
}

function grausParaRadianos(graus) {
	return graus * (Math.PI / 180);
}