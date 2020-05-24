// Download the models at: https://www.cgtrader.com/items/1915278/download-page
let i = 0;
window.addEventListener("DOMContentLoaded", async function() {
  // get the canvas DOM element
  var canvas = document.getElementById("renderCanvas");
  //k
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
    waterMaterial.waveHeight = 0.5;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.waveSpeed = 50.0;
    waterMaterial.colorBlendFactor = 0;
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    waterMaterial.colorBlendFactor = 0;

    // Water mesh
    var waterMesh = BABYLON.Mesh.CreateGround(
      "waterMesh",
      512,
      512,
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
    ground.position.y = -1;
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

        meshes[mesh].actionManager = new BABYLON.ActionManager(scene);

        meshes[mesh].actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickUpTrigger,
            function() {
              // alert('Boat Clicked')
              // GUI
              // console.log(i);
              i = 1;
              console.log(i);
              var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
                "UI"
              );

              // Style
              var style = advancedTexture.createStyle();
              style.fontSize = 24;
              style.fontStyle = "bold";

              //Rectangl;e
              // var rect1 = new BABYLON.GUI.StackPanel();
              // rect1.adaptWidthToChildren = true;
              // rect1.height = "20%";
              // rect1.width = "200px";
              // rect1.thickness = 4;
              // rect1.background = "white";
              // rect1.horizontalAlignment =
              //   BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
              // rect1.verticalAlignment =
              //   BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
              // advancedTexture.addControl(rect1);

              // var text1 = new BABYLON.GUI.TextBlock();
              // text1.text = "Dhow Boat, U.A.E.";
              // text1.color = "black";
              // text1.width = "200px";
              // text1.fontSize = 18;
              // text1.fontFamily = "Helvetica Neue";
              // rect1.addControl(text1);
            }
          )
        );
        // Resources: https://www.babylonjs-playground.com/#XCPP9Y#13

        ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;
        scene.registerBeforeRender(function() {
          let time = waterMaterial._lastTime / 100000;
          let x = meshes[mesh].position.x;
          let z = meshes[mesh].position.z;
          meshes[mesh].position.y = Math.abs(
            Math.sin(x / 0.05 + time * waterMaterial.waveSpeed) *
              waterMaterial.waveHeight *
              waterMaterial.windDirection.x *
              5.0 +
              Math.cos(z / 0.05 + time * waterMaterial.waveSpeed) *
                waterMaterial.waveHeight *
                waterMaterial.windDirection.y *
                5.0
          );
          //lower the boat as it was floating above the water
          meshes[mesh].position.y -= 35;
        });
      }
    });
    console.log(i);

    // Configure water material
    waterMaterial.addToRenderList(ground);
    waterMaterial.addToRenderList(skybox);

    // return the created scene
    return scene;
  };

  // call the createScene function
  var scene = createScene();

  // run the render loop
  engine.runRenderLoop(function() {
    scene.render();
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
