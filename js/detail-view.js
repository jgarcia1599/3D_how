// Download the models at: https://www.cgtrader.com/items/1915278/download-page
let i = 0;
var state = "seas";
var dayTime = true;
var weatherState = "clear";
var isRaining = false;
var prevDayTime = false;
var mysystem;
var currentSkyboxName;
var currentIndex;
var url =
    "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var s = document.createElement("script");
s.src = url;
document.head.appendChild(s);
window.addEventListener("DOMContentLoaded", async function () {
    //initialize loading screen by creating a div and styling it; taken from https://www.babylonjs-playground.com/#5Y2GIC#39
    BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
        if (document.getElementById("customLoadingScreenDiv")) {
            // Do not add a loading screen if there is already one
            document.getElementById("customLoadingScreenDiv").style.display = "initial";
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

    var autoRotateSceneCreate = function () {
        engine.displayLoadingUI();

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
        var middleOfBoat = new BABYLON.Vector3(31, 9, 4);
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

        var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
          "textures/solidBlack/black",
          scene
        );
        skyboxMaterial.reflectionTexture.coordinatesMode =
          BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        var markerMaterial = new BABYLON.StandardMaterial("markerMaterial", scene);
        // markerMaterial.diffuseTexture = new BABYLON.Texture("../icons/plusSideOrange.png", scene);
        // markerMaterial.diffuseColor =  new BABYLON.Color3(0.95, 0.39, 0.13);
        markerMaterial.diffuseColor =  new BABYLON.Color3(1, 1, 1);

        markerMaterial.pointsCloud = true;

        for (var i = 0; i < spherePositions.length; i++) {
            spheresArray[i] = BABYLON.MeshBuilder.CreateSphere("sphere" + i, { diameter: 0.4, scene });
            spheresArray[i].material = markerMaterial;
            spheresArray[i].position = spherePositions[i].position;
            spheresArray[i].titleInfo = spherePositions[i].name;
            spheresArray[i].contentInfo = spherePositions[i].text;
            spheresArray[i].indexForGallery = i;
            glowingMeshArray[i] = new BABYLON.HighlightLayer("hl1", scene);
            glowingMeshArray[i].addMesh(spheresArray[i], new BABYLON.Color3(0.95, 0.39, 0.13));
        }
        var mesh = new BABYLON.Mesh("custom", scene);


        var changeTargetCamera = function (sphere, index, isSphereClick) {
            var infoText = document.getElementById("partText");
            var infoTitle = document.getElementById("partName");
            var infoContainer = document.getElementById("informationContainer");
            var prevDisplay = document.getElementById("prevDisplay");
            var nextDisplay = document.getElementById("nextDisplay");
            var prevDisplayContainer = document.getElementById("lessThan");
            var nextDisplayContainer = document.getElementById("greaterThan");

            if (isSphereClick) {
                sphere.actionManager = new BABYLON.ActionManager(scene);
                sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
                    currentTarget = new BABYLON.Vector3(sphere.position.x, sphere.position.y, sphere.position.z);
                    currentIndex = sphere.indexForGallery;
                    infoTitle.innerHTML = sphere.titleInfo;
                    markerMaterial.alpha = 0;
                    infoText.innerHTML = sphere.contentInfo;
                    if (spheresArray[index  + 1] != null) {
                        prevDisplayContainer.style.display = "flex";
                        prevDisplay.innerHTML = spheresArray[index + 1].titleInfo;
                    }    
                    else {
                        prevDisplayContainer.style.display = "none";
                    }
                    if (spheresArray[index - 1] != null) {
                        nextDisplayContainer.style.display = "flex";
                        nextDisplay.innerHTML = spheresArray[index - 1].titleInfo;
                    }
                    else {
                        nextDisplayContainer.style.display = "none";
                    }
                }));
            } else {
                currentTarget = new BABYLON.Vector3(spheresArray[index].position.x, spheresArray[index].position.y, spheresArray[index].position.z);
                currentIndex = index;
                infoTitle.innerHTML = spheresArray[index].titleInfo;
                infoText.innerHTML = spheresArray[index].contentInfo;
                if (spheresArray[index  + 1] != null) {
                    prevDisplayContainer.style.display = "flex";
                    prevDisplay.innerHTML = spheresArray[index + 1].titleInfo;
                }    
                else {
                    prevDisplayContainer.style.display = "none"; 
                }
                if (spheresArray[index - 1] != null) {
                    nextDisplayContainer.style.display = "flex";
                    nextDisplay.innerHTML = spheresArray[index - 1].titleInfo;
                }
                else {
                    nextDisplayContainer.style.display = "none";
                }
            }
        }

        changeTargetCamera(spheresArray[0], 0, true);
        changeTargetCamera(spheresArray[1], 1, true);
        changeTargetCamera(spheresArray[2], 2, true);
        changeTargetCamera(spheresArray[3], 3, true);
        var changeToLargeView = document.getElementById("backToLargeView");
        var prevDisplay = document.getElementById("prevDisplay");
        var nextDisplay = document.getElementById("nextDisplay");

        changeToLargeView.addEventListener("click", function () {
            currentTarget = middleOfBoat;
            $("#informationContainer").fadeOut();
        });

        prevDisplay.addEventListener("click", function () {
            changeTargetCamera(spheresArray[currentIndex + 1], currentIndex + 1, false)
        });

        nextDisplay.addEventListener("click", function () {
            changeTargetCamera(spheresArray[currentIndex - 1], currentIndex - 1, false)

        });

        BABYLON.SceneLoader.ImportMesh(null, "dhow/", "dhow_posAdjusted.obj", scene, function (
            meshes
        ) {
            //remove loading screen when mesh if rendered in the scene
            engine.hideLoadingUI();
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
            console.log(currentIndex);
            var currentPos = camera.target;
            var distanceSnap = currentPos.subtract(currentTarget).length();
            if (distanceSnap > 0.1) {
                camera.target = BABYLON.Vector3.Lerp(camera.target, currentTarget, 0.1);
                if (currentTarget != middleOfBoat) {
                    $("#informationContainer").fadeIn();
                    camera.radius = Lerp(camera.radius, 15, 0.1);

                }
                else {
                    markerMaterial.alpha = 1;
                    camera.radius = Lerp(camera.radius, 30, 0.1);
                }
            }
            else {
                camera.target = currentTarget;
            }
            for (var i = 0; i < glowingMeshArray.length; i++) {
                glowMeshAlpha += 0.04;
                spheresArray[i].scaling = new BABYLON.Vector3(2.5 + Math.sin(glowMeshAlpha / 5), 2.5 + Math.sin(glowMeshAlpha / 5), 2.5 +Math.sin(glowMeshAlpha / 5));

                glowingMeshArray[i].blurHorizontalSize = Math.sin(glowMeshAlpha /5) * 2;
                glowingMeshArray[i].blurVerticalSize = Math.sin(glowMeshAlpha /5) * 2;
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

var scene_toggle_counter = 0;
var scene_options_showed = 1;

function toggle_scenepanel(){
  console.log("toggle scene pannel");
  console.log(scene_toggle_counter )

  if (scene_toggle_counter == 0){
    if ($('#leafletMapContainer').style.bottom > 0) {
        $('#leafletMapContainer').style.bottom = "-100px";
    }
    else {
        $('#leafletMapContainer').animate({ bottom: '+=' + (window.screen.height - 100) });
        $('#switchToMap').animate({ bottom: '+=' + (window.screen.height - 150)});
    }
    scene_toggle_counter = 1;
    console.log("okay move right + 350px");

  }
  else if(scene_toggle_counter ==1){
    $('#leafletMapContainer').animate({ bottom: '-=' +  window.screen.height  });
    $('#switchToMap').animate({ bottom: '-=' + window.screen.height });

    scene_toggle_counter = 0;
    scene_options_showed = 0;

    console.log("okay move right - 350px");

  }

}