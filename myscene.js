var scene, camera, renderer, controls, clock;
var islandR = 80;
 
init();
addControls();
setTestHelper();
addObjs();
animate();

//////////////////////////////////////////

 function animate() {
    requestAnimationFrame( animate );

    
    var delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
}; 
//////////////////////////////////////////////////

function addObjs() {
   addIsland();
   addSea();
   addSky();
    
    
   addSpringObjs();
   addSummerObjs(); 
   addFallObjs(); 
   addWinterObjs();

}
/////////////////////////////////////////////////////

function addSea() {
    
    var seaGeo = new THREE.PlaneBufferGeometry( 1700, 1700 );
    var seaMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
    seaMat.color.setHSL( +201/360, 0.72, 0.45 );

    var sea = new THREE.Mesh( seaGeo, seaMat );
    sea.rotation.x = -Math.PI/2;
    scene.add(sea);

}
function addIsland() {
    var islandShape = new THREE.Shape();
//    islandShape.moveTo(-r, 0s);s
    var cnt = 200;
    for (var i = 0 ; i < cnt; i++) {    
        var r = islandR + THREE.Math.randFloatSpread(25);

        islandShape.lineTo(r * Math.cos(i*Math.PI*2/cnt),
                          r * Math.sin(i*Math.PI*2/cnt));
        
    }
    islandShape.lineTo(r, 0);
    
    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 1, bevelThickness: 1 };

    var islandgeo = new THREE.ExtrudeGeometry( islandShape, extrudeSettings );

    var island = new THREE.Mesh( islandgeo, new THREE.MeshLambertMaterial( ) );
    island.rotation.x = Math.PI/2;
    island.rotation.x = Math.PI/2;

    scene.add(island);
}

function addSky() {
    var skyGeo = new THREE.SphereGeometry( 500, 32, 15 );
    var skyMat = new THREE.MeshLambertMaterial( { 
        color:0xaae1ff, 
        side: THREE.BackSide,
        emissive:0x3c80a8
    } );

    var sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );
}

/////////////////   season setting   ///////////////////

function addSpringObjs(){
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/5n2xpdhz35vk-flower/';
    mtlLoader.setPath( treept );
    mtlLoader.load( 'plants1.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'plants1.obj', function ( object ) {

            object.position.y = 2;
            object.position.x = -10;
            object.position.z = -10;
            object.scale.setScalar(0.03);
            scene.add( object );
            var obj2 =  object.clone();
            obj2.scale.setScalar(0.03)
            obj2.position.x = -13;
            obj2.rotation.y = Math.PI;
            scene.add( obj2 );

        }, ()=>{}  , ()=>{}  );

    });
    
}
function addSummerObjs() {
    
    
    
}
function addFallObjs() {
    
    
    
}
function addWinterObjs(){
    
    
    
}

/////////////////////////////////////////////////////

function addFlower(c, p) { 
    
    var flrshape = new THREE.Shape();
    var r = 6;
    var cnt = 150;
    for (var i = 0 ; i < cnt; i++) {
        var ang = i * Math.PI * 2 / cnt;
        flrshape.lineTo(r * Math.cos(ang * 8) * Math.cos(ang), 
                       r * Math.cos(ang * 8) * Math.sin(ang));
    }
        var ang = Math.PI * 2;
        flrshape.lineTo(r * Math.cos(ang * 8) * Math.cos(ang), 
                       r * Math.cos(ang * 8) * Math.sin(ang));
//    flrshape.lineTo(r, 0);w
    
    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    var flrgeo = new THREE.ExtrudeGeometry( flrshape, extrudeSettings );

    var flr = new THREE.Mesh( flrgeo, new THREE.MeshLambertMaterial( 
    {
        color: c,
        
    }
    ) );
    flr.rotation.x = Math.PI/2; 
    flr.position.set(p.x, p.y, p.z);
    scene.add(flr);

}














//////////////  basic setting   ///////////////////


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    camera.position.y = 15; 
    camera.position.z = 25;
    
    scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 ));
    var pl =  new THREE.PointLight(0xf8ffc9, 1, 500);
    pl.position.set(0,200, 0);
    scene.add(pl);
    
	clock = new THREE.Clock();

}
function addControls() {
    
    controls = new THREE.FirstPersonControls( camera   );
				controls.movementSpeed = 10;
				controls.lookSpeed = 0.3;
}
function setTestHelper()
 {
     
    var grid = new THREE.GridHelper(islandR*2, islandR*2, 0xffffff, 0x555555 );
     grid.position.y = 1;
    scene.add( grid );
   addFlower(0xff8ee2, new THREE.Vector3(-islandR/2,3,-islandR/2));
   addFlower(0x118400, new THREE.Vector3(islandR/2,3,-islandR/2));
   addFlower(0xe8e8e8, new THREE.Vector3(-islandR/2,3,islandR/2));
   addFlower(0xc14d00, new THREE.Vector3(islandR/2,3,islandR/2));
    
 }
