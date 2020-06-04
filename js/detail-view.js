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

    var autoRotateSceneCreate = function () {
        $('#informationContainer').hide();

        // create a basic BJS Scene object
        // var spherePositions = [new BABYLON.Vector3(13, 6, 4), new BABYLON.Vector3(12.5, 14, 4), new BABYLON.Vector3(30, 3, 4), new BABYLON.Vector3(49, 5, 4)];
        var spherePositions = [
            {
                name: 'Hull',
                text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus',
                position: new BABYLON.Vector3(13, 6, 4)
            },
            {
                name: 'Mast',
                text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus',
                position: new BABYLON.Vector3(12.5, 14, 4)
            },
            {
                name: 'Deck',
                text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque libero labore est. Adipisci, doloribus modi? Facere sunt doloribus at perspiciatis asperiores odit. Eum autem consectetur quis ab nisi incidunt necessitatibus',
                position: new BABYLON.Vector3(30, 3, 4)
            },
            {
                name: 'Back',
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

        changeToLargeView.addEventListener("click", function () {
            currentTarget = middleOfBoat;
            $("#informationContainer").fadeOut();


        });

        BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_posAdjusted.obj", scene, function (
            meshes
        ) {
            //postioning of meshes
            for (mesh in meshes) {
                var dhow = meshes[mesh];
                meshes[mesh].rotation.x = (3 * Math.PI) / 2;

                scene.registerBeforeRender(function () {
                });

                //lower the boat as it was floating above the water
            }
        });
        var glowMeshAlpha = 0;

        scene.registerBeforeRender(function () {
            var currentPos = camera.target;
            var distanceSnap = currentPos.subtract(currentTarget).length();
            if (distanceSnap > 0.1) {
                camera.target = BABYLON.Vector3.Lerp(camera.target, currentTarget, 0.1);
                if (currentTarget != middleOfBoat) {
                    $("#informationContainer").fadeIn();
                    camera.radius = Lerp(camera.radius, 20, 0.1);

                }
                else {
                    camera.radius = Lerp(camera.radius, 30, 0.1);

                }
            }
            else {
                camera.target = currentTarget;
            }
            for (var i = 0; i < glowingMeshArray.length; i++) {
                glowMeshAlpha += 0.02;
                glowingMeshArray[i].blurHorizontalSize = Math.sin(glowMeshAlpha / 3);
                glowingMeshArray[i].blurVerticalSize = Math.sin(glowMeshAlpha / 3);
            }
        });
        // return the created scene
        return scene;
    };


    var autoRotateScene = autoRotateSceneCreate();
    engine.runRenderLoop(function () {
        autoRotateScene.render();
    });
    // the canvas/window resize event handler
    window.addEventListener("resize", function () {
        engine.resize();
    });
});



function Lerp(start, end, amount) {
    return (start + (end - start) * amount);
}