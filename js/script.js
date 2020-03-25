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

        
        // Physics
        scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
        scene.enablePhysics(null, new BABYLON.OimoJSPlugin());
        scene.enablePhysics(null, new BABYLON.AmmoJSPlugin());
        scene.enablePhysics(new BABYLON.Vector3(0, -5, 0), new BABYLON.AmmoJSPlugin());
        var physicsEngine = scene.getPhysicsEngine();
        var gravity = physicsEngine.gravity;
        physicsEngine.setGravity(new BABYLON.Vector3(0, -5, 0));
        
        //Set gravity for the scene (G force like, on Y-axis)
        scene.gravity = new BABYLON.Vector3(0, -0.9, 0);



        //add color to the background
        // scene.clearColor = new BABYLON.Color3(0, 0, 255);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        // var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
        // Parameters: alpha, beta, radius, target position, scene
        var camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);

        camera.setTarget(BABYLON.Vector3.Zero());

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

        var ground = BABYLON.Mesh.CreateGround("ground", 2048, 2048, 16, scene, false);
        ground.position.y = 5;  
        ground.checkCollisions = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.0, restitution: 0.7 }, scene);

        var newMaterial = new BABYLON.StandardMaterial;
        newMaterial.name = "newMaterial";
        newMaterial.diffuseColor = new BABYLON.Color3.Green;

        // var square = BABYLON.MeshBuilder.CreateBox("box", {size:70}, scene);
        // square.material = newMaterial;
        // square.physicsImpostor = new BABYLON.PhysicsImpostor(square, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.0, restitution: 0.7 }, scene);

        // // // sphere positioning
        // console.log(square.position);
        // square.position.y-=5;
        // square.position.x+=60;
        // console.log(square.position);
        // square.position.y = -17;
        // square.position.x = -10;
        // square.position.z = 10;
        // square.checkCollisions = true;


        scene.collisionsEnabled = true;
        camera.checkCollisions = true;
        




        // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation 
        // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

        // move the sphere upward 1/2 of its height
        // sphere.position.y = 1;

        // create a built-in "ground" shape;
        // var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
        BABYLON.SceneLoader.ImportMesh(null, "dhow/","dhow_2.obj", scene, function (meshes) {

            //postioning of meshes
            for (mesh in meshes){

                //mesh positioning
                var dhow = meshes[mesh];
                console.log("Dhow position");
                meshes[mesh].position.x-=31;
                meshes[mesh].position.z-=12;
                meshes[mesh].position.y+=20;
                

                //mesh rotatioon

                //First, Randomly Initialize the rotation Vector
                meshes[mesh].rotation = new BABYLON.Vector3(null,null,null);
                console.log(meshes[mesh].rotation);
                // console.log(meshes[mesh].rotation);
                //Then, procede to perform desired rotations
                meshes[mesh].rotation.x = -Math.PI/3.3;
                meshes[mesh].rotation.z = -Math.PI/3;
                console.log(meshes[mesh].position);
                meshes[mesh].position.y = 30;
                // meshes[mesh].rotation.y = -Math.PI/6;
                meshes[mesh].checkCollisions = true;
                meshes[mesh].physicsImpostor = new BABYLON.PhysicsImpostor(meshes[mesh], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                

            }
            // var dhow = meshes[0].getChildMeshes()[0];
            // console.log(dhow);
            // var dhow_local_coords = localAxes(10);
            // dhow_local_coords.parent = dhow;



            // The default camera looks at the back of the asset.
            // Rotate the camera by 180 degrees to the front of the asset.
            // scene.activeCamera.alpha += Math.PI;
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