var scene, camera, renderer, controls;
var islandR = 70;
var defmat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xdddddd } );
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
var clock = new THREE.Clock();

//是否锁定页面的相关
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
//移动相关的变量
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var spaceUp = true; //处理一直按着空格连续跳的问题


var velocity = new THREE.Vector3(); //移动速度变量
var direction = new THREE.Vector3(); //移动的方向变量
var rotation = new THREE.Vector3(); //当前的相机朝向

var speed = 300; //控制器移动速度
var upSpeed = 200; //控制跳起时的速度
// 辅助线
var up,horizontal,down,group;

// 声明射线，用于碰撞检测
var upRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, 1, 0), 0, 10);
var horizontalRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);
var downRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, -1, 0), 0, 10);
//////////////////////////////////
 
init();
addControls();
addObjs();
animate();

//////////////////////////////////////////
//////////////  basic setting   ///////////////////


function init() {

    initRender();
    initScene();
    initCamera();
    initcameraBox();
    initPointerLock();
    // postprocessing
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );
    
    
    var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.35, 0.35, 0.75 );
    //1.0, 9, 0.5, 512);
    bloomPass.renderToScreen = true;
    composer.addPass( bloomPass );

    initPhysics();
}

function initRender() {
    renderer = new THREE.WebGLRenderer({
			alpha: true
		});
    
    renderer.shadowMap.enabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    //camera.position.set(0, 0, 50);
}

function initScene() {
    scene = new THREE.Scene();
}

function initcameraBox() {
    //添加辅助线，用来标示摄像机，因为摄像机没有空间大小，所以用这个来模拟一个摄像机盒
    group = new THREE.Group();
    up = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 1, 0x00ff00);
    horizontal = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x00ffff);
    down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 1, 0xffff00);
    
    group.add(up);
    group.add(horizontal);
    group.add(down);
    
}
function initLight() {
    var heml = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 );
    scene.add(heml);
    
    var ambl = new THREE.AmbientLight( 0x404040, 0.5 ); // soft white light
    scene.add( ambl );
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

function addControls() {
    controls = new THREE.PointerLockControls( camera );
    controls.getObject().position.y = 10;
    controls.getObject().position.x = 0;
    controls.getObject().position.z = 0;
    scene.add( controls.getObject() );
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; 
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if ( canJump && spaceUp ) velocity.y += upSpeed;
                canJump = false;
                spaceUp = false;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 32: // space
                spaceUp = true;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
}
function initPointerLock() {
    //实现鼠标锁定的教程地址 http://www.html5rocks.com/en/tutorials/pointerlock/intro/
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    console.log(havePointerLock);
    if ( havePointerLock ) {
        var element = document.body;
        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                controlsEnabled = true;
                controls.enabled = true;
                blocker.style.display = 'none';
            } else {
                controls.enabled = false;
                blocker.style.display = 'block';
                instructions.style.display = '';
            }
        };
        var pointerlockerror = function ( event ) {
            instructions.style.display = '';
        };
        // 监听变动事件
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
        instructions.addEventListener( 'click', function ( event ) {
            instructions.style.display = 'none';
            //全屏
            //launchFullScreen(renderer.domElement);
            // 锁定鼠标光标
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
        }, false );
    } else {
            instructions.innerHTML = '你的浏览器不支持相关操作，请更换浏览器';
    }
}

function update(){
    if(sea)
        sea.update(renderer, scene, camera);
    if(sp)  
        sp.update();
    if (winter) 
        winter.update();
    if(fall) 
        fall.update();
    
    
    var dt = new Date(); 
    
    if(boat) 
        boat.position.y = 0.5+Math.sin(dt.getTime()*0.003 + Math.PI/2);
    
    
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

    render();
    var delta = clock.getDelta();
    update();
    //controls.update(delta);
    renderer.render(scene, camera);
    composer.render();
}; 
function render() {
    if ( controlsEnabled === true ) {
        //获取到控制器对象
        var control = controls.getObject();
        //获取刷新时间
        var delta = clock.getDelta();

        //velocity每次的速度，为了保证有过渡
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 默认下降的速度

        //获取当前按键的方向并获取朝哪个方向移动
        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveLeft ) - Number( moveRight );
        //将法向量的值归一化
        direction.normalize();

        //console.log(control.getWorldDirection())

        // 将group放在摄像机（也即控制器）的位置
        group.position.set(control.position.x,control.position.y,control.position.z);

        // 判断是否接触到了模型
        // 控制器的朝向，归一化
        rotation.copy(control.getWorldDirection().multiply(new THREE.Vector3(-1, 0, -1)));
        //console.log(rotation);
        
        //判断鼠标按下的方向
        var m = new THREE.Matrix4();
        if (direction.z > 0){
            if (direction.x > 0){
                m.makeRotationY(Math.PI/4);
            } else if (direction.x < 0){
                m.makeRotationY(-Math.PI/4);
            } else {
                m.makeRotationY(0);
            }
        } else if (direction.z < 0){
            if (direction.x > 0){
                m.makeRotationY(Math.PI/4*3);
            } else if (direction.x < 0){
                m.makeRotationY(-Math.PI/4*3);
            } else {
                m.makeRotationY(Math.PI);
            }
        } else {
            if(direction.x > 0){
                m.makeRotationY(Math.PI/2);
            } else if (direction.x < 0){
                m.makeRotationY(-Math.PI/2);
            }
        } 

        //给控制器的朝向使用变换矩阵，得到新的朝向
        rotation.applyMatrix4(m);

        // 水平层射线就是这个朝向
        // horizontal.setDirection(rotation);
        // 设置水平射线
        horizontalRaycaster.set(control.position , rotation );
        // 检测射线与多个物体的相交情况
        // 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false
        var horizontalIntersections=[];
        for (var i in scene.children) {
            if (scene.children[i] instanceof THREE.Group) {
                horizontalIntersections = horizontalRaycaster.intersectObjects(scene.children[i].children, true);
            } else if (scene.children[i] instanceof THREE.Mesh) {
                horizontalIntersections.push(horizontalRaycaster.intersectObject(scene.children[i]));
            }
        }
        //var horizontalIntersections = horizontalRaycaster.intersectObjects(scene.children, true);
        var horOnObject = horizontalIntersections.length > 0;
        console.log(horOnObject);
        // 如果返回结果不为空则发生了碰撞
        if( !horOnObject) {
            if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;
        }
        

        // 复制相机的位置
        downRaycaster.ray.origin.copy( control.position );
        // 获取相机靠下10的位置
        downRaycaster.ray.origin.y -= 10;
        // 判断是否停留在了物体上面
        var DownIntersections = [];
        for (var i in scene.children) {
            if (scene.children[i] instanceof THREE.Group) {
                DownIntersections = downRaycaster.intersectObjects(scene.children[i].children, true);
            } else if (scene.children[i] instanceof THREE.Mesh) {
                DownIntersections.push(downRaycaster.intersectObject(scene.children[i]));
            }
        }
        //var DownIntersections = downRaycaster.intersectObjects( scene.children, true);
        var onObject = DownIntersections.length > 0;

        if ( onObject === true ) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        }

        //判断是否停在了立方体上面
        //根据速度值移动控制器
        control.translateX( velocity.x * delta );
        control.translateY( velocity.y * delta );
        control.translateZ( velocity.z * delta );

        //保证控制器的y轴在10以上
        if ( control.position.y < 10 ) {
            velocity.y = 0;
            control.position.y = 10;
            canJump = true;
        }
    }
}
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
    //controls.target = springGroup.position.clone();
}
function addSummerObjs() {
    
    
    
}
function addFallObjs() {
    fall = new THREE.Fall(); 
    var fallGroup = fall.group; 
    fallGroup.position.set(islandR/2,islandThick + .05, islandR/2);

    
    fall.addObjs(scene);
    scene.add(fallGroup);
    //controls.target = fallGroup.position.clone();
    
    
}
function addWinterObjs(){
    winter = new THREE.Winter(-islandR/2,islandThick + .05,islandR/2);
    scene.add(winter.group);
    winter.particle.update(() => {renderer.render(scene, camera);});
    
    
}



function addLensflare() {
    var textureFlare0 = THREE.ImageUtils.loadTexture( "imgs/rock.jpg" );

    var flareMaterial = new THREE.SpriteMaterial( { map: textureFlare0, useScreenCoordinates: false, color: 0xf8ce9c, fog: false, blending: THREE.AdditiveBlending } );
    sun = new THREE.Sprite( flareMaterial );
    sun.scale.set( 2000, 2000, 1 );
    sun.position.set(sea.lightpos);
    scene.add(sun);
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

