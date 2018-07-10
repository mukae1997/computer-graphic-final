var scene, camera, renderer, controls, stats;
var islandR = 70;
var defmat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xdddddd } );
var TWO_PI = Math.PI * 2;
var islandThick = 4;

var sea, boat;
var sp;
var fall, winter;
var summer;
var islands = [];

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


// Physics variables
var physicsWorld = null, cloth = null, hinge = null;
var rigidBodies = [];
var gravityConstant = -9.8;
var margin = 0.05;
var cloth;
var armMovement = 0;
var transformAux1 = new Ammo.btTransform();

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

var speed = 100; //控制器移动速度
var upSpeed = 80; //控制跳起时的速度
// 辅助线
var up,horizontal,down,group;

// 声明射线，用于碰撞检测
var upRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, 1, 0), 0, 10);
var horizontalRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);
var downRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, -1, 0), 0, 10);








// lighting
var ptnlight = null;
var state = 0.0;
var sun = null;
var skyOpac = undefined;
var skyMat = null;
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
    renderer.setClearColor(0x000000);
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



function addControls() {
    controls = new THREE.PointerLockControls( camera );
    controls.getObject().position.y = 10;
    controls.getObject().position.x = -30;
    controls.getObject().position.z = 5;
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
//    console.log(havePointerLock);
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
    var dt = new Date(); 
    const loop = 2 * Math.PI;
    var tick = dt.getTime()*0.0003 % loop;
    
    state = tick / loop;
    
    sea.update(renderer, scene, camera, state*2, ptnlight.position);
    
    
    ptnlight.position.y = 120 * Math.sin(tick);
    ptnlight.position.x = 120 * Math.cos(tick);
    ptnlight.color = new THREE.Color(0x001e6d).lerp(new THREE.Color(0xe85100), state);
    
    skyMat.color = new THREE.Color(0xAAEEFF).lerp(new THREE.Color(0xFFAD33), Math.sin(state*Math.PI));
    
    ptnlight.intensity = 0.6 + 4.0 * (state<0.5?state:(-0.2/4.0)); 
    sun.position.x = 320 * Math.cos(tick);
    sun.position.y = 220 * Math.sin(tick);
    sun.lookAt(0,0,0);
    skyOpac = (state < 0.5)?Math.sin(state * Math.PI): 0.01;
    
    
    if (sp) sp.update();
    if (winter) winter.update();
    if (fall) fall.update();
    if (summer) summer.update();
    
    
    if(boat) boat.position.y = 0.5+Math.sin(dt.getTime()*0.003 + Math.PI/2);
    

    var deltaTime = clock.getDelta();

    updatePhysics( deltaTime );
    
    

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
        
        if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;
        
        control.translateX( velocity.x * delta );
        control.translateY( velocity.y * delta );
        control.translateZ( velocity.z * delta );
        
        //保证控制器的y轴在10以上
        if ( control.position.y < 10 ) {
            velocity.y = 0;
            control.position.y = 10;
            canJump = true;
        }

        //console.log(control.getWorldDirection())

        /*// 将group放在摄像机（也即控制器）的位置
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
        
//
//        // 复制相机的位置
//        downRaycaster.ray.origin.copy( control.position );
//        // 获取相机靠下10的位置
//        downRaycaster.ray.origin.y -= 10;
//        // 判断是否停留在了物体上面
//        var DownIntersections = [];
//        for (var i in scene.children) {
//            if (scene.children[i] instanceof THREE.Group) {
//                DownIntersections = downRaycaster.intersectObjects(scene.children[i].children, true);
//            } else if (scene.children[i] instanceof THREE.Mesh) {
//                DownIntersections.push(downRaycaster.intersectObject(scene.children[i]));
//            }
//        }
//        //var DownIntersections = downRaycaster.intersectObjects( scene.children, true);
//        var onObject = DownIntersections.length > 0;
//
//        if ( onObject === true ) {
//            velocity.y = Math.max( 0, velocity.y );
//            canJump = true;
//        }

        //判断是否停在了立方体上面
        //根据速度值移动控制器
        control.translateX( velocity.x * delta );
        control.translateY( velocity.y * delta );
        control.translateZ( velocity.z * delta );
        */

        
    }
}
//////////////////////////////////////////////////

function addObjs() {
    addStats();
    
    addIsland();
    addSea();
    addSky();
    addPath();
    addBoat();

    
    addSpringObjs();
    addSummerObjs(); 
    addFallObjs(); 
    addWinterObjs();
    
    addFlag();
    
    addLighting();
    addLensflare();
    

}
/////////////////////////////////////////////////////


function addLensflare() {
    var textureFlare0 = new THREE.TextureLoader().load( "imgs/sun.png" );

    var flareMaterial = new THREE.MeshBasicMaterial( { 
        map: textureFlare0, 
//        useScreenCoordinates: false, 
        transparent: true,
        opacity:0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide
        
    } );
    
    console.log("> LENS_FLRE: ", flareMaterial !== null);
    var flare = new THREE.PlaneGeometry(500,500,10,10);
    sun = new THREE.Mesh(flare, flareMaterial );
    sun.position.y  = 15;
    sun.renderOrder = 20;
    scene.add(sun);
    

//    var spriteMaterial = new THREE.SpriteMaterial( { 
//        map: textureFlare0, 
//        transparent: true,
//        opacity:0.5,
//        blending: THREE.AdditiveBlending,
//        
//        color: 0xffffff } );
//
//    sun = new THREE.Sprite( spriteMaterial );
//    sun.scale.set(600, 600, 1)
//    scene.add( sun );
}

function addLighting() {
    
    
    var heml = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.61 );
//    scene.add(heml);
    
//    
    
//    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
//    directionalLight.castShadow = true;
//    directionalLight.position.set(200,50,0);
//    
//    var tg = new THREE.Object3D();
//    tg.position.y = 135;
//    scene.add(tg);
//    scene.add(directionalLight.target);
//    
//    directionalLight.target = tg;
//    scene.add( directionalLight );
//    
//    var helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
//
//    scene.add( helper );
    
    
    ptnlight = new THREE.PointLight( 0x0048ff, 2.3, 0 );
    ptnlight.position.set( 0, 50, 0 );
    ptnlight.castShadow = true;
    scene.add( ptnlight );
    
    var hl2 = new THREE.PointLightHelper(ptnlight);
    scene.add(hl2);
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
    
    
    var snowmap = new THREE.ImageUtils.loadTexture( 'imgs/ground.jpg' );
    snowmap.wrapS = THREE.RepeatWrapping;
    snowmap.wrapT = THREE.RepeatWrapping; 
    snowmap.repeat.set(.1,.21);
    
    var boxposes = [new THREE.Vector3(-islandR/2*1.5,-islandR/2*1.5,),
                    new THREE.Vector3(islandR/2*1.5,-islandR/2*1.5,),
                    new THREE.Vector3(islandR/2*1.5,islandR/2*1.5,),
                    new THREE.Vector3(-islandR/2*1.5,islandR/2*1.5,)];
    
    var mats = [
        // spring material
            new THREE.MeshLambertMaterial(
            {
                color:0xffffff,
//                emissive:0xaaff22,
                map:brickmap,
                opacity:0.5

            }),
        // summer material
            new THREE.MeshLambertMaterial(
            {
                color:0xccb69d,
                map:brickmap,
                opacity:0.5

            }),
        // fall material
                new THREE.MeshLambertMaterial(
            {
                color:0xccb69d,
                //emissive:0xccb69d,
                map:brickmap,
                opacity:0.5

            }),
        // winter material
                    new THREE.MeshBasicMaterial(
            {
                color:0xf4f8ff,
//                emissive:0xffffff,
                map:snowmap,
                opacity:0.5
            }) 

        ];
    
    for (var i = 0; i < 4; i++) {
        var iln = new ThreeBSP(islandgeo);
        var sectorbox = new THREE.BoxGeometry( islandR*1.5, islandR*1.5, islandR );
        sectorbox.translate(boxposes[i].x, boxposes[i].y, boxposes[i].z);
        var box = new ThreeBSP(sectorbox);

        var seasoniln = iln.intersect(box).toGeometry();
        
        var island = new THREE.Mesh( seasoniln, mats[i] );
        island.rotation.x = Math.PI/2; 
        island.receiveShadow = true; 
        scene.add(island);
    }
    
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
    var path = "imgs/skybox/";//设置路径
    var directions  = ["px", "nx", "py", "ny", "pz", "nz"];//获取对象
    var format = ".png";//格式
    //创建盒子，并设置盒子的大小为( 700, 700, 700 )
    var skyGeometry = new THREE.BoxGeometry( 700, 700, 700 );
    //设置盒子材质
    var materialArray = [];
    var textureLoader = new THREE.TextureLoader();
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: textureLoader.load( path + directions[i] + format ),//将图片纹理贴上
            opacity: skyOpac,
            transparent:true,
            blending: THREE.AdditiveBlending,
            
            side: THREE.BackSide/*镜像翻转，如果设置镜像翻转，那么只会看到黑漆漆的一片，因为你身处在盒子的内部，所以一定要设置镜像翻转。*/
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );//创建一个完整的天空盒，填入几何模型和材质的参数
//    scene.add( skyBox );//在场景中加入天空盒
    
     var texture = textureLoader.load('imgs/sky.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2, 1 );
     var skyGeo = new THREE.SphereGeometry( 400, 32, 15 );
     skyMat = new THREE.MeshBasicMaterial( { 
         color:0xffffff, 
         map: texture,
         side: THREE.BackSide,
         opacity: skyOpac,
//         emissive:0x3c80a8,
        blending: THREE.AdditiveBlending,
         transparent: true
     } );
     var sky = new THREE.Mesh( skyGeo, skyMat );
     sky.renderOrder = 10; // before lensflare. 
     scene.add( sky );
    
    // scene.background = new THREE.CubeTextureLoader()
    //      .setPath( 'imgs/skybox/' )
    //      .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
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
    
    summer = new THREE.Summer(); 
    var summerGroup = summer.group; 
    summerGroup.position.set(islandR/2, islandThick + .05, -islandR/2);

    summer.addObjs(scene);
    scene.add(summerGroup);
    
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


 
function addStats() {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

}

// --------- physics --------------------

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
    
    var flagroup = new THREE.Group();
    

    
    // The cloth
    // Cloth graphic object
    var clothWidth = 6;
    var clothHeight = 4;
    var divs = 4;
    var clothNumSegmentsZ = clothWidth * divs;
    var clothNumSegmentsY = clothHeight * divs;
    var clothSegmentLengthZ = clothWidth / clothNumSegmentsZ;
    var clothSegmentLengthY = clothHeight / clothNumSegmentsY;
    var clothPos = new THREE.Vector3( -3, 14, clothWidth / 2 );
    //var clothGeometry = new THREE.BufferGeometry();
    var clothGeometry = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    clothGeometry.rotateY( Math.PI * 0.5 );
    clothGeometry.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5 );
    //var clothMaterial = new THREE.MeshLambertMaterial( { color: 0x0030A0, side: THREE.DoubleSide } );
    var clothMaterial = new THREE.MeshLambertMaterial( { 
        color: 0xFFFFFF, 
        emissive:0x333333,
        
        side: THREE.DoubleSide 
    } );
    cloth = new THREE.Mesh( clothGeometry, clothMaterial );
    cloth.castShadow = true;
    cloth.receiveShadow = true;
    flagroup.add( cloth );
    new THREE.TextureLoader().load( "imgs/sysu.jpeg", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
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
    
    
    // The base
    var armMass = 2;
    var armLength = 3 + clothWidth;
    var pylonHeight = clothPos.y + clothHeight;
	var quat = new THREE.Quaternion();
    var pos = new THREE.Vector3(0,0,0);
    
    var baseMaterial2 = new THREE.MeshLambertMaterial( { 
        color: 0xdddddd,
        map: THREE.ImageUtils.loadTexture( "imgs/wood.jpeg" )
    } );
    var baseMaterial3 = new THREE.MeshPhongMaterial( { color: 0x0000dd } );
    				

    quat.set( 0, 0, 0, 1 );
    
    pos.set( clothPos.x, 0.5 * pylonHeight , clothPos.z - clothWidth);
    var pylon = createParalellepiped( 0.1, pylonHeight, 0.1, 0, pos, quat, baseMaterial2, flagroup );
//    pylon.castShadow = true;
//    pylon.receiveShadow = true;
//				pos.set( clothPos.x, pylonHeight + 0.2, clothPos.z - 0.5 * armLength );
    pos.set( clothPos.x, pylonHeight + 0.2, clothPos.z + 0.2);
    var volumeVec = new THREE.Vector3(0.4,0.4,armLength + 5);
    var arm = createParalellepiped( volumeVec.x, volumeVec.y, volumeVec.z, armMass, pos, quat, baseMaterial3, flagroup );
//    arm.castShadow = true;
//    arm.receiveShadow = true;
    arm.visible = false;

    // Glue the cloth to the arm
    var influence = 0.5; // the pull for
//                appendAnchor(int node,btRigidBody* body, const btVector3& localPivot,bool                   disableCollisionBetweenLinkedBodies=false,btScalar in
    
    clothSoftBody.appendAnchor( 2, arm.userData.physicsBody, false, influence );
//                
    // --------------------------------------------



    influence = 0.85; // the pull for

    clothSoftBody.appendAnchor( clothNumSegmentsZ, pylon.userData.physicsBody, false, influence );
    clothSoftBody.appendAnchor( (clothWidth*divs+1)*clothHeight*divs + clothNumSegmentsZ , pylon.userData.physicsBody, false, influence );

// --------------------------------------------

    // Hinge constraint to move the arm
    var pivotA = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
    var pivotB = new Ammo.btVector3( 0, -0.2, - armLength * 0.5 );
    var axis = new Ammo.btVector3( 0, 1, 0 );
    hinge = new Ammo.btHingeConstraint( pylon.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true );
    physicsWorld.addConstraint( hinge, true );

    // --------------------------------------------


                
    scene.add(flagroup); 
    
    flagroup.position.set(-25,0,0);
    flagroup.castShadow = true;

}

function createParalellepiped( sx, sy, sz, mass, pos, quat, material, grp ) {

    var threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( margin );

    createRigidBody( threeObject, shape, mass, pos, quat, grp );

    return threeObject;

}

function createRigidBody( threeObject, physicsShape, mass, pos, quat, grp ) {

    threeObject.position.copy( pos );
    threeObject.quaternion.copy( quat );

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    var motionState = new Ammo.btDefaultMotionState( transform );

    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    physicsShape.calculateLocalInertia( mass, localInertia );

    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );

    threeObject.userData.physicsBody = body;

    grp.add( threeObject );

    if ( mass > 0 ) {
        rigidBodies.push( threeObject );

        // Disable deactivation
        body.setActivationState( 4 );
    }

    physicsWorld.addRigidBody( body );

}

function updatePhysics( deltaTime ) {

    // Hinge control
    armMovement = 2*Math.sin(0.7*clock.getElapsedTime());
    if (hinge) hinge.enableAngularMotor( true, 0.8 * armMovement, 50 );

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update cloth
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

    // Update rigid bodies
    for ( var i = 0, il = rigidBodies.length; i < il; i++ ) {
        var objThree = rigidBodies[ i ];
        var objPhys = objThree.userData.physicsBody;
        var ms = objPhys.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( transformAux1 );
            var p = transformAux1.getOrigin();
            var q = transformAux1.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}


