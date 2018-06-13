THREE.Fall = function(){
    
    this.type = "Fall";
    this.group = new THREE.Group();
    this.petals = undefined;
    this.petalsgeo = undefined;
    this.basin = undefined;
    this.staticpetals = undefined;
    
    this.scene = null;
    
    this.treeobj = null;
    this.flowerobj = null;
    
    this.trees = [];
    
}

THREE.Fall.prototype.update = function(){
    this.updatePetals();
}

THREE.Fall.prototype.addObjs = function(scene){
    this.scene = scene;
    /*this.loadFlowerobj(() => {
        this.addFlower(20,20, 0.2);
        this.addFlower(25,22, 0.15, Math.PI*1.5);
        this.addFlower(20,23, 0.17, Math.PI/8);
        
    });*/
    this.loadTreeobj(()=>{
        this.addObjTree(0,0,1,0.3);
        this.addObjTree(0,-30, -Math.PI/2, 0.17);
        this.addObjTree(20,-30, Math.PI/2, 0.2);
        this.addObjTree(15,-15, Math.PI/2, 0.12);
        this.addObjTree(-13,-19, -Math.PI/4, 0.23);
        this.addObjTree(-25, 13, Math.PI/9, 0.1);
        this.addObjTree(25, 13, Math.PI/9, 0.14);
        this.addObjTree(-3, -11, Math.PI/9, 0.12);
        this.addObjTree(-5, -13, Math.PI/9, 0.11);
        this.addObjTree(8, -16, Math.PI/9, 0.13);
         
    });
    
    this.addGrass(-7, -7);
    this.addGrass(-14, -8);
    //this.addGrass(-17, 30,2.5,2);
    this.addGrass(20, -10);
    
    this.addGrass(7, 7, 2);
    this.addGrass(14, 8, 2);
    this.addGrass(17, -30,2.5,2);
    //this.addGrass(-20, 10);
    
    this.addBasin();
    this.addGrass(0, 0, 3, 3);
    this.addGrass(-12, 16, 3, 2);
    //this.addGrass(0, 30, 1.3, 2);
    // flowers
    this.addGrass(-23, -23, 1.2, 2); 
    
    
    this.addStones(0,0,5,100);
    this.addStones(6,-30,2,8);
//    this.addStones(-5,27,2,8);
    this.addStones(-25,5,2,8);
    this.addStones(-18,-19,0,8);
    
    this.addStones(-22,-22,0,18);
    
    
    this.addleaves();
    
    
			 
}

/////////////////////////////////////////////////

THREE.Fall.prototype.updatePetals = function(){
    var maxh = 26;
    var dt = new Date();
    const loop = 5000;
    var state = dt.getTime() % loop / loop;
//    this.petals.position.y = maxh * (1 - state); 
    var poses = this.petalsgeo.getAttribute("position").array;
    for (var i = 0; i < poses.length; i+=3){
         poses[i+1] -= Math.random()*0.2;
        if (Math.random() > 0.7) {
         poses[i+1] -= Math.random()*0.5;
            
        } 
        poses[i+1] = poses[i+1] < 0 ? maxh : poses[i+1];
    }
//    this.petalsgeo.verticesNeedUpdate = true;
    this.petalsgeo.attributes.position.needsUpdate = true;
    
}

/////////////////////////////////////////////////


THREE.Fall.prototype.loadTreeobj = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/Models/';   
    var self = this;
    mtlLoader.setPath( treept);
    mtlLoader.load( 'BL16a.mtl', function( materials ) {
        materials.alphaTest = 0.5;
        materials.depthTest = true;
        materials.transparent = true;
        materials.side = THREE.DoubleSide;

        materials.preload();
        

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'BL16a.obj', function ( object ) {
            object.scale.setScalar(1);
            object.rotation.x = -Math.PI/2;
            self.treeobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}


THREE.Fall.prototype.loadFlowerobj = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/FallTree/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( '3d-model.mrl', function( materials ) {

        materials.preload();
        

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'tree.obj', function ( object ) {
            object.position.set(20,0,20);
            object.scale.setScalar(100);
            
            console.log(object)
            self.flowerobj = object;
//            self.group.add(object);
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}
/////////////////////////////////////////////////


THREE.Fall.prototype.addleaves = function () {
    var geometry = new THREE.BufferGeometry();
    var vertices = [];
    var textureLoader = new THREE.TextureLoader();
    var petalsprite = textureLoader.load( 'imgs/BL16lef3.png' ); 
    for ( i = 0; i < 40; i ++ ) {
        var x = THREE.Math.randFloatSpread(14) - 2;
        var y = Math.random() * 10 + 2;
        var z = THREE.Math.randFloatSpread(14) - 2;
        vertices.push( x, y, z );
    }
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
    var mat = new THREE.PointsMaterial( { 
//        lights:true, 
        size: 1,
        map: petalsprite, 
//        blending: THREE.AdditiveBlending, 
        depthTest: true, 
        transparent : true,
        side:THREE.DoubleSide,
        alphaTest: 0.5,
        //color:0xd23c28
    } );
    this.petals = new THREE.Points(geometry, mat);
    this.petalsgeo = geometry;
    
    
    this.group.add(this.petals);
    
    // add static petals
    var staticgeo = new THREE.BufferGeometry();
    var vtx2 = [];
    for ( i = 0; i < 100; i ++ ) {
        var x = THREE.Math.randFloatSpread(18);
        var y = this.basin.position.y+this.basin.thick/2 + 0.1;
        var z = THREE.Math.randFloatSpread(18);
        vtx2.push( x, y, z );
    }
    
    // on the ground
    for ( i = 0; i < 5000; i ++ ) {
        var theta = Math.random() * Math.PI * 2;
        var r = THREE.Math.randFloat(6,40);
        var x = r * Math.cos(theta) ;
        var y = 0.4 - Math.random();
        var z = r * Math.sin(theta);
        vtx2.push( x, y, z );
    }
    staticgeo.addAttribute( 'position', new THREE.Float32BufferAttribute( vtx2, 3 ) );
    this.staticpetals = new THREE.Points(staticgeo, mat);
    this.group.add(this.staticpetals);
}


THREE.Fall.prototype.addFlower = function(x=0,z=0,scale=-1,rot=0) {
    
    
    if(!this.flowerobj) return ;
    var object = this.flowerobj.clone();
    if (scale != -1) {
        object.scale.setScalar(scale);
    } else {
        object.scale.setScalar(0.25);
        
    }
    object.position.set(x, -1.5, z);
//            object.scale.y = Math.random(1)*0.03;
    object.rotation.y = rot;
    this.group.add( object );
    
}
THREE.Fall.prototype.addObjTree = function(x = 0, z = 0,roty = Math.PI/2, scaley = -1) {
    if(!this.treeobj) return ;
    var object = this.treeobj.clone();
    var self = this;
    object.position.y = 0.7;
    object.position.x = x;
    object.position.z = z;
    //object.rotation.y = roty;
    
    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley * THREE.Math.randFloat(0.5,0.9));
    }
    self.group.add( object ); 
//    this.trees.push(object);
    
    var pl =  new THREE.PointLight(0xffffff, 1.48, 30);
    this.scene.add(pl); 
    var h  =  THREE.Math.mapLinear(scaley,0.01 ,0.05,10,20) ;
    pl.position.set(object.position.x, 40 ,object.position.z);
    pl.position.add(this.group.position);
    var hlper = new THREE.PointLightHelper(pl);
    this.scene.add(hlper);
}

THREE.Fall.prototype.addGrass = function(posx, posz, _h = 1.5, r = 10) {
    var h = _h;
    var l = 6;
    var grasspln = new THREE.PlaneGeometry(l,h);
    var grassmat = new THREE.MeshPhongMaterial( { 
//        color: 0xffffff, 
        specular: 0xbbbbbb,
        map: THREE.ImageUtils.loadTexture('imgs/fallgrass2.png')
        , transparent: true 
        , side:THREE.DoubleSide
        , alphaTest: 0.5
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
        agrass.position.set(THREE.Math.randFloatSpread(2)*r+posx, agrass.scale.y  * grass.position.y / 2, THREE.Math.randFloatSpread(2)*r+ posz);
        grassgrp.add(agrass);
    }
    
    this.group.add(grassgrp);
    
}


THREE.Fall.prototype.addBasin = function() {
    
    var brickmap = new THREE.ImageUtils.loadTexture( 'imgs/brick.jpg' );
    brickmap.wrapS = THREE.RepeatWrapping;
    brickmap.wrapT = THREE.RepeatWrapping; 
    brickmap.repeat.set(1,10);
    
    var r1 = 9, r2 = 5, th = 3, h = 3;
     var inner = new THREE.CylinderGeometry( r1, r2, h, 8 );
     var outer = new THREE.CylinderGeometry( r1 + th, r2 + th, h, 8 );
    var inn = new ThreeBSP( inner );
    var out = new ThreeBSP( outer );
    var basingeo = out.subtract(inn).toGeometry();
    
    var basinmat = new THREE.MeshLambertMaterial( { 
        color: 0x7d4d3a,
        map: brickmap
        
        
    });
    
    this.basin = new THREE.Mesh(basingeo, basinmat); 
    this.basin.position.y = h/2;
    this.basin.thick = h;
    this.basin.r2 = r2;
//    console.log()
    
    this.group.add(this.basin);
    
}

THREE.Fall.prototype.addStones = function(x=0,y=0, r=-1,cnt=25) {
    
    if (r == -1) r = this.basin.r2;
    
    
    var rockmap = new THREE.ImageUtils.loadTexture( 'imgs/rock1.jpg' );
    rockmap.wrapS = THREE.RepeatWrapping;
    rockmap.wrapT = THREE.RepeatWrapping; 
    rockmap.repeat.set(1,2);
//    rockmap.offset.x = ( 300 / 100 ) * rockmap.repeat.x;
//    rockmap.offset.y = ( 400 / 100 ) * rockmap.repeat.y;
    var stonemat = new THREE.MeshLambertMaterial( { 
        color: 0x727272,
        map:rockmap
    }); 
    
    var stonegroup = new THREE.Group();
    
    var stonecnt = 10;
    for(var i = 0; i < cnt; i++) {
        var newstone = new THREE.Mesh(this.makeStone(), stonemat);
        var ang = Math.random() * Math.PI * 2;
        newstone.rotation.x = Math.PI/2;
        newstone.position.x = (r + THREE.Math.randFloat(5,8)) * Math.cos(ang);
        newstone.position.z = (r + THREE.Math.randFloat(5,8)) * Math.sin(ang);
        newstone.scale.y = 1.5*Math.random() + 0.2;
        newstone.position.y = 1.5 - 2*Math.random();
        stonegroup.add(newstone);
        
    }
    stonegroup.position.x = x;
    stonegroup.position.z = y;
    
    this.group.add(stonegroup);
}

THREE.Fall.prototype.makeStone = function() {
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
     
    var extrudeSettings = { 
        amount: 1,
        bevelEnabled: true, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
       bevelThickness: 1 };


    var stonegeo = new THREE.ExtrudeGeometry( stonesp, extrudeSettings );
    
    
    return stonegeo;
}