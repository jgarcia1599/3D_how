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

        //add color to the background
        // scene.clearColor = new BABYLON.Color3(0, 0, 255);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        // var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
        // Parameters: alpha, beta, radius, target position, scene
        var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);

        // Positions the camera overwriting alpha, beta, radius
        // camera.setPosition(new BABYLON.Vector3(0, 10, 20));

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        //Adding the skybox to the scene
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 2048, 2048, 16, scene, false);
        var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
        water.backFaceCulling = true;
        water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
        water.windForce = -10;
        water.waveHeight = 1.7;
        water.bumpHeight = 0.1;
        water.windDirection = new BABYLON.Vector2(1, 1);
        water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
        water.colorBlendFactor = 0.0;
        water.addToRenderList(skybox);
        waterMesh.material = water;

        // var newMaterial = new BABYLON.StandardMaterial;
        // newMaterial.name = "newMaterial";
        // newMaterial.diffuseColor = new BABYLON.Color3.Green;

        // var square = BABYLON.MeshBuilder.CreateBox("box", {size:40}, scene);
        // square.material = newMaterial;

        // // sphere positioning
        // console.log(square.position);
        // square.position.y-=5;
        // // square.position.x+=60;
        // console.log(square.position);


        // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation 
        // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

        // move the sphere upward 1/2 of its height
        // sphere.position.y = 1;

        // create a built-in "ground" shape;
        // var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
        BABYLON.SceneLoader.ImportMesh(null, "dhow/","ModelOBJ.obj", scene, function (meshes) {

            //postioning of meshes
            for (mesh in meshes){
                //mesh positioning
                var dhow = meshes[mesh];
                console.log(meshes[mesh].position);
                meshes[mesh].position.x-=31;
                meshes[mesh].position.z-=12;
                meshes[mesh].position.y+=20;
                console.log(meshes[mesh].rotation);

                //mesh rotatioon
                // var dhow_local_coords = localAxes(10);
                // dhow_local_coords.parent = meshes[mesh];

                //First, Randomly Initialize the rotation Vector
                meshes[mesh].rotation = new BABYLON.Vector3(null,null,null);
                console.log(meshes[mesh].rotation);
                // console.log(meshes[mesh].rotation);
                //Then, procede to perform desired rotations
                meshes[mesh].rotation.x = -Math.PI/3;
                console.log(meshes[mesh].rotation);
                // meshes[mesh].rotation.y = -Math.PI/6;

            }
            // var dhow = meshes[0].getChildMeshes()[0];
            // console.log(dhow);
            // var dhow_local_coords = localAxes(10);
            // dhow_local_coords.parent = dhow;



            // The default camera looks at the back of the asset.
            // Rotate the camera by 180 degrees to the front of the asset.
            scene.activeCamera.alpha += Math.PI;
        });
        // dhow = await BABYLON.SceneLoader.ImportMeshAsync(null, "dhow/","ModelOBJ.obj", scene); 

        

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