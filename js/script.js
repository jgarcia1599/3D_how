// Download the models at: https://www.cgtrader.com/items/1915278/download-page
window.addEventListener('DOMContentLoaded', async function(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function(){
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2.5, 50, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        //Adding the skybox to the scene
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;


        //Water mesh and water material added to the scene
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 2048, 2048, 16, scene, false);
        var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
        water.windForce = -10;
        water.waveHeight = 0.5;
        water.bumpHeight = 0.1;
        water.waveLength = 0.1;
        water.waveSpeed = 50.0;
        water.colorBlendFactor = 0;
        water.windDirection = new BABYLON.Vector2(1, 1);
        water.colorBlendFactor = 0;
        waterMesh.material = water;   



        //Ground
        var groundTexture = new BABYLON.Texture("dhow/sand.jpg", scene);
        groundTexture.vScale = groundTexture.uScale = 4.0;
    
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = groundTexture;

        var ground = BABYLON.Mesh.CreateGround("ground", 2048, 2048, 16, scene, false);
        ground.position.y = -1;
        ground.material = groundMaterial;

        BABYLON.SceneLoader.ImportMesh(null, "dhow/","dhow_2.obj", scene, function (meshes) {

            //postioning of meshes
            for (mesh in meshes){

                //mesh positioning
                var dhow = meshes[mesh];
                console.log("Dhow position");
                meshes[mesh].position.y=20;
                

                //mesh rotatioon
                meshes[mesh].rotation = new BABYLON.Vector3(null,null,null);
                console.log(meshes[mesh].rotation);
                meshes[mesh].rotation.x = -Math.PI/3.3;
                meshes[mesh].rotation.z = -Math.PI/3;
                water.addToRenderList(meshes[mesh]);

                scene.registerBeforeRender(function() {
                    let time = water._lastTime / 100000;
                    let x = meshes[mesh].position.x;
                    let z = meshes[mesh].position.z;
                    meshes[mesh].position.y = Math.abs((Math.sin(((x / 0.05) + time * water.waveSpeed)) * water.waveHeight * water.windDirection.x * 5.0) + (Math.cos(((z / 0.05) +  time * water.waveSpeed)) * water.waveHeight * water.windDirection.y * 5.0));
                });

            }



            

        });



        // Configure water material

        water.addToRenderList(skybox);
        water.addToRenderList(ground)

         ////////// RAY CAST TO FIND WATER HEIGHT ////////////
        //var angle = 0;
        let i = 0;



        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();


    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });

    //Useful playgrounds and resources: 
    // https://playground.babylonjs.com/#6QWN8D#5
    //https://www.gamefromscratch.com/page/BabylonJS-Tutorial-Series.aspx
    // https://www.babylonjs-playground.com/#IW99H0



});