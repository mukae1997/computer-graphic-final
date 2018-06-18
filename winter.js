// python -m http.server
// http://0.0.0.0:8000/
THREE.Winter = function (x = 0, y = 0, z = 0, size = 30, island) {
    // 获得岛从而获得岛的形状，用于构建雪地
    this.island = island
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

    // 光
    // let light = new THREE.PointLight(0xffffff, 1, 0, Math.PI / 2);
    // light.position.set( -30, 10, 60 );
    // this.group.add( light );

    // tree
    let materials = []
    this.snowFace = THREE.ImageUtils.loadTexture('imgs/snowground.jpg')
    this.snowFace.wrapS = THREE.RepeatWrapping;
    this.snowFace.wrapT = THREE.RepeatWrapping;
    this.snowFace.repeat.set( 0.01, 0.015 );

    let material = new THREE.MeshBasicMaterial({
        map: this.snowFace,
        color: 0xdfdfdf
    })
    materials.push(material)
    material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture( "imgs/tree.jpg" )
    })
    materials.push(material)
    this.loadTree('obj/wtree.obj/file.obj', materials, this.position.x + 6, this.position.y, this.position.z - 6)
    let materials2 = materials.slice()
    materials2.reverse()
    this.loadTree('obj/wtree4/file.obj', materials2, this.position.x + 20, this.position.y, this.position.z + 16, Math.PI / 2)
    
    this.loadHouse()

    // 雪人
    let snowp = snowman(0, 0, 0)
    snowp.scale.set(0.7, 0.7, 0.7)
    snowp.position.set(x - 2, y + 7, z - 15)
    this.group.add(snowp)

    // grass
    this.loadGrass()

    // this.addSnowGround()
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

    var texture = new THREE.TextureLoader().load('imgs/snowball.png')//load("imgs/snowflake-27-64.png" );
    var pMaterial = new THREE.PointsMaterial({
            size: 0.2,
            map: texture,
            // alphatest:0.5,
            transparent: true,
            blending: THREE.CustomBlending,
            opacity: 0.8
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
    let texture = new THREE.TextureLoader().load('imgs/snowground.jpg')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set( 4, 4 );
    let material = new THREE.MeshBasicMaterial({
        map: texture
    });
    let geometry = new THREE.PlaneGeometry(60, 60, 10, 10);
    let plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    return plane
}

// -----------------------------------tree------
THREE.Winter.prototype.loadTree = function (path, materials, x, y, z, rx = 0) {
    let winter = this
    let loader = new THREE.OBJLoader();
    loader.load(path, function (geometry) {
        geometry.children.forEach((child, index) => {
            if(child instanceof THREE.Mesh) {
                child.material = materials[index];
            }
        })
        geometry.scale.set(0.2, 0.2, 0.2)
        geometry.rotateY(rx)
        geometry.position.set(x, y, z)
        winter.group.add(geometry)
    })
}

function loadModel(mtl, obj, objBase) {
    let mtlLoader = new THREE.MTLLoader()
    mtlLoader.setPath( objBase );
    return new Promise((resolve, reject) => {
        mtlLoader.load( mtl, function ( materials ) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( objBase );
            objLoader.load( obj, function ( object ) {
                resolve(object);
            }, () => {}, () => {})
        })
    })
}

THREE.Winter.prototype.loadGrass = async function () {
    let {x, y, z} = this.position
    let objBase = 'obj/deadgrass/'
    let mtl = 'file.mtl', obj = 'file.obj'
    let grass = await loadModel(mtl, obj, objBase)
    grass.position.set(x - 3, y - 1, z + 2)
    grass.scale.set(0.06, 0.06, 0.06)
    x = x + 6;
    z = z - 6;
    for (let i = -3; i < 3; i+=2) {
        for (let j = -3; j < 3; j+=2) {
            let grassCopy = grass.clone()
            grassCopy.position.set(x - 3 + i, y + 1, z + 2 + j)
            this.group.add(grassCopy)
        }
    }
}

THREE.Winter.prototype.loadHouse = function (path='obj/pavilion/file.obj') {
    let winter = this
    let loader = new THREE.OBJLoader();
    loader.load(path, function (geometry) {
        let materials = []
        let material = new THREE.MeshLambertMaterial({color: 0x000000})
        materials.push(material)
        material = new THREE.MeshBasicMaterial({
            // map: THREE.ImageUtils.loadTexture('imgs/snowface.jpg')
            color: 0xcccccc,
            map: winter.snowFace,
            opacity:0.5
        })
        materials.push(material)
        material = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture( "imgs/wood2.jpg" )
        })
        materials.push(material)
        geometry.children.forEach((child, index) => {
            if(child instanceof THREE.Mesh) {
                child.material = materials[index];
            }
        })
        geometry.scale.set(0.03, 0.03, 0.03)
        geometry.position.set(winter.position.x - 15, winter.position.y, winter.position.z - 16)
        winter.group.add(geometry)

        let {x, y, z} = winter.position
        // loadModel('file.mtl', 'file.obj', 'obj/wflower4/')
        //   .then((vase) => {
        //     vase.position.set(x, y - 1, z)
        //     vase.scale.set(10, 10, 10)
        //     winter.group.add(vase)
        //   })
        // 石头
        // let loader = new THREE.OBJLoader();
        // loader.load('obj/stoneChair/file.obj', (chair) => {
        //     let material = new THREE.MeshLambertMaterial({color: 0xffff00})
        //     chair.children.forEach((child) => {
        //         if (child instanceof THREE.Mesh) child.material = material
        //     })
        //     chair.position.set(x, y, z)
        //     chair.scale.set(0.3, 0.3, 0.3)
        //     winter.group.add(chair)
        // })
        loader.load('obj/stones/file.obj', (stones) => {
            let material = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( "imgs/tree.jpg" )
            })
            stones.children.forEach((child, index) => {
                if(child instanceof THREE.Mesh) {
                    child.material = material;
                }
            })
            stones.position.set(x + 5, y, z + 2)
            stones.rotateY(Math.PI / 5)
            stones.scale.set(0.1, 0.1, 0.1)
            winter.group.add(stones)
        })
    })
}

// 简陋几何树
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
    let material = new THREE.MeshBasicMaterial({
        color: 0xcfcfcf
    });
    let head = new THREE.Mesh( geometry, material );
    head.position.set(x, y, z)
    man.add(head)

    geometry = new THREE.SphereGeometry(5, 32, 32);
    let texture = THREE.ImageUtils.loadTexture( "imgs/snowbody.png" );
    material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xcfcfcf
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

// --------------------- snow ground -------------------------

// THREE.Winter.prototype.addSnowGround = function () {
//     let curves = this.island.geometry.parameters.shapes.curves
//     var shape = new THREE.Shape();
    
//     let start = 50, end = start + 50;
//     let v1 = curves[start].v1
//     shape.moveTo(v1.x, v1.y)
//     for (let i = start; i < end; i++) {
//         let v2 = curves[i].v2
//         shape.lineTo(v2.x, v2.y)
//     }
//     shape.lineTo(0, 0)
//     shape.lineTo(v1.x, v1.y)
//     // var length = 20, width = 20;
//     // shape.moveTo( 0,0 );
//     // shape.bezierCurveTo(-0.2 * length, 0.2 * width, -0.2 * length, 0.8 * width, 0, width);
//     // shape.bezierCurveTo(0.2 * length, 0.8 * width, 0.8 * length, 1.2 * width, length, width);
//     // shape.bezierCurveTo(1.2 * length, 0.8 * width, 1.2 * length, 0.2 * width, length, 0);
//     // shape.bezierCurveTo(0.8 * length, -0.2 * width, 0.2 * length, -0.2 * width, 0, 0);

//     var extrudeSettings = {
//         steps: 1,
//         depth: 0,
//         bevelThickness: 1,
//         bevelSize: 5,
//         bevelSegments: 32,
//         amount: 0
//     };

//     var geometry = new THREE.ShapeGeometry( shape );
//     console.log('plane')
//     console.log(geometry)
//     var material = new THREE.MeshLambertMaterial( {
//         map: THREE.ImageUtils.loadTexture('imgs/snowface.jpg'),
//         // color: 0xffffff,
//         side: THREE.DoubleSide
//     });
//     var mesh = new THREE.Mesh( geometry, material );

//     mesh.rotation.x = Math.PI/2; 
//     mesh.position.y = this.position.y;
//     this.group.add( mesh );
// }