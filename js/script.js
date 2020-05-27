

// Download the models at: https://www.cgtrader.com/items/1915278/download-page
let i = 0;
var state = "museum";
var url =
  "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var s = document.createElement("script");
s.src = url;
document.head.appendChild(s);
window.addEventListener("DOMContentLoaded", async function() {
  // get the canvas DOM element
  var canvas = document.getElementById("renderCanvas");

  // load the 3D engine
  var engine = new BABYLON.Engine(canvas, true);

  // createScene function that creates and return the scene
  var createScene = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

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

    //Adding the skybox to the scene
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    //   "textures/TropicalSunnyDay",
    //   scene
    // );
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

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function(
      meshes
    ) {
      //postioning of meshes
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        console.log("Dhow position");
        console.log(meshes[mesh].position);
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        console.log(meshes[mesh].position);
        waterMaterial.addToRenderList(meshes[mesh]);
        // meshes[mesh].rotation.z = 120;


        // Boat's Action Manager Stuff 
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
              // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $( "#dialog" ).dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function() {
                  $( this ).dialog( "close" );
                }
              }
            ]
          });

          

          }));

          var hl = new BABYLON.HighlightLayer("hl1", scene);

          //On Mouse Enter
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
            console.log("ok im in the boat");
            hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99,1,0.51));
          }));
          
          //ON MOUSE EXIT
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            // mesh.material.emissiveColor = BABYLON.Color3.Black();
            console.log("Ok im outside the boat");
            hl.removeMesh(meshes[mesh]);

          }));
// Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function() {
          var x = meshes[mesh].position.x;
          var z = meshes[mesh].position.z;
          var waterHeight = getWaterHeightAtCoordinates(x, z, waterMaterial);
          meshes[mesh].position.y = waterHeight - 35;
        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);

    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function(x, z, waterMaterial) {
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
    rain(scene);

    // return the created scene
    return scene;
  };

  var beachSceneCreate = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      50,
      new BABYLON.Vector3(70, 5, 0),
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
    waterMaterial.waveHeight = 0.2;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 3.0;
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

    //Ground

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

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function(
      meshes
    ) {
      //postioning of meshes
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        console.log("Dhow position");
        console.log(meshes[mesh].position);
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        console.log(meshes[mesh].position);
        waterMaterial.addToRenderList(meshes[mesh]);



        //Boat UI Code
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
              // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $( "#dialog" ).dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function() {
                  $( this ).dialog( "close" );
                }
              }
            ]
          });

          

          }));

          var hl = new BABYLON.HighlightLayer("hl1", scene);

          //On Mouse Enter
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
            console.log("ok im in the boat");
            hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99,1,0.51));
          }));
          
          //ON MOUSE EXIT
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            // mesh.material.emissiveColor = BABYLON.Color3.Black();
            console.log("Ok im outside the boat");
            hl.removeMesh(meshes[mesh]);

          }));

        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function() {
          var x = meshes[mesh].position.x;
          var z = meshes[mesh].position.z;
          var waterHeight = getWaterHeightAtCoordinates(x, z, waterMaterial);
          meshes[mesh].position.y = waterHeight - 36;
          meshes[mesh].position.x = 40;
        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);

    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function(x, z, waterMaterial) {
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
        ) * 0.5
      );
    };

    // return the created scene
    return scene;
  };
  var desertSceneCreate = function() {
    // create a basic BJS Scene object
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
    source.position = new BABYLON.Vector3(0, 0, 130);
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

    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function(
      meshes
    ) {
      //postioning of meshes
      console.log(meshes);
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];
        console.log("Dhow position");
        console.log(meshes[mesh].position);
        meshes[mesh].rotation.x = (3 * Math.PI) / 2;
        console.log(meshes[mesh].position);

        //Boat UI Code
        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
              // GUI
          // console.log(i);
          console.log("Ok boat has been clicked");
          $( "#dialog" ).dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function() {
                  $( this ).dialog( "close" );
                }
              }
            ]
          });

          

          }));

          var hl = new BABYLON.HighlightLayer("hl1", scene);

          //On Mouse Enter
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
            console.log("ok im in the boat");
            hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99,1,0.51));
          }));
          
          //ON MOUSE EXIT
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            // mesh.material.emissiveColor = BABYLON.Color3.Black();
            console.log("Ok im outside the boat");
            hl.removeMesh(meshes[mesh]);

          }));

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function() {
          var x = meshes[mesh].position.x;
          meshes[mesh].position.z = 150;
          meshes[mesh].position.y = -51;
        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);
    // return the created scene
    rain(scene);
    return scene;
  };

  var museumSceneCreate = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      (3 * Math.PI) / 2,
      Math.PI / 2.5,
      30,
      new BABYLON.Vector3(-22, 2, -13),
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


 
    BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_2.obj", scene, function(
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
          $( "#dialog" ).dialog({
            height: 600,
            width: 800,
            dialogClass: "no-close success-dialog",
            buttons: [
              {
                text: "Next",
                click: function() {
                  $( this ).dialog( "close" );
                }
              }
            ]
          });

          

          }));

          var hl = new BABYLON.HighlightLayer("hl1", scene);

          //On Mouse Enter
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
            console.log("ok im in the boat");
            hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99,1,0.51));
          }));
          
          //ON MOUSE EXIT
          meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            // mesh.material.emissiveColor = BABYLON.Color3.Black();
            console.log("Ok im outside the boat");
            hl.removeMesh(meshes[mesh]);

          }));
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;

        scene.registerBeforeRender(function() {
          var x = meshes[mesh].position.x;
          meshes[mesh].position.y = -31;
          meshes[mesh].position.z = -14;
          meshes[mesh].position.x = -50;



        });

        //lower the boat as it was floating above the water
      }
    });
    BABYLON.SceneLoader.ImportMesh(null, "museum/", "museumTest.obj", scene, function(
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

        scene.registerBeforeRender(function() {
          var x = meshes[mesh].position.x;

        });

        //lower the boat as it was floating above the water
      }
    });
    console.log(i);
    // return the created scene
    return scene;
  };

  // call the createScene function
  var seasScene = createScene();
  var beachScene = beachSceneCreate();
  var desertScene = desertSceneCreate();
  var museumScene = museumSceneCreate();

  // run the render loop
  engine.runRenderLoop(function() {
    if (state == "seas") {
      seasScene.render();
    } else if (state == "beach") {
      beachScene.render();
    } else if (state == "desert") {
      desertScene.render();
    } else if (state == "museum") {
      museumScene.render();
    }
  });

  // the canvas/window resize event handler
  window.addEventListener("resize", function() {
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
var scene_toggle_counter = 0;
var scene_options_showed = 1;

function toggle_scenepanel(){
  console.log("toggle scene pannel");
  console.log(scene_toggle_counter )

  if (scene_toggle_counter == 0){
    $('#sceneTypes').animate({ left: '+=340px'  });
    scene_toggle_counter = 1;
    console.log("okay move right + 350px");

  }
  else if(scene_toggle_counter ==1){
    $('#sceneTypes').animate({ left: '-=340px'  });
    scene_toggle_counter = 0;
    scene_options_showed = 0;

    console.log("okay move right - 350px");

  }

}

//hide panel at the beginning
// $("#sceneTypesContent").slideToggle();
$("#sceneTypesContent").slideToggle();
$("#min-max-button").click(function() {
  console.log("clicked");
  $("#sceneTypesContent").slideToggle();
  // $("sceneTypesContent").css('display','flex');
  var button = $(this).find("i");
  if (button.hasClass("fa fa-window-minimize")) {
    console.log("he");
    scene_options_showed = 1;
    button.removeClass("fas fa-window-minimize");
    button.addClass("fa fa-window-maximize");
  } else if (button.hasClass("fa fa-window-maximize")) {
    button.removeClass("fas fa-window-maximize");

    button.addClass("fa fa-window-minimize");
  }
});

function changeRender(sceneName) {
  console.log(sceneName);
  state = sceneName;
}



//Weather stuff


//Weather UI;
// Based on Steven's UI

var toggle_counter = 1;
var options_showed = 0;
function toggle_weatherpanel(){
  console.log("toggle");
  console.log(toggle_counter)

  if (toggle_counter == 0){
    $('#citysearchbar').animate({ left: '+=350px'  });
    toggle_counter = 1;
    console.log("lalalalala");

  }
  else if(toggle_counter ==1){
    $('#citysearchbar').animate({ left: '-=350px'  });
    toggle_counter = 0;
    options_showed = 0;

  }
}


$("#city-scrolldown").click(function() {
  console.log("clicked weather stuff");
  $("#weatherContent").slideToggle();
  var button = $(this).find("i");
  if (button.hasClass("fa fa-window-minimize")) {
    //options have been showed, we can hide the panel
    options_showed = 1;
    console.log("he");
    button.removeClass("fas fa-window-minimize");
    button.addClass("fa fa-window-maximize");
  } else if (button.hasClass("fa fa-window-maximize")) {
    button.removeClass("fas fa-window-maximize");

    button.addClass("fa fa-window-minimize");
  }
});

//Central Panel Stuff



//Open Weather Stuff

var open_weather_key = "4e6fc4bba619975d9060a9b9da350bf1"
var open_weather_endpoint = "api.openweathermap.org/data/2.5/weather"


function rain(scene){
  BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then((set) => {
    set.start();
  });
}