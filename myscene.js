var scene, camera, renderer, controls, clock;
var islandR = 60;
var defmat = new THREE.MeshPhongMaterial( { color: 0xffffff, 
                              specular: 0xdddddd } );
var TWO_PI = Math.PI * 2;
var islandThick = 4;

var sea;
var sp;

var perlin = new ImprovedNoise();

// water reflection

var mirrorCamera = null; 
var mirrorTexture = new THREE.WebGLRenderTarget( 512, 
                                               512, parameters);
var mirrormat = null;
var uniforms = null;

var parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false
};
var textureMatrix = new THREE.Matrix4();
var rotationMatrix = new THREE.Matrix4();

///////////////////////////////////
 
init();
addControls();
setTestHelper();
addObjs();

animate();

//////////////////////////////////////////
function update(){
    sea.update(renderer, scene, camera);
    sp.update();
    winter.update();
}

 function animate() {
    requestAnimationFrame( animate );

    
    var delta = clock.getDelta();
    update();
    controls.update(delta);
    renderer.render(scene, camera);
}; 
//////////////////////////////////////////////////

function addObjs() {
   addIsland();
   addSea();
   addSky();
   addPath();
    
   addSpringObjs();
   addSummerObjs(); 
   addFallObjs(); 
   addWinterObjs();

}
/////////////////////////////////////////////////////
function addPath(){
    var l = 1;
    var brickgeo = new THREE.PlaneGeometry(l * 5, l);
    
    var brickmap = new THREE.ImageUtils.loadTexture( 'imgs/rock.jpg' );
    brickmap.wrapS = THREE.RepeatWrapping;
    brickmap.wrapT = THREE.RepeatWrapping; 
    brickmap.repeat.set(1,.21);
    
    var brickmat = new THREE.MeshPhongMaterial( { 
        color: 0x888888, 
        specular: 0x222222,
         side:THREE.DoubleSide,
        map:brickmap
    } );
    var brick = new THREE.Mesh(brickgeo, brickmat);
    brick.position.y = islandThick+0.1;     
    brick.rotation.x = Math.PI/2;
    
    var pathr_basic = islandR * 0.55;
    var brickcnt = 100;
    for (var i = 0; i < brickcnt; i++) {
        var newbrick = brick.clone();
        var pathr = pathr_basic * (1 + 0.2 * Math.cos(i*1.0/brickcnt * TWO_PI * 5)  );
        var ang = i*1.0/brickcnt * TWO_PI + Math.PI/4;   
        newbrick.rotateOnWorldAxis(new THREE.Vector3(0,1,0), TWO_PI - ang);

        newbrick.position.x = pathr * Math.cos(ang);
        newbrick.position.z = pathr * Math.sin(ang);    
        scene.add(newbrick);

    }
    
//    scene.add(brick);
}


function addSea() { 
    sea = new THREE.Sea(0,0); 
    sea.init(camera);
    scene.add(sea.group);

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
    
    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 1, bevelThickness: islandThick };

    var islandgeo = new THREE.ExtrudeGeometry( islandShape, extrudeSettings );
    
    
    islandgeo.verticesNeedUpdate = true;

    var island = new THREE.Mesh( islandgeo, new THREE.MeshLambertMaterial( ) );
    island.rotation.x = Math.PI/2; 
    

    scene.add(island);
}

function addSky() {
    var skyGeo = new THREE.SphereGeometry( 400, 32, 15 );
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
    sp = new THREE.Spring(); 
    var springGroup = sp.group; 
    springGroup.position.set(-islandR/2,islandThick + .05,-islandR/2);
    sp.addObjs(scene);

    scene.add(springGroup);
    
    
    
    controls.target = springGroup.position.clone();
}
function addSummerObjs() {
    
    
    
}
function addFallObjs() {
    
    
    
}
function addWinterObjs(){
    winter = new THREE.Winter(-islandR/2,islandThick + .05,islandR/2);
    scene.add(winter.group);
    winter.particle.update(() => {renderer.render(scene, camera);});
    
    
}

/////////////////////////////////////////////////////
THREE.addFlower = addFlower;
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

    renderer = new THREE.WebGLRenderer({
			alpha: true
		});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    camera.position.y = 25; 
    camera.position.z = 5;
    
    // scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 ));
    scene.add(new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 ));
	clock = new THREE.Clock();

}
function addControls() {
    
//    controls = new THREE.FirstPersonControls( camera   );
//				controls.movementSpeed = 10;
//				controls.lookSpeed = 0.3;
    
     controls = new THREE.OrbitControls( camera ); 
}
function setTestHelper()
 {
     
    var grid = new THREE.GridHelper(islandR*2, islandR*2, 0xffffff, 0x555555 );
     grid.position.y = islandThick;
    scene.add( grid );
//   addFlower(0xff8ee2, new THREE.Vector3(-islandR/2,3,-islandR/2));
   addFlower(0x118400, new THREE.Vector3(islandR/2,islandThick,-islandR/2));
   addFlower(0xe8e8e8, new THREE.Vector3(-islandR/2,islandThick,islandR/2));
   addFlower(0xc14d00, new THREE.Vector3(islandR/2,islandThick,islandR/2));
    
 }


