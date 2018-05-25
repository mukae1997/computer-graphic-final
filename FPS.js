var renderer,camera,scene,gui,light,stats,controls;
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

function initRender() {
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    //物体的渲染顺序将会由他们添加到场景中的顺序所决定
    renderer.sortObjects = false;
    
    document.body.appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    //camera.position.set(0, 0, 50);
}

function initScene() {
    scene = new THREE.Scene();
}

//初始化dat.GUI简化试验流程
function initGui() {
    //声明一个保存需求修改的相关数据的对象
    //gui = {};
    //var datGui = new dat.GUI();
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
}

function initLight() {
    scene.add(new THREE.AmbientLight(0xffffff));
    var pointColor = new THREE.Color( 0xffffff );
    var directionalLight = new THREE.DirectionalLight(pointColor);

    directionalLight.position.set(0, 60, 0);
    directionalLight.castShadow = true;

    scene.add(directionalLight);
}

function initModel() {
    var textureLoader = new THREE.TextureLoader();
    // 设置地面
    // 地面纹理
    var textureSquares = textureLoader.load( "../sprites/Floors.jpg" );
    textureSquares.repeat.set( 1000, 1000 );
    textureSquares.wrapS = textureSquares.wrapT = THREE.RepeatWrapping;
    textureSquares.magFilter = THREE.NearestFilter;
    textureSquares.format = THREE.RGBFormat;
    // 地面材质
    var groundMaterial = new THREE.MeshPhongMaterial( {
        shininess: 0,
        map: textureSquares
        } );
    // 地面形状
    var planeGeometry = new THREE.PlaneBufferGeometry( 100, 100 );
    // 生成地面
    var ground = new THREE.Mesh( planeGeometry, groundMaterial );
    ground.position.set( 0, 0, 0 );
    ground.rotation.x = - Math.PI / 2;
    ground.scale.set( 1000, 1000, 1000 );
    ground.receiveShadow = true;
    scene.add( ground );

    //添加辅助线，用来标示摄像机，因为摄像机没有空间大小，所以用这个来模拟一个摄像机盒
    group = new THREE.Group();
    up = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 10, 0x00ff00);
    horizontal = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 10, 0x00ffff);
    down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 10, 0xffff00);
    
    group.add(up);
    group.add(horizontal);
    group.add(down);
}

function initCube() {
    var geometry = new THREE.CubeGeometry(20, 20, 20);
    var material = new THREE.MeshLambertMaterial( { color:0x880000} );

    var cube = new THREE.Mesh( geometry,material);
    cube.position.set(0,0,0);
    scene.add(cube);
}

//初始化性能插件
function initStats() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
}

function initControls() {

    controls = new THREE.PointerLockControls( camera );
    controls.getObject().position.y = 50;
    controls.getObject().position.x = 100;
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
        var horizontalIntersections = horizontalRaycaster.intersectObjects(scene.children, true);
        var horOnObject = horizontalIntersections.length > 0;
        // 如果返回结果不为空则发生了碰撞
        if(!horOnObject){
            if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;
        }

        // 复制相机的位置
        downRaycaster.ray.origin.copy( control.position );
        // 获取相机靠下10的位置
        downRaycaster.ray.origin.y -= 10;
        // 判断是否停留在了物体上面
        var intersections = downRaycaster.intersectObjects( scene.children, true);
        var onObject = intersections.length > 0;

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

    //窗口变动触发的函数
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //render();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    //更新控制器
    render();

    //更新性能插件
    stats.update();

    renderer.render( scene, camera );

    requestAnimationFrame(animate);
}

function draw() {
    //兼容性判断
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    initPointerLock();
    initGui();
    initRender();
    initScene();
    initCamera();
    initLight();
    initModel();
    initCube();
    initControls();
    initStats();

    animate();
    window.onresize = onWindowResize;
}