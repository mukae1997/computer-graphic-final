// python -m http.server
THREE.Winter = function (x = 0, y = 0, z = 0, size = 30) {
    // x, y, z 为区域中心坐标，size 为半径
    this.type = "winter";
    this.group = new THREE.Group();

    this.position = {x, y, z};
    this.size = size;
    this.height = 60;

    // （雪）
    this.particle = new Particle(this.position, size, this.height);
    this.group.add(this.particle.particleSystem);

    // 地面
    this.plane = getPlane()
    this.plane.rotateX(-Math.PI / 2)
    this.plane.position.set(x, y, z)
    this.group.add(this.plane)

    // 光
    let light = new THREE.PointLight(0xFCE38A, 0.1, 0, Math.PI / 2);
    light.position.set( -60, 50, 80 );
    this.group.add( light );

    this.getHouse()

    // 树
    let tree = new Tree(x - 10, y + 2, z + 10)
    this.group.add(tree.tree);
    tree = new Tree(x - 20, y + 2, z + 10)
    this.group.add(tree.tree)

    // 雪人
    this.group.add(snowman(x, y + 10, z))
}

THREE.Winter.prototype.update = function () {
    this.particle.update();
}

// ------------------------------------------------------------
function Particle(center, size, height) {
    // center 指粒子系统中心，size 为范围
    this.particleCount = 2000;
    this.particles = new THREE.Geometry();
    this.center = center;
    this.size = size;
    this.height = height;

    var texture = new THREE.TextureLoader().load("imgs/snowflake-27-64.png" );
    var pMaterial = new THREE.PointsMaterial({
            size: 0.5,
            map: texture,
            // alphatest:0.5,
            transparent: true,
            blending: THREE.CustomBlending
            // opacity: 1
        });
    
    for(var p = 0; p < this.particleCount; p++) {
        var pX = center.x - size + Math.random() * size * 2,
            pY = height / 2 + (height / 2) * Math.random(),
            pZ = center.z - size + Math.random() * size * 2,
        particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = new THREE.Vector3(0, -Math.random(), 0); 
        this.particles.vertices.push(particle);
    }

    this.particleSystem = new THREE.Points(this.particles, pMaterial);
}

Particle.prototype.update = function () {
    // this.particleSystem.rotation.y += 0.001;
    var pCount = this.particleCount;

    while(pCount--) {
        var particle = this.particles.vertices[pCount];
        if(particle.y < 0) {
            particle.y = this.height * Math.random();
            particle.velocity.y = 0;
        }
        particle.velocity.y -= Math.random() * 0.001;

        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.z += particle.velocity.z;
    }
    this.particleSystem.geometry.verticesNeedUpdate = true;
}

// ------------------------------------------------------------
// 创建雪地贴图
function noiseMap(size, intensity) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        width = canvas.width = size || 512,
        height = canvas.height = size || 512;
    console.log(canvas)

    intensity = intensity || 120;

    var imageData = ctx.getImageData(0, 0, width, height),
        pixels = imageData.data,
        n = pixels.length,
        i = 0;

    while (i < n) {
        pixels[i++] = pixels[i++] = pixels[i++] = Math.sin(i * i * i + (i / n) * Math.PI) * intensity; //+ (random() * 256) | 0;
        pixels[i++] = 255; // * Math.random();
    }
    ctx.putImageData(imageData, 0, 0);

    let sprite = new THREE.Texture(canvas);
    sprite.needsUpdate = true;

    return sprite;
}

function getPlane() {
    let texture = new THREE.TextureLoader().load('imgs/snowflake-27-64.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set( 4, 4 );
    let material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 1000,
        //metalness: 1,
        // specularMap: noiseMap(60,60),
        bumpMap: noiseMap(1024, 255),
        // bumpMap: texture,
        //displacementScale: 0.1,// new THREE.Vector2(0.25, 0.25),
        bumpScale: 0.025,
        emissive: 0xEBF7FD,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading
    });
    let geometry = new THREE.PlaneGeometry(60, 60, 10, 10);
    let plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    return plane
}

// -----------------------------------tree------
function loadObj(mtl, obj, objBase, callback) {
    let mtlLoader = new THREE.MTLLoader()
    mtlLoader.setPath( objBase );
    mtlLoader.load( mtl, function ( materials ) {
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( objBase );
        objLoader.load( obj, function ( object ) {
            callback(object);
        }, () => {}, () => {})
    })
}

THREE.Winter.prototype.getHouse = function () {
    let objBase = 'obj/house.obj/'
    let mtl = 'house.mtl', obj = 'house.obj'
    let winter = this
    loadObj(mtl, obj, objBase, function (obj) {
        let object = obj.clone()
        object.position.x = winter.position.x;
        object.position.y = winter.position.y;
        object.position.z = winter.position.z;
        console.log('house:')
        console.log(object)
        winter.group.add(object)
    })
}

function Tree(x, y, z) {
    this.tree = new THREE.Group();
    this.position = {x, y, z}

    let top = getCone(3, 6, 4)
    top.position.set(this.position.x, this.position.y + 10, this.position.z)
    let middle = getCone(4, 5, 4, 0x00ff00)
    middle.position.set(this.position.x, this.position.y + 7, this.position.z)
    let bottom = getCone(5, 5, 4, 0x00ff00)
    bottom.position.set(this.position.x, this.position.y + 4, this.position.z)

    let geometry = new THREE.CylinderGeometry(1, 1, 4, 6)
    let material = new THREE.MeshBasicMaterial({color: 0x000000})
    let trunk = new THREE.Mesh(geometry, material)
    trunk.position.set(this.position.x, this.position.y, this.position.z)

    this.tree.add(top)
    this.tree.add(middle)
    this.tree.add(bottom)
    this.tree.add(trunk)
}

function getCone(r, h, s, color = 0xffffff) {
    let geometry = new THREE.ConeBufferGeometry(r, h, s)
    let texture = THREE.ImageUtils.loadTexture( "imgs/tree.png" );
    let material = new THREE.MeshBasicMaterial({
        map: texture,
    })
    let cone = new THREE.Mesh(geometry, material)
    return cone
}

//----------------snow man--------------
function snowman(x, y, z) {
    man = new THREE.Group();

    let geometry = new THREE.SphereGeometry( 3, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    let head = new THREE.Mesh( geometry, material );
    head.position.set(x, y, z)
    man.add(head)

    geometry = new THREE.SphereGeometry(5, 32, 32);
    let texture = THREE.ImageUtils.loadTexture( "imgs/snowbody.png" );
    material = new THREE.MeshBasicMaterial({
        map: texture
    });
    let body = new THREE.Mesh(geometry, material);
    body.position.set(x, y - 6, z)
    man.add(body)

    geometry = new THREE.CircleGeometry(0.2, 32, 32)
    material = new THREE.MeshBasicMaterial({color: 0x000000})
    let eye = new THREE.Mesh(geometry, material)
    eye.position.set(x + 1.5, y + 0.3, z + 2.7)
    man.add(eye)
    let eye2 = eye.clone()
    eye2.position.set(x - 1.5, y + 0.3, z + 2.7)
    man.add(eye2)

    geometry = new THREE.ConeGeometry(0.6, 1, 32)
    material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    let nose = new THREE.Mesh(geometry, material)
    nose.position.set(x, y, z + 3)
    nose.rotateX(Math.PI / 2)
    man.add(nose)

    geometry = new THREE.CylinderGeometry( 0.3, 0.6, 4 );
    material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    let lefthand = new THREE.Mesh( geometry, material );
    lefthand.position.set(x - 5, y - 3, z)
    lefthand.rotateX(Math.PI / 3)
    lefthand.rotateZ(Math.PI / 2)
    man.add(lefthand)
    geometry = new THREE.CylinderGeometry( 0.6, 0.3, 4 );
    material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    let righthand = new THREE.Mesh( geometry, material );
    righthand.rotateX(Math.PI / 3)
    righthand.rotateZ(Math.PI / 2)
    righthand.position.set(x + 5, y - 3, z)
    man.add(righthand)
    return man
}