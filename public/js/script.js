

// Download the models at: https://www.cgtrader.com/items/1915278/download-page
let i = 0;
var state = "seas";
var prevState = "seas";
var dayTime = true;
var weatherState = "clear";
var isRaining = false;
var prevDayTime = false;
var mysystem;
var currentSkyboxName;
// model to be diplayed in playgroun
var boat_model_name = "dhow_2.obj"


var url = "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";

var s = document.createElement("script");

s.src = url;

document.head.appendChild(s);

window.addEventListener("DOMContentLoaded", async function () {
  BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    if (document.getElementById("customLoadingScreenDiv")) {
        // Do not add a loading screen if there is already one
        document.getElementById("customLoadingScreenDiv").style.display = "initial";

        //  
        return;
    }
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "customLoadingScreenDiv";
    this._loadingDiv.innerHTML = "Bronze Age Boat Viewer Is Being Loaded";
    // document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    document.body.appendChild(this._loadingDiv);
};

BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
    document.getElementById("customLoadingScreenDiv").style.display = "none";
    console.log("scene is now loaded");
}
  // get the canvas DOM element
  var canvas = document.getElementById("renderCanvas");

  // load the 3D engine
  var engine = new BABYLON.Engine(canvas, true);
  
  
  // createScene function that creates and return the scene
  var createScene = function (timeofDay, currentWeather) {
    engine.displayLoadingUI();


    var timeofDay = dayTime;
    weatherState = "clear";

    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    engine.setStencilBuffer(true);

    scene.setRenderingAutoClearDepthStencil(0, true, true, true);
    scene.setRenderingAutoClearDepthStencil(1, false, false, false);
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
    waterMaterial.waterColor = new BABYLON.Color3(0, 0.1, 0.19);

    // Water mesh
    // Water mesh
    var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1024, 1024, 32, scene, false);
    waterMesh.material = waterMaterial;
    waterMesh.renderingGroupId = 1;

    waterMesh.onBeforeRenderObservable.add(() => {
        engine.setStencilMask(0x00);
        engine.setStencilFunction(BABYLON.Engine.NOTEQUAL);
        engine.setStencilFunctionReference(1);
    });


    //sand dunes ground 
    var dunesMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    dunesMaterial.diffuseTexture = new BABYLON.Texture(
      "textures/sandTexture.jpg",
      scene
    );
    dunesMaterial.diffuseTexture.uScale = 14.0;
    dunesMaterial.diffuseTexture.vScale = 14.0;
    var dunes = BABYLON.Mesh.CreateGroundFromHeightMap(
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
    dunesMaterial.bumpTexture = new BABYLON.Texture(
      "textures/normalSand.png",
      scene
    );
    dunesMaterial.specularPower = 128.0;
    dunesMaterial.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0, 1.0);
    dunesMaterial.bumpTexture.uScale = 80.0;
    dunesMaterial.bumpTexture.vScale = 80.0;
    dunes.material = dunesMaterial;
    dunes.position.y = -8;
    dunes.position.y = -15;

    dunes.onBeforeRenderObservable.add(() => {
      engine.setStencilMask(0x00);
      engine.setStencilFunction(BABYLON.Engine.NOTEQUAL);
      engine.setStencilFunctionReference(1);
  });

    // dunes.setEnabled(false);

    var particleSystem = new BABYLON.ParticleSystem("particles", 4000, scene);
    particleSystem.textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);

    var source = BABYLON.Mesh.CreateBox("source", 3.0, scene);
    source.position = new BABYLON.Vector3(0, -20, 0);
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
    particleSystem.color1 = new BABYLON.Color4(0.9, 0.8, 0.5, 0.02);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.8, 0.75, 0.04);
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
    particleSystem.updateSpeed = 0.02;

    particleSystem.isLocal = true;

    // Start the particle system
    // particleSystem.start();


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


    ground.position.y = -140;
    ground.material = groundMaterial;
    ground.setEnabled(false);
    //shoreline object mesh
    var shoreLineTexture = new BABYLON.StandardMaterial("groundMaterial", scene);
    shoreLineTexture.diffuseTexture = new BABYLON.Texture(
      "textures/sandTexture.jpg",
      scene
    );
    shoreLineTexture.diffuseTexture.uScale = 20.0;
    shoreLineTexture.diffuseTexture.vScale = 20.0;
    shoreLineTexture.specularPower = 128.0;
    shoreLineTexture.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0, 1.0);
    var shoreline = BABYLON.Mesh.CreateGroundFromHeightMap(
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
    shoreline.material = shoreLineTexture;
    shoreline.setEnabled(false);
    var boat = []
    BABYLON.SceneLoader.ImportMesh(null, "dhow/", boat_model_name, scene, function(meshes) {
      //postioning of meshes
      for (mesh of meshes) {

        //mesh positioning
        var dhow = mesh;
        dhow.rotation.x = (3 * Math.PI) / 2;
        waterMaterial.addToRenderList(dhow);

        //separate materials to fix boat floating issue thanks to : 
        // https://forum.babylonjs.com/t/float-on-water-material/1800/22
        console.log("Hiiiii")
        dhow.onBeforeRenderObservable.add(() => {
          console.log("Before render observable")
          engine.setStencilOperationPass(BABYLON.Engine.REPLACE);
          engine.setStencilMask(0xFF);
          engine.setStencilFunction(BABYLON.Engine.ALWAYS);
          engine.setStencilFunctionReference(1);
        });

        dhow.onAfterRenderObservable.add(() => {
            console.log("after render observable")
            engine.setStencilFunctionReference(0);
        });


        scene.registerBeforeRender(function () {
          var x = dhow.position.x;
          var z = dhow.position.z;
          var waterHeight = getWaterHeightAtCoordinates(x, z, waterMaterial);
          timeofDay = dayTime;
          //check time of day
          if (state == "seas") {
            // ground.dispose();
            ground.setEnabled(false);
            shoreline.setEnabled(false);
            dunes.setEnabled(false);
            renderBeach(ground);
            particleSystem.stop();
            // value we started wth before scaling
            dhow.position.y = waterHeight - 35;

            //value tested with boat_remeshed.obj
            // meshes[mesh].position.y = waterHeight;
          }

          if (state == "desert") {
            // ground.dispose();
            ground.setEnabled(false);
            shoreline.setEnabled(false);
            dunes.setEnabled(true);
            renderBeach(ground);
            particleSystem.start();
            dhow.position.y = -37;
          }

          else if (state == "beach") {
            // ground.material.dispose();
            // ground.dispose();
            dunes.setEnabled(false);
            ground.setEnabled(false);
            shoreline.setEnabled(true);
            renderBeach(ground);
            particleSystem.stop();
            dhow.position.y = waterHeight - 35;
          }
          if (timeofDay == false) {
            light.intensity = 0.6;
            if (currentSkyboxName != "textures/nightSkyboxClear/clearNight") {
              changeSkybox("textures/nightSkyboxClear/clearNight", skybox);
              skybox.dispose();
            }
            //assign rain ps to mysystem var
            if (weatherState == "rainy" && isRaining == false) {
              
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                systems.emitter = new BABYLON.Vector3(-1, -10000, 3);
                mysystem = systems;
              });
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
            light.intensity = 1.0;
            if (weatherState == "rainy" && isRaining == false) {
              new BABYLON.ParticleHelper.CreateAsync("rain", scene).then((systems) => {
                systems.start();
                mysystem = systems;
              });
              isRaining = true;
              light.intensity = 0.8;

              if (currentSkyboxName != "textures/overcastAndRainy/overcast") {
                changeSkybox("textures/overcastAndRainy/overcast", skybox);
                skybox.dispose();
              }
            }
            //kill msystem var/the rain
            if (weatherState == "clear") {
              isRaining = false;
              light.intensity = 1.0;
              if (mysystem != null) {
                mysystem.dispose();
              }
              if (currentSkyboxName != "textures/TropicalSunnyDay") {
                changeSkybox("textures/TropicalSunnyDay", skybox);
                skybox.dispose();
              }
            }
        }

          prevState = state;

        });
      }
    });
    


    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    var getWaterHeightAtCoordinates = function (x, z, waterMaterial) {
      var time = waterMaterial._lastTime / 100000;
      if (time > 0.01) {
        engine.hideLoadingUI();
      }

      return (
        Math.abs(
          Math.sin(x / 0.05 + time * waterMaterial.waveSpeed - 0.28) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.x *
          5.0 +
          Math.cos(z / 0.05 + time * waterMaterial.waveSpeed - 0.28) *
          waterMaterial.waveHeight *
          waterMaterial.windDirection.y *
          5.0
        ) * 0.6
      );
    }
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
    function renderBeach(localGroundMaterial) {
      // console.log(localGroundMaterial);
      if (state == "beach") {
        waterMesh.position.y = 0;
        waterMaterial.windForce = -10;
        waterMaterial.waveHeight = 0.3;
        waterMaterial.bumpHeight = 0.1;
        waterMaterial.waveLength = 0.1;
        waterMaterial.waveSpeed = 2.0;
        waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
        waterMaterial.colorBlendFactor = 0.2;
        waterMaterial.waterColor = new BABYLON.Color3(0, 0.1, 0.4);
      }
      else if (state == "seas") {
        waterMesh.position.y = 0;
        waterMaterial.windForce = -10;
        waterMaterial.waveHeight = 1;
        waterMaterial.bumpHeight = 0.2;
        waterMaterial.waveLength = 0.1;
        waterMaterial.waveSpeed = 50.0;
        waterMaterial.colorBlendFactor = 0;
        waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
        waterMaterial.colorBlendFactor = 0.3;
        waterMaterial.waterColor = new BABYLON.Color3(0, 0.1, 0.21);
      }
      else if (state == "desert") {
        waterMesh.position.y = -100;
      }
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



    BABYLON.SceneLoader.ImportMesh(null, "dhow/", boat_model_name, scene, function (
      meshes
    ) {
      //postioning of meshes
      for (mesh in meshes) {
        //mesh positioning
        var dhow = meshes[mesh];


        //scaling tested with boat_remeshed.obj
        // var scale_factor = 0.1;
        // meshes[mesh].scaling = new BABYLON.Vector3(scale_factor, scale_factor, scale_factor);


        meshes[mesh].rotation.x = (3 * Math.PI) / 2;

        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
          // alert('Boat Clicked')
          // GUI
          // console.log(i);
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
          hl.addMesh(meshes[mesh], new BABYLON.Color3(0.99, 1, 0.51));
        }));

        //ON MOUSE EXIT
        meshes[mesh].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
          // mesh.material.emissiveColor = BABYLON.Color3.Black();
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
      for (mesh in meshes) {
        //mesh positioning


        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        scene.registerBeforeRender(function () {
          var x = meshes[mesh].position.x;

        });

        //lower the boat as it was floating above the water
      }
    });
    // return the created scene

    return scene;
  };
  // call the createScene function
  var seasScene = createScene(true, weatherState);
  var museumScene = museumSceneCreate();
  // var autoRotateScene = autoRotateSceneCreate();
  // run the render loop
  engine.runRenderLoop(function () {
    if (state != "museum") {
      seasScene.render();

    }
    else if (state == "museum") {
      museumScene.render();
    }
  });

  // the canvas/window resize event handler
  window.addEventListener("resize", function () {
    engine.resize();
  });

});

function changeRender(sceneName, e) {
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
  defaultSunny.className = "column weather active";
  e.className = "column environment active";
  dayIcon.className = "far fa-sun nightDay active";
  nightIcon.className = "fas fa-moon nightDay";
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


function rain(scene) {
  BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then((set) => {
    set.start();
  });
}



function Lerp(start, end, amount) {
  return (start + (end - start) * amount);
}
// https://www.babylonjs-playground.com/#L76FB1#120

 //Useful playgrounds and resources:
  // https://playground.babylonjs.com/#6QWN8D#5
  //https://www.gamefromscratch.com/page/BabylonJS-Tutorial-Series.aspx
  // https://www.babylonjs-playground.com/#IW99H0

  // For Wateranimation
  // https://www.babylonjs-playground.com/#L76FB1#49

// OLD VERSION: https://github.com/jgarcia1599/3D_how/blob/d071b4eba217f5191141cc51d7ca69053db80b52/js/script.js