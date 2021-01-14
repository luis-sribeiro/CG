function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
  var light  = initDefaultLighting(scene, new THREE.Vector3(0, 0, 15));
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Inicializacao das variaveis
  var currentSpherePosition = { x: 0.0, y: 0.0, z: 1.0 };
  var newSpherePosition = { x: 0.0, y: 0.0, z: 1.0 };
  var isMoving = false;
  var baseMoveSpeed = 0.05;

  // Show world axes
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // Objetos da cena
  // Ground
  var planeGeometry = new THREE.PlaneGeometry(50, 50);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgba(150, 150, 150)",
    side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  // Sphere
  var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(255,50,50)' });
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.translateZ(1.0);
  scene.add(sphere);

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  buildInterface();
  render();

  function moveSphere()
  {
    if (isMoving) {

      currentSpherePosition.x = moveStep(currentSpherePosition.x, newSpherePosition.x);
      currentSpherePosition.y = moveStep(currentSpherePosition.y, newSpherePosition.y);
      currentSpherePosition.z = moveStep(currentSpherePosition.z, newSpherePosition.z);

      sphere.position.set(currentSpherePosition.x, currentSpherePosition.y, currentSpherePosition.z);

      if (currentSpherePosition.x === newSpherePosition.x
        && currentSpherePosition.y === newSpherePosition.y
        && currentSpherePosition.z === newSpherePosition.z)
        {
          isMoving = false;
        }
    }

    function moveStep(currentAxisPosition, newAxisPosition) {

      var difference = Math.abs(currentAxisPosition - newAxisPosition);

      if (difference < baseMoveSpeed)
        return newAxisPosition;

      return currentAxisPosition < newAxisPosition
        ? currentAxisPosition + (difference * baseMoveSpeed)
        : currentAxisPosition - (difference * baseMoveSpeed);
    }
  }

  function buildInterface()
  {
    var controls = new function()
    {
      this.spherePositionX = currentSpherePosition.x;
      this.setSpherePositionX = function() {
        isMoving = false; // Stop the sphere if control is altered while moving
        newSpherePosition.x = this.spherePositionX;
      }

      this.spherePositionY = currentSpherePosition.y;
      this.setSpherePositionY = function () {
        isMoving = false; // Stop the sphere if control is altered while moving
        newSpherePosition.y = this.spherePositionY;
      }

      this.spherePositionZ = currentSpherePosition.z;
      this.setSpherePositionZ = function () {
        isMoving = false; // Stop the sphere if control is altered while moving
        newSpherePosition.z = this.spherePositionZ;
      }

      this.moveSpeed = baseMoveSpeed;
      this.setMoveSpeed = function () {
        isMoving = false;
        baseMoveSpeed = this.moveSpeed;
      }

      this.mover = function () {
        isMoving = true;
      }
    };

    // GUI interface
    var gui = new dat.GUI();
    gui.add(controls, 'spherePositionX', -24.00, 24.00)
      .onChange(function (e) { controls.setSpherePositionX() })
      .name("Sphere: X");

    gui.add(controls, 'spherePositionY', -24.00, 24.00)
      .onChange(function (e) { controls.setSpherePositionY() })
      .name("Sphere: Y");

    gui.add(controls, 'spherePositionZ', 1.0, 25.00)
      .onChange(function (e) { controls.setSpherePositionZ() })
      .name("Sphere: Z");

    gui.add(controls, 'moveSpeed', 0.05, 0.5)
      .onChange(function (e) { controls.setMoveSpeed() })
      .name("Move Speed");

    gui.add(controls, 'mover')
      .name("Mover");
  }

  function render()
  {
    stats.update(); // Update FPS
    trackballControls.update();
    lightFollowingCamera(light, camera);
    moveSphere();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}