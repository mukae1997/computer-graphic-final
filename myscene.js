var scene, camera, renderer, controls, clock;
var islandR = 70;
var defmat = new THREE.MeshPhongMaterial( { color: 0xffffff, 
                              specular: 0xdddddd } );
var TWO_PI = Math.PI * 2;
var islandThick = 4;

var sea, boat;
var sp;
var fall, winter;

var perlin = new ImprovedNoise();

// water reflection

var mirrorCamera = null; 
var mirrorTexture = new THREE.WebGLRenderTarget( 512, 512, parameters);
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

var physicsWorld = null, cloth = null;
// Physics variables
var gravityConstant = -9.8;
var margin = 0.05;

var composer;

///////////////////////////////////
 
init();
addControls();
//setTestHelper();
addObjs();


animate();

//////////////////////////////////////////
function update(){
    sea.update(renderer, scene, camera);
  if(sp)  sp.update();
   if (winter) winter.update();
    if(fall) fall.update();
    
    
    var dt = new Date(); 
    if(boat) boat.position.y = 0.5+Math.sin(dt.getTime()*0.003 + Math.PI/2);
    
    
    // Update cloth
    if (cloth) {
        var softBody = cloth.userData.physicsBody;
        var clothPositions = cloth.geometry.attributes.position.array;
        var numVerts = clothPositions.length / 3;
        var nodes = softBody.get_m_nodes();
        var indexFloat = 0;
        for ( var i = 0; i < numVerts; i ++ ) {
            var node = nodes.at( i );
            var nodePos = node.get_m_x();
            clothPositions[ indexFloat++ ] = nodePos.x();
            clothPositions[ indexFloat++ ] = nodePos.y();
            clothPositions[ indexFloat++ ] = nodePos.z();
        }
        cloth.geometry.computeVertexNormals();
        cloth.geometry.attributes.position.needsUpdate = true;
        cloth.geometry.attributes.normal.needsUpdate = true;
    }
    

}

 function animate() {
    requestAnimationFrame( animate );

    
    var delta = clock.getDelta();
    update();
    controls.update(delta);
//    renderer.render(scene, camera);
     composer.render();
}; 
//////////////////////////////////////////////////

function addObjs() {
   addIsland();
   addSea();
    addLensflare();
   addSky();
   addPath();
   addBoat();
   addFlag();
    
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
    
    var pathr_basic = islandR * 0.45;
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

    var brickmap = new THREE.ImageUtils.loadTexture( 'imgs/sand.jpeg' );
    brickmap.wrapS = THREE.RepeatWrapping;
    brickmap.wrapT = THREE.RepeatWrapping; 
    brickmap.repeat.set(.1,.21);
    
    var island = new THREE.Mesh( islandgeo, new THREE.MeshLambertMaterial(
        {
            color:0xccb69d,
            emissive:0x222222,
            map:brickmap,
            opacity:0.5
            
        }
    ) );
    island.rotation.x = Math.PI/2; 
    island.receiveShadow = true;
//    
//    var plgeo = new THREE.PlaneGeometry(40,40,40,40);
//    var plmat = new THREE.MeshLambertMaterial({
//        color:0x997799
//        
//    })
//    var pl = new THREE.Mesh(plgeo, plmat);
//    var vts = plgeo.vertices;
//    for (var i = 0; i < plgeo.vertices.length; i++) {
//        vts[i].z = THREE.Math.randFloatSpread(Math.random());
//    }
//    plgeo.verticesNeedUpdate = true;
//    scene.add(pl);
//    
//    pl.rotation.x = -Math.PI / 2;
//    pl.position.y = islandThick;
//    
    

    scene.add(island);
}

function addBoat() { 
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/boat/OldBoat_obj/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'OldBoat.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'OldBoat.obj', function ( object ) {
            console.log(object)
            object.position.set(-59,0,-55);
            object.scale.setScalar(1); 
            boat = object;
//            boat.scale.y = 9;
            scene.add(object);
 
        }, ()=>{}  , ()=>{}  );

    });

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
    springGroup.position.set(-islandR/2*0.75,islandThick + .05,-islandR/2*0.75);
    sp.addObjs(scene);

    scene.add(springGroup);
    
    springGroup.castShadow = true;
    
//    controls.target = new THREE.Vector3(0,0,0);
    controls.target = springGroup.position.clone();
}
function addSummerObjs() {
    
    
    
}
function addFallObjs() {
    fall = new THREE.Fall(); 
    var fallGroup = fall.group; 
    fallGroup.position.set(islandR/2,islandThick + .05, islandR/2);

    
    fall.addObjs(scene);
    scene.add(fallGroup);
//    controls.target = fallGroup.position.clone();
    
    
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






function addLensflare() {
    var textureFlare0 = THREE.ImageUtils.loadTexture( "imgs/rock.jpg" );

    var flareMaterial = new THREE.SpriteMaterial( { map: textureFlare0, useScreenCoordinates: false, color: 0xf8ce9c, fog: false, blending: THREE.AdditiveBlending } );
    sun = new THREE.Sprite( flareMaterial );
    sun.scale.set( 2000, 2000, 1 );
    sun.position.set(sea.lightpos);
    scene.add(sun);
}







//////////////  basic setting   ///////////////////


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer({
			alpha: true
		});
    
    renderer.shadowMap.enabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    camera.position.y = 25; 
    camera.position.z = 5;
    
    var heml = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 );
    scene.add(heml);
    
//    // scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 ));
//    scene.add(new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 ));
	clock = new THREE.Clock();
    
    var ambl = new THREE.AmbientLight( 0x404040, 0.5 ); // soft white light
    scene.add( ambl );
    
    // postprocessing
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );
    
    
//    var effect = new THREE.ShaderPass( THREE.DotScreenShader );
//    effect.uniforms[ 'scale' ].value = 4;
//    
//				effect.renderToScreen = true;
    var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.35, 0.35, 0.75 );
    //1.0, 9, 0.5, 512);
    bloomPass.renderToScreen = true;
    composer.addPass( bloomPass );

    initPhysics();
}
function addControls() {
    if (false) {
         controls = new THREE.FirstPersonControls( camera   );
				controls.movementSpeed = 10;
				controls.lookSpeed = 0.3;
    } else {
     controls = new THREE.OrbitControls( camera ); 
        
    }
    
   
    
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
function initPhysics() {
				// Physics configuration
				var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
				var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
				var broadphase = new Ammo.btDbvtBroadphase();
				var solver = new Ammo.btSequentialImpulseConstraintSolver();
				var softBodySolver = new Ammo.btDefaultSoftBodySolver();
				physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
				physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
				physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
}

function addFlag() {
    var cloth;

    // The cloth
    // Cloth graphic object
    var clothWidth = 4;
    var clothHeight = 3;
    var clothNumSegmentsZ = clothWidth * 5;
    var clothNumSegmentsY = clothHeight * 5;
    var clothSegmentLengthZ = clothWidth / clothNumSegmentsZ;
    var clothSegmentLengthY = clothHeight / clothNumSegmentsY;
    var clothPos = new THREE.Vector3( -3, 13, 2 );
    //var clothGeometry = new THREE.BufferGeometry();
    var clothGeometry = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    clothGeometry.rotateY( Math.PI * 0.5 );
    clothGeometry.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5 );
    //var clothMaterial = new THREE.MeshLambertMaterial( { color: 0x0030A0, side: THREE.DoubleSide } );
    var clothMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } );
    cloth = new THREE.Mesh( clothGeometry, clothMaterial );
    cloth.castShadow = true;
    cloth.receiveShadow = true;
    scene.add( cloth );
    new THREE.TextureLoader().load( "imgs/brick.jpg", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
        cloth.material.map = texture;
        cloth.material.needsUpdate = true;
    } );
    
    // Cloth physic object
    var softBodyHelpers = new Ammo.btSoftBodyHelpers();
    var clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
    var clothCorner01 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth );
    var clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
    var clothCorner11 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z - clothWidth );
    var clothSoftBody = softBodyHelpers.CreatePatch( physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
    var sbConfig = clothSoftBody.get_m_cfg();
    sbConfig.set_viterations( 10 );
    sbConfig.set_piterations( 10 );
    clothSoftBody.setTotalMass( 0.9, false );
    Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
    physicsWorld.addSoftBody( clothSoftBody, 1, -1 );
    cloth.userData.physicsBody = clothSoftBody;
    // Disable deactivation
    clothSoftBody.setActivationState( 4 );

}

