

// Download the models at: https://www.cgtrader.com/items/1915278/download-page
let i = 0;
var state = "seas";
var dayTime = true;
var weatherState = "clear";
var isRaining = false;
var prevDayTime = false;
var mysystem;
var currentSkyboxName;

var url =
  "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var s = document.createElement("script");
s.src = url;
document.head.appendChild(s);
window.addEventListener("DOMContentLoaded", async function () {

  // get the canvas DOM element
  var canvas = document.getElementById("renderCanvas");

  // load the 3D engine
  var engine = new BABYLON.Engine(canvas, true);
  
  // createScene function that creates and return the scene
  var createScene = function (timeofDay, currentWeather) {
    var timeofDay = dayTime;
    weatherState = "clear";

    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // scene.debugLayer.show();

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      50,
      new BABYLON.Vector3(30, 5, 0),
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 40;
    camera.rotationOffset=0;
    camera.attachControl(canvas, true);
    var renderer = scene.enableDepthRenderer();

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    //add skybox to scene
    currentSkyboxName = "textures/overcastAndRainy/overcast";
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "textures/overcastAndRainy/overcast",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    //Water mesh and water material added to the scene
    var waterMaterial = new BABYLON.WaterMaterial(
      "waterMaterial",
      scene,
      new BABYLON.Vector2(512, 512)
    );
    waterMaterial.bumpTexture = new BABYLON.Texture(
      "//www.babylonjs.com/assets/waterbump.png",
      scene
    );
    waterMaterial.windForce = -10;
    waterMaterial.waveHeight = 1;
    waterMaterial.bumpHeight = 0.2;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 50.0;
    waterMaterial.colorBlendFactor = 0;
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    waterMaterial.colorBlendFactor = 0.3;
    waterMaterial.waterColor = new BABYLON.Color3(0, 0.1, 0.21);

    // Water mesh
    var waterMesh = BABYLON.Mesh.CreateGround(
      "waterMesh",
      1024,
      1024,
      32,
      scene,
      false
    );
    waterMesh.material = waterMaterial;

    //Ground
    var groundTexture = new BABYLON.Texture("dhow/sand.jpg", scene);
    groundTexture.vScale = groundTexture.uScale = 4.0;

    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = groundTexture;

    var ground = BABYLON.Mesh.CreateGround(
      "ground",
      512,
      512,
      32,
      scene,
      false
    );


    ground.position.y = -70;
    ground.material = groundMaterial;


    var boat = []
    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function(meshes) {
      //postioning of meshes
      for (mesh in meshes) {
        boat.push(mesh);


        //mesh positioning
        var dhow = meshes[mesh];
        console.log("Dhow position");
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        waterMaterial.addToRenderList(meshes[mesh]);
        // meshes[mesh].rotation.z = 120;


        // Boat's Action Manager Stuff 
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
          // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $("#dialog").dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function () {
                  $(this).dialog("close");
                }
              }
            ]
          });



        }));

        var hl = new BABYLON.HighlightLayer("hl1", scene);

        //On Mouse Enter
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
          console.log("ok im in the boat");
          hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99, 1, 0.51));
        }));

        //ON MOUSE EXIT
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
          // mesh.material.emissiveColor = BABYLON.Color3.Black();
          console.log("Ok im outside the boat");
          hl.removeMesh(meshes[mesh]);

        }));
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        let i = 0;

        scene.registerBeforeRender(function () {
          var x = meshes[mesh].position.x;
          var z = meshes[mesh].position.z;
          var waterHeight = getWaterHeightAtCoordinates(x, z, waterMaterial);
          meshes[mesh].position.y = waterHeight - 35;
          console.log(meshes[mesh].position.y);
          timeofDay = dayTime;
          //check time of day
          if (timeofDay == false) {
            console.log("israining is: " + isRaining);
            console.log("state is: " + weatherState);

            groundMaterial.diffuseColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            groundMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            if (currentSkyboxName != "textures/nightSkyboxClear/clearNight") {
              changeSkybox("textures/nightSkyboxClear/clearNight", skybox);
              skybox.dispose();
            }
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              console.log("should be enlarged!!!");
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                mysystem = systems;
              });
              isRaining = true;
            }
            //kill mystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              console.log("clear loop");
              if (mysystem != null) {
                console.log("kill");
                mysystem.dispose();
              }
            }
          }
          if (timeofDay == true) {
            groundMaterial.diffuseColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            groundMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            console.log(weatherState);
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              console.log("rainnn!!!");
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                mysystem = systems;
              });
              isRaining = true;
              if (currentSkyboxName != "textures/overcastAndRainy/overcast") {
                // skybox.dispose();
                // skyboxMaterial.dispose();
                // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
                // "textures/overcastAndRainy/overcast",
                // scene
                changeSkybox("textures/overcastAndRainy/overcast", skybox);
                skybox.dispose();
                // );
              }
            }
            //kill msystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              console.log("clear loop");
              if (mysystem != null) {
                console.log("kill");
                mysystem.dispose();
              }
              if (currentSkyboxName != "textures/TropicalSunnyDay") {
                //   skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
                //   "textures/TropicalSunnyDay",
                //   scene
                // );
                changeSkybox("textures/TropicalSunnyDay", skybox);
                skybox.dispose();
              }
            }
            // skybox.material = skyboxMaterial;

        }

          

          // Work on fixing boat inside water issue, dont delete

          // var size = meshes[mesh].getBoundingInfo().boundingBox.extendSize;
          // console.log("Size: ",size);


          // // waterMesh.subMeshes = [];
          // var verticesCount = waterMesh.getTotalVertices();
          // console.log("Vertices\n",verticesCount);


          // var transparent_material = BABYLON

          // if (waterMesh.intersectsMesh(meshes[mesh],false)){
          //   console.log("Boat is inside water");
          //   waterMesh.material.waterColor = new BABYLON.Color4(1, 0, 0, 1,0);
          // }
          // else{
          //   waterMesh.material.waterColor = new BABYLON.Color3(0, 0.1, 0.21);

          // }

        });

          



        //lower the boat as it was floating above the water
      }
    });
    console.log(i);

    

    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function (x, z, waterMaterial) {
      var time = waterMaterial._lastTime / 100000;
      return (
        Math.abs(
          Math.sin(x / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.x *
          5.0 +
          Math.cos(z / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.y *
          5.0
        ) * 0.6
      );
    };

    //Rain Stuff
    console.log("Ok lets try to do rain")
    //   BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then((set) => {
    //     set.start();
    // });
    function changeSkybox(pathToFile, localSkybox) {
      localSkybox.dispose();
      var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
      var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
        pathToFile,
        scene
      );
      skyboxMaterial.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
      waterMaterial.addToRenderList(skybox);
      currentSkyboxName = pathToFile;
    }

    // Default Environment




    // return the created scene
    return scene;
  };

  var beachSceneCreate = function (timeofDay, currentWeather) {
    // create a basic BJS Scene object

    var timeofDay = dayTime;
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // scene.debugLayer.show();

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      50,
      new BABYLON.Vector3(30, 5, 0),
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 40;
    camera.attachControl(canvas, true);
    var renderer = scene.enableDepthRenderer();

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    //fix specular to not make material so glossy
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0, 0, 0);

    //Adding the skybox to the scene
    currentSkyboxName = "textures/overcastAndRainy/overcast";

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "textures/TropicalSunnyDay",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    //Water mesh and water material added to the scene
    var waterMaterial = new BABYLON.WaterMaterial(
      "waterMaterial",
      scene,
      new BABYLON.Vector2(512, 512)
    );
    waterMaterial.bumpTexture = new BABYLON.Texture(
      "//www.babylonjs.com/assets/waterbump.png",
      scene
    );

    waterMaterial.windForce = -10;
    waterMaterial.waveHeight = 0.3;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 5.0;
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    waterMaterial.colorBlendFactor = 0.2;
    waterMaterial.waterColor = new BABYLON.Color3(0, 0.1, 0.4);

    // Water mesh
    var waterMesh = BABYLON.Mesh.CreateGround(
      "waterMesh",
      1024,
      1024,
      32,
      scene,
      false
    );
    waterMesh.material = waterMaterial;


    // Ground
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "textures/sandTexture.jpg",
      scene
    );

    groundMaterial.diffuseTexture.uScale = 20.0;
    groundMaterial.diffuseTexture.vScale = 20.0;

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
      "ground",
      "heightmap/heightmapBeach.jpg",
      1500,
      1500,
      250,
      -14,
      15,
      scene,
      false
    );
    ground.material = groundMaterial;

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function (
      meshes
    ) {
      //postioning of meshes
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        console.log("Dhow position");
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        waterMaterial.addToRenderList(meshes[mesh]);



        //Boat UI Code
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
          // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $("#dialog").dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function () {
                  $(this).dialog("close");
                }
              }
            ]
          });
        }));

        var hl = new BABYLON.HighlightLayer("hl1", scene);

        //On Mouse Enter
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
          console.log("ok im in the boat");
          hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99, 1, 0.51));
        }));

        //ON MOUSE EXIT
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
          // mesh.material.emissiveColor = BABYLON.Color3.Black();
          console.log("Ok im outside the boat");
          hl.removeMesh(meshes[mesh]);
        }));

        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function () {
          var x = meshes[mesh].position.x;
          var z = meshes[mesh].position.z;
          var waterHeight = getWaterHeightAtCoordinates(x, z, waterMaterial);
          meshes[mesh].position.y = waterHeight - 35;
          timeofDay = dayTime;
          //check time of day
          console.log(isRaining);
          if (timeofDay == false) {
            console.log(weatherState);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            groundMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            if (currentSkyboxName != "textures/nightSkyboxClear/clearNight") {
              changeSkybox("textures/nightSkyboxClear/clearNight", skybox);
              skybox.dispose();
            }
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              if (mysystem != null) {
                new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                  systems.start();
                  mysystem = systems;
                });
              }

              isRaining = true;
            }
            //kill mystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              if (mysystem != null) {
                mysystem.dispose();
              }
            }
          }

          if (timeofDay == true) {
            // groundMaterial.diffuseColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            // groundMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.17);
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              console.log("rainnn!!!");
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                mysystem = systems;
              });
              if (currentSkyboxName != "textures/overcastAndRainy/overcast") {
                changeSkybox("textures/overcastAndRainy/overcast", skybox);
                skybox.dispose();
              }
              isRaining = true;
            }
            //kill msystem var/the rain
            if (weatherState == "clear") {
              console.log("in the clear");
              isRaining = false;
              if (mysystem != null) {
                mysystem.dispose();
              }
              if (currentSkyboxName != "textures/TropicalSunnyDay") {
                changeSkybox("textures/TropicalSunnyDay", skybox);
                skybox.dispose();
              }
            }
          }
        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);

    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function (x, z, waterMaterial) {
      var time = waterMaterial._lastTime / 100000;
      return (
        Math.abs(
          Math.sin(x / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.x *
          5.0 +
          Math.cos(z / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.y *
          5.0
        ) * 0.3
      );
    };

    //Rain Stuff
    console.log("Ok lets try to do rain")
    //   BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then((set) => {
    //     set.start();
    // });
    function changeSkybox(pathToFile, localSkybox) {
      localSkybox.dispose();
      var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
      var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
        pathToFile,
        scene
      );
      skyboxMaterial.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
      waterMaterial.addToRenderList(skybox);
      currentSkyboxName = pathToFile;
    }

    // return the created scene
    return scene;
  };

  var desertSceneCreate = function (timeofDay, currentWeather) {
    // create a basic BJS Scene object
    var timeofDay = dayTime;

    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      50,
      new BABYLON.Vector3(30, -10, 150),
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 40;
    camera.attachControl(canvas, true);
    var renderer = scene.enableDepthRenderer();

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    //fix specular to not make material so glossy
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0, 0, 0);
    currentSkyboxName = "textures/overcastAndRainy/overcast";

    //Adding the skybox to the scene
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "textures/TropicalSunnyDay",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Ground
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "textures/sandTexture.jpg",
      scene
    );
    groundMaterial.diffuseTexture.uScale = 20.0;
    groundMaterial.diffuseTexture.vScale = 20.0;


    var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
      "ground",
      "heightmap/sandDuneMap.png",
      1500,
      1500,
      250,
      -50,
      50,
      scene,
      false
    );
    //add normal map
    groundMaterial.bumpTexture = new BABYLON.Texture(
      "textures/normalSand.png",
      scene
    );
    groundMaterial.bumpTexture.uScale = 80.0;
    groundMaterial.bumpTexture.vScale = 80.0;
    ground.material = groundMaterial;
    //messing around with particle system
    var particleSystem = new BABYLON.ParticleSystem("particles", 4000, scene);
    particleSystem.textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);

    var source = BABYLON.Mesh.CreateBox("source", 3.0, scene);
    source.position = new BABYLON.Vector3(0, -20, 130);
    // Create a particle system
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture(
      "/textures/sandParticle.png",
      scene
    );

    // Where the particles come from
    particleSystem.emitter = source;
    particleSystem.minEmitBox = new BABYLON.Vector3(-200, -40, -100); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(200, 40, 100); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.9, 0.8, 0.5, 0.05);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.8, 0.75, 0.07);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 40;
    particleSystem.maxSize = 62;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 5;
    particleSystem.maxLifeTime = 10;

    // Emission rate
    particleSystem.emitRate = 300;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 20);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(10, 0, -10);
    particleSystem.direction2 = new BABYLON.Vector3(10, 0, -5);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.03;

    particleSystem.isLocal = true;

    // Start the particle system
    particleSystem.start();

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function (
      meshes
    ) {
      //postioning of meshes
      console.log(meshes);
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;

        //Boat UI Code
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
          // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $("#dialog").dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function () {
                  $(this).dialog("close");
                }
              }
            ]
          });
        }));

        var hl = new BABYLON.HighlightLayer("hl1", scene);

        //On Mouse Enter
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
          console.log("ok im in the boat");
          hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99, 1, 0.51));
        }));

        //ON MOUSE EXIT
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
          // mesh.material.emissiveColor = BABYLON.Color3.Black();
          console.log("Ok im outside the boat");
          hl.removeMesh(meshes[mesh]);

        }));
        scene.registerBeforeRender(function () {
          meshes[mesh].position.z = 150;
          meshes[mesh].position.y = -51;
          timeofDay = dayTime;
          //check time of day
          console.log(isRaining);
          if (timeofDay == false) {
            console.log(weatherState);
            if (currentSkyboxName != "textures/nightSkyboxClear/clearNight") {
              changeSkybox("textures/nightSkyboxClear/clearNight", skybox);
              skybox.dispose();
            }
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              if (mysystem != null) {
                new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                  systems.start();
                  mysystem = systems;
                });
              }

              isRaining = true;
            }
            //kill mystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              if (mysystem != null) {
                mysystem.dispose();
              }
            }
          }

          if (timeofDay == true) {
            if (weatherState == "rainy" && isRaining == false) {
              console.log("rainnn!!!");
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                mysystem = systems;
              });
              if (currentSkyboxName != "textures/overcastAndRainy/overcast") {
                changeSkybox("textures/overcastAndRainy/overcast", skybox);
                skybox.dispose();
              }
              isRaining = true;
            }
            //kill msystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              if (mysystem != null) {
                mysystem.dispose();
              }
              if (currentSkyboxName != "textures/TropicalSunnyDay") {
                changeSkybox("textures/TropicalSunnyDay", skybox);
                skybox.dispose();
              }
            }
          }
        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);

    // Configure water material
    // waterMaterial.addToRenderList(ground);
    // waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function (x, z, waterMaterial) {
      var time = waterMaterial._lastTime / 100000;
      return (
        Math.abs(
          Math.sin(x / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.x *
          5.0 +
          Math.cos(z / 0.05 + time * waterMaterial.waveSpeed) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.y *
          5.0
        ) * 0.6
      );
    };
    function changeSkybox(pathToFile, localSkybox) {
      localSkybox.dispose();
      var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
      var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
        pathToFile,
        scene
      );
      skyboxMaterial.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
      // waterMaterial.addToRenderList(skybox);
      currentSkyboxName = pathToFile;
    }

    // return the created scene
    return scene;
  };

  var museumSceneCreate = function () {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      30,
      new BABYLON.Vector3(-18, 3, -13),
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 40;
    camera.attachControl(canvas, true);
    var renderer = scene.enableDepthRenderer();

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    //fix specular to not make material so glossy
    light.intensity = 0.8;
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0, 0, 0);
    var spotLight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-18, 15, -12), new BABYLON.Vector3(0, -1, 0), Math.PI / 1.6, 8, scene);
    var spotLightTwo = new BABYLON.SpotLight("spotLightTwo", new BABYLON.Vector3(-18, 0, -12), new BABYLON.Vector3(0, 1, 0), Math.PI / 1.6, 8, scene);



    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function (
      meshes
    ) {
      //postioning of meshes
      console.log(meshes);
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        console.log("museum position");
        console.log(meshes[mesh].position);
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        console.log(meshes[mesh].position);

        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
          // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $("#dialog").dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function () {
                  $(this).dialog("close");
                }
              }
            ]
          });



        }));

        var hl = new BABYLON.HighlightLayer("hl1", scene);

        //On Mouse Enter
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
          console.log("ok im in the boat");
          hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99, 1, 0.51));
        }));

        //ON MOUSE EXIT
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
          // mesh.material.emissiveColor = BABYLON.Color3.Black();
          console.log("Ok im outside the boat");
          hl.removeMesh(meshes[mesh]);

        }));
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function () {
          var x = meshes[mesh].position.x;
          meshes[mesh].position.y = -31;
          meshes[mesh].position.z = -14;
          meshes[mesh].position.x = -50;



        });

        //lower the boat as it was floating above the water
      }
    });
    BABYLON.SceneLoader.ImportMesh(null, "museum/", "museumTest.obj", scene, function (
      meshes
    ) {
      //postioning of meshes
      console.log(meshes);
      for (mesh in meshes) {
        //mesh positioning


        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function () {
          var x = meshes[mesh].position.x;

        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);
    // return the created scene

    return scene;
  };

  var autoRotateSceneCreate = function () {
    // create a basic BJS Scene object
    // var spherePositions = [new BABYLON.Vector3(13, 6, 4), new BABYLON.Vector3(12.5, 14, 4), new BABYLON.Vector3(30, 3, 4), new BABYLON.Vector3(49, 5, 4)];
    var spherePositions = [
      { name: 'Hull', 
        text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus', 
        position: new BABYLON.Vector3(13, 6, 4)
      }, 
      { name: 'Mast', 
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus', 
      position: new BABYLON.Vector3(12.5, 14, 4)
      }, 
      { name: 'Deck', 
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus', 
      position: new BABYLON.Vector3(30, 3, 4)
      }, 
      { name: 'Back', 
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus', 
      position: new BABYLON.Vector3(49, 5, 4)
      }, 
  ]
    var spheresArray = [];
    var glowingMeshArray = [];
    var scene = new BABYLON.Scene(engine);
    var middleOfBoat = new BABYLON.Vector3(31, 5, 4);

    // sphere.position = lockedPosition;
    // Camera
    // scene.debugLayer.show();

    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 3.25,
      30,
      middleOfBoat,
      scene
    );
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 40;

    camera.attachControl(canvas, true);
    var renderer = scene.enableDepthRenderer();
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    //fix specular to not make material so glossy
    light.intensity = 0.8;
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0, 0, 0);
    var spotLight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-18, 15, -12), new BABYLON.Vector3(0, -1, 0), Math.PI / 1.6, 8, scene);
    var spotLightTwo = new BABYLON.SpotLight("spotLightTwo", new BABYLON.Vector3(-18, 0, -12), new BABYLON.Vector3(0, 1, 0), Math.PI / 1.6, 8, scene);
    var currentTarget = middleOfBoat;

    for (var i = 0; i < spherePositions.length; i++) {

      spheresArray[i] = BABYLON.MeshBuilder.CreateSphere("sphere" + i, { diameter: 2, scene });
      spheresArray[i].position = spherePositions[i].position;
      spheresArray[i].titleInfo = spherePositions[i].name;
      spheresArray[i].contentInfo = spherePositions[i].text;

      glowingMeshArray[i] = new BABYLON.HighlightLayer("hl1", scene);
      glowingMeshArray[i].addMesh(spheresArray[i], new BABYLON.Color3(0.95, 0.39, 0.13));
    }
    var mesh = new BABYLON.Mesh("custom", scene);


    var changeTargetCamera = function (sphere) {
      var infoText = document.getElementById("partText");
      var infoTitle = document.getElementById("partName");
      var infoContainer = document.getElementById("informationContainer");

      sphere.actionManager = new BABYLON.ActionManager(scene);
      sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
        currentTarget = new BABYLON.Vector3(sphere.position.x, sphere.position.y, sphere.position.z);
        // console.log(infoContainer.style.display);
        // if (infoContainer.style.display == "none") {
        //   console.log("display");
        //   infoContainer.style.display = "block";
        // }
        infoTitle.innerHTML = sphere.titleInfo;
        infoText.innerHTML = sphere.contentInfo;  
      }));
    }

    changeTargetCamera(spheresArray[0]);
    changeTargetCamera(spheresArray[1]);
    changeTargetCamera(spheresArray[2]);
    changeTargetCamera(spheresArray[3]);
    var changeToLargeView = document.getElementById("backToLargeView");
    changeToLargeView.addEventListener("click",function () {
      currentTarget = middleOfBoat;

    });

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_posAdjusted.obj", scene, function (
      meshes
    ) {
      //postioning of meshes
      console.log(meshes);
      for (mesh in meshes) {
        var dhow = meshes[mesh];
        console.log("museum position");
        console.log(meshes[mesh].position);
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        console.log(meshes[mesh].position);

        scene.registerBeforeRender(function () {
        });

        //lower the boat as it was floating above the water
      }
    });
    var glowMeshAlpha = 0;

    scene.registerBeforeRender(function () {
      var currentPos = camera.target;
      var distanceSnap = currentPos.subtract(currentTarget).length();
      console.log(spheresArray);
      if (distanceSnap > 0.2) {
        camera.target = BABYLON.Vector3.Lerp(camera.target, currentTarget, 0.1);
        camera.radius = Lerp(camera.radius, 25, 0.1);
      }
      else {
        camera.target = currentTarget;
      }
      console.log(distanceSnap);
      // if (camer)
      // camera.setTarget(currentTarget);
      console.log(camera.target);
      for (var i = 0; i < glowingMeshArray.length; i++) {
        glowMeshAlpha += 0.02;
        glowingMeshArray[i].blurHorizontalSize = Math.sin(glowMeshAlpha / 3);
        glowingMeshArray[i].blurVerticalSize = Math.sin(glowMeshAlpha / 3);
      }
    });
    // return the created scene
    return scene;
  };

  // call the createScene function
  var seasSceneDay = createScene(true, weatherState);
  var seasSceneNight = createScene(false, weatherState);

  var beachSceneDay = beachSceneCreate(dayTime, weatherState);
  var beachSceneNight = beachSceneCreate(dayTime, weatherState);

  var desertSceneDay = desertSceneCreate(dayTime, weatherState);
  var desertSceneNight = desertSceneCreate(dayTime, weatherState);


  var museumScene = museumSceneCreate();
  // var autoRotateScene = autoRotateSceneCreate();
  // run the render loop
  engine.runRenderLoop(function () {
    if (state == "seas" && dayTime == true) {
      seasSceneDay.render();
    }
    else if (state == "seas" && dayTime == false) {
      seasSceneNight.render();
    } else if (state == "beach" && dayTime == true) {
      beachSceneDay.render();
    }
    else if (state == "beach" && dayTime == false) {
      beachSceneNight.render();
    }

    else if (state == "desert" && dayTime == true) {
      desertSceneDay.render();
    }
    else if (state == "desert" && dayTime == false) {
      desertSceneNight.render();
    }

    else if (state == "museum") {
      // autoRotateScene.render();
    }
  });

  // the canvas/window resize event handler
  window.addEventListener("resize", function () {
    engine.resize();
  });

  //Useful playgrounds and resources:
  // https://playground.babylonjs.com/#6QWN8D#5
  //https://www.gamefromscratch.com/page/BabylonJS-Tutorial-Series.aspx
  // https://www.babylonjs-playground.com/#IW99H0

  // For Wateranimation
  // https://www.babylonjs-playground.com/#L76FB1#49
});

//UI Code: Added By Steven
// var scene_toggle_counter = 0;
// var scene_options_showed = 1;

// function toggle_scenepanel(){
//   console.log("toggle scene pannel");
//   console.log(scene_toggle_counter )

//   if (scene_toggle_counter == 0){
//     $('#sceneTypes').animate({ left: '+=340px'  });
//     scene_toggle_counter = 1;
//     console.log("okay move right + 350px");

//   }
//   else if(scene_toggle_counter ==1){
//     $('#sceneTypes').animate({ left: '-=340px'  });
//     scene_toggle_counter = 0;
//     scene_options_showed = 0;

//     console.log("okay move right - 350px");

//   }

// }

//hide panel at the beginning
// $("#sceneTypesContent").slideToggle();
// $("#sceneTypesContent").slideToggle();
// $("#min-max-button").click(function() {
//   console.log("clicked");
//   $("#sceneTypesContent").slideToggle();
//   // $("sceneTypesContent").css('display','flex');
//   var button = $(this).find("i");
//   if (button.hasClass("fa fa-window-minimize")) {
//     console.log("he");
//     scene_options_showed = 1;
//     button.removeClass("fas fa-window-minimize");
//     button.addClass("fa fa-window-maximize");
//   } else if (button.hasClass("fa fa-window-maximize")) {
//     button.removeClass("fas fa-window-maximize");

//     button.addClass("fa fa-window-minimize");
//   }
// });


function changeRender(sceneName, e) {
  console.log(sceneName);
  isRaining = false;
  weatherState = "clear";
  state = sceneName;
  dayTime = true;
  var environment = document.getElementsByClassName('environment');
  var weather = document.getElementsByClassName('weather');
  var defaultSunny = document.getElementById('sunnyDefault');
  var nightIcon = document.getElementById('nightDefault');
  var dayIcon = document.getElementById('dayDefault')
  for (i = 0; i < environment.length; i++) {
    environment[i].className = "column environment";
  }
  for (i = 0; i < weather.length; i++) {
    weather[i].className = "column weather";
  }
  console.log(e);
  defaultSunny.className = "column weather active";
  e.className = "column environment active";
  dayIcon.className = "far fa-sun nightDay active";
  nightIcon.className = "fas fa-moon nightDay";
  if (state = museum) {

  }
}

function changeTimeDay(timeofDay) {
  var nightIcon = document.getElementById('nightDefault');
  var dayIcon = document.getElementById('dayDefault')

  if (timeofDay == "night") {
    isRaining = false;
    weatherState = "clear";
    dayTime = false;
    dayIcon.className = "far fa-sun nightDay";
    nightIcon.className = "fas fa-moon nightDay active";
  }
  else if (timeofDay == "day") {
    isRaining = false;
    weatherState = "clear";
    dayTime = true;
    dayIcon.className = "far fa-sun nightDay active";
    nightIcon.className = "fas fa-moon nightDay";
  }
  var defaultSunny = document.getElementById('sunnyDefault');
  var weather = document.getElementsByClassName('weather');
  for (i = 0; i < weather.length; i++) {
    weather[i].className = "column weather";
  }
  defaultSunny.className = "column weather active";

}

function changeWeather(weather, e) {
  isRaining = false;
  weatherState = weather;
  var weather = document.getElementsByClassName('weather');
  for (i = 0; i < weather.length; i++) {
    weather[i].className = "column weather";
  }
  console.log(e);
  e.className = "column weather active";
}



//Weather stuff

function enableSunnyWeather(){
  console.log("Ok its sunny");

}

function enableRainyWeather(){
  console.log("Ok its rainy now");


}

function enableSnowyWeather(){
  console.log("Ok its rainy now");


}

function enableDay(){
  console.log("Rise and Shinee!!!");

}

function enableNight(){
  console.log("Ok good nigghhttt!!!")

}

//Weather UI;
// Based on Steven's UI

// var toggle_counter = 1;
// var options_showed = 0;
// function toggle_weatherpanel(){
//   console.log("toggle");
//   console.log(toggle_counter)

//   if (toggle_counter == 0){
//     $('#citysearchbar').animate({ left: '+=350px'  });
//     toggle_counter = 1;
//     console.log("lalalalala");

//   }
//   else if(toggle_counter ==1){
//     $('#citysearchbar').animate({ left: '-=350px'  });
//     toggle_counter = 0;
//     options_showed = 0;

//   }
// }


// $("#city-scrolldown").click(function() {
//   console.log("clicked weather stuff");
//   $("#weatherContent").slideToggle();
//   var button = $(this).find("i");
//   if (button.hasClass("fa fa-window-minimize")) {
//     //options have been showed, we can hide the panel
//     options_showed = 1;
//     console.log("he");
//     button.removeClass("fas fa-window-minimize");
//     button.addClass("fa fa-window-maximize");
//   } else if (button.hasClass("fa fa-window-maximize")) {
//     button.removeClass("fas fa-window-maximize");

//     button.addClass("fa fa-window-minimize");
//   }
// });

//Central Panel Stuff





function rain(scene) {
  BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then((set) => {
    set.start();
  });
}


function Lerp(start, end, amount) {
  return (start + (end - start) * amount);
}



// https://www.babylonjs-playground.com/#L76FB1#120

