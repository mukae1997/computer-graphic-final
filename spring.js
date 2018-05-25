THREE.Spring = function(){
    
    this.type = "spring";
    this.group = new THREE.Group();
    this.petals = undefined;
}

THREE.Spring.prototype.update = function(){
    this.updatePetals();
}

THREE.Spring.prototype.updatePetals = function(){
    var maxh = 20;
    var dt = new Date();
    const loop = 5000;
    var state = dt.getTime() % loop / loop;
    this.petals.position.y = maxh * (1 - state); 
    
}
THREE.Spring.prototype.addObjs = function(){
//    this.addObjTree();
    this.addGrass(-10, -10);
    this.addGrass(-14, -8);
    this.addGrass(-25, 30);
    this.addGrass(20, -10);
    
    this.addBasin();
    
    this.addStones();
    this.addPetals();
}
THREE.Spring.prototype.addPetals = function () {
    var geometry = new THREE.BufferGeometry();
    var vertices = [];
    var textureLoader = new THREE.TextureLoader();
    var petalsprite = textureLoader.load( 'imgs/petal.png' );
    
    
    for ( i = 0; i < 10; i ++ ) {
        var x = Math.random() * 3;
        var y = Math.random() * 3;
        var z = Math.random() * 10 + 10;
        vertices.push( x, y, z );
    }
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
    var mat = new THREE.PointsMaterial( { 
        size: 3,
        map: petalsprite, 
        blending: THREE.AdditiveBlending, 
        depthTest: true, 
        transparent : true,
        side:THREE.DoubleSide
    } );
    this.petals = new THREE.Points(geometry, mat);
    this.group.add(this.petals);
}


THREE.Spring.prototype.addObjTree = function() {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/5n2xpdhz35vk-flower/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'plants1.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'plants1.obj', function ( object ) {

            object.position.y = -1;
            object.position.x = 0;
            object.position.z = 0;
            object.rotation.y = 1;
            object.scale.setScalar(0.03);
            self.group.add( object );
//            var obj2 =  object.clone();
//            obj2.scale.setScalar(0.03)
//            obj2.position.x = -13;
//            obj2.rotation.y = Math.PI;
//            scene.add( obj2 );
 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Spring.prototype.addGrass = function(posx, posz) {
    var h = 2;
    var l = 8;
    var grasspln = new THREE.PlaneGeometry(l,h);
    var grassmat = new THREE.MeshPhongMaterial( { 
//        color: 0xffffff, 
        specular: 0xffffff,
        map: THREE.ImageUtils.loadTexture('imgs/thingrass.png')
        , transparent: true 
        , side:THREE.DoubleSide
//        , 
//        blending:THREE.MultiplyBlending
//        format: THREE.RGBAFormat
//        
    });
    var grass = new THREE.Mesh(grasspln, grassmat);
    grass.position.y = h;
    grass.rotateOnWorldAxis(new THREE.Vector3(0,1,0),-Math.PI / 2);
    
    var grassgrp = new THREE.Group();
    
    for (var i = 0 ; i < 35; i++) {
        var agrass = grass.clone();
        var ang = i * 0.3;
        agrass.rotateOnWorldAxis(new THREE.Vector3(0,1,0),
                             -Math.PI / 2 - ang);
        agrass.scale.y = 2 + THREE.Math.randFloatSpread(2);
        agrass.position.set(Math.random() * posx, agrass.scale.y  * grass.position.y / 2, Math.random()* posz);
        grassgrp.add(agrass);
    }
    
    this.group.add(grassgrp);
    
}


THREE.Spring.prototype.addBasin = function() {
    var r1 = 5, r2 = 3, th = 2, h = 3;
     var inner = new THREE.CylinderGeometry( r1, r2, h, 8 );
     var outer = new THREE.CylinderGeometry( r1 + th, r2 + th, h, 8 );
    var inn = new ThreeBSP( inner );
    var out = new ThreeBSP( outer );
    var basingeo = out.subtract(inn).toGeometry();
    
    var basinmat = new THREE.MeshPhongMaterial( { 
        color: 0xcccccc, 
        specular: 0xcccccc 
    });
    
    var basin = new THREE.Mesh(basingeo, basinmat); 
    basin.position.y = h/2;
     
    
    this.group.add(basin);
    
}

THREE.Spring.prototype.addStones = function() {
    
    var stonesp = new THREE.Shape();
    var cnt = 5;
    var r;
    for (var i = 0 ; i < cnt; i++) {
       r = 0.1 + Math.random();
        var ang = i * Math.PI * 2 / cnt;
        stonesp.lineTo(r *   Math.cos(ang), 
                       r *   Math.sin(ang));
    }
        var ang = Math.PI * 2;
        stonesp.lineTo(r *   Math.cos(ang), 
                       r *  Math.sin(ang));
//    flrshape.lineTo(r, 0);w
     
    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };


    var stonegeo = new THREE.ExtrudeGeometry( stonesp, extrudeSettings );
    
    var stonemat = new THREE.MeshLambertMaterial( { 
        color: 0xdddddd 
    });
    var stone = new THREE.Mesh(stonegeo, stonemat);
    stone.position.y = 1;
    stone.position.x = 15;
    stone.rotation.x = Math.PI/2;
    this.group.add(stone);
}