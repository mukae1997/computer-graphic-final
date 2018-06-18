var grasstex = THREE.ImageUtils.loadTexture('imgs/fallgrass2.png');
var grasstex2 = THREE.ImageUtils.loadTexture('imgs/grass2.png');
var grasstex3 = THREE.ImageUtils.loadTexture('imgs/grass3.png');
THREE.Fall = function(){
    
    this.type = "Fall";
    this.group = new THREE.Group();
    this.petals = undefined;
    this.petalsgeo = undefined;
    this.basin = undefined;
    this.staticpetals = undefined;
    
    this.scene = null;
    
    this.treeobj = null;
    this.cropobj = null;
    this.mushrommobj = null;

    this.trees = [];
    
}

THREE.Fall.prototype.update = function(){
    this.updatePetals();
}

THREE.Fall.prototype.addObjs = function(scene){
    this.scene = scene;
    this.loadCropobj(() => {
        this.addCrop(10,0,30);
        this.addCrop(11,0,26);
        this.addCrop(12,0,28);
        this.addCrop(13,0,28);
        this.addCrop(10,1,28);
        this.addCrop(11,1,26);
        this.addCrop(12,1,32);
        this.addCrop(13,1,28);
        this.addCrop(10,-1,28);
        this.addCrop(11,-1,26);
        this.addCrop(12,-1,32);
        this.addCrop(13,-1,28);
        this.addCrop(10,-2,28);
        this.addCrop(11,-2,26);
        this.addCrop(12,-2,32);
        this.addCrop(13,-2,28);
        
        
    });
    

    
    this.loadTreeobj(()=>{
        this.addObjTree(0,0,0.3);
        this.addObjTree(0,-30, 0.17);
        this.addObjTree(20,-30, 0.2);
        this.addObjTree(-13,-19, 0.23);
        this.addObjTree(-25, 13, 0.19);
        this.addObjTree(8, -16, 0.17);
         
    });
    
    this.addlight();
    this.addGrass(0, 0, 3, 3);
    this.addGrass(0, -30, 2.5, 2);
    this.addGrass(20, -30, 3, 2);
    this.addGrass(15, -15, 2, 2);
    this.addGrass(-3, -11, 2.5, 2);
    this.addGrass(-5, -13, 2.5, 2);
    this.addGrass(8, -16, 2.5, 2);
    this.addGrass(0, -30, 2.5, 2);
    this.addGrass(14, 8, 2.5, 2);
    this.addGrass(17, 0, 2.5, 2);
    this.addGrass(17, -30, 2.5, 2);
    this.addGrass(0, 0, 3, 3);
    this.addGrass(-12, 16, 3, 2);
    this.addGrass(-23, -23, 3, 2); 
    this.addGrass(-25, 13, 3, 2); 
    this.addGrass(-24, 8, 2.5, 2); 
    this.addGrass(-20,23,2, 2);
    this.addGrass(5, 22, 1.2, 7);
    this.addGrass(3, 20, 1.2, 7);

    this.addStones(6,-30,2,8);
    this.addStones(-25,5,2,8);
    this.addStones(-18,-19,0,8); 
    this.addStones(-22,-22,0,18);
    this.addStones(-24,7,0,4);
    
    this.loadMushroomobj(()=>{
        this.addMushroom(-6,-24);
        this.addMushroom(-5,-23);
        this.addMushroom(-7,-23);
    });

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

        materials.preload();
        
        var mat = materials.materials;
        for (var key in mat) {
            console.log(key);
            mat[key].transparent = true;
            mat[key].alphatest = 0.5;
        }

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



THREE.Fall.prototype.loadMushroomobj = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/StylizedFoliage_OBJ/';   
    var self = this;
    mtlLoader.setPath( treept);
    mtlLoader.load( 'Mushroom_03.mtl', function( materials ) {

        materials.preload();   

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'Mushroom_03.obj', function ( object ) {
            
            self.mushroomobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Fall.prototype.loadCropobj = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/crop/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'VG02_4.mtl', function( materials ) {

        materials.preload();
        
        var mat = materials.materials;
        for (var key in mat) {
            console.log(key);
            mat[key].transparent = true;
            mat[key].alphatest = 0.5;
        }
        
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'VG02_4.obj', function ( object ) {
            
            console.log(object)
            self.cropobj = object;
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
        var x = THREE.Math.randFloatSpread(30) + 3;
        var y = Math.random() * 10 + 2;
        var z = THREE.Math.randFloatSpread(30) + 3;
        vertices.push( x, y, z );
    }
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
    var mat = new THREE.PointsMaterial( { 

        size: 0.8,
        map: petalsprite, 
        depthTest: true, 
        transparent : true,
        side:THREE.DoubleSide,
        alphaTest: 0.5
    } );
    this.petals = new THREE.Points(geometry, mat);
    this.petalsgeo = geometry;
    this.group.add(this.petals);
    
    
    // add static petals on the ground
    var staticgeo = new THREE.BufferGeometry();
    var vtx2 = [];
    for ( i = 0; i < 5000; i ++ ) {
        var theta = Math.random() * Math.PI * 2;
        var r = THREE.Math.randFloat(6,34);
        var x = r * Math.cos(theta) ;
        var y = 1 - Math.random();
        var z = r * Math.sin(theta);
        vtx2.push( x-3, y, z-3 );
    }
    staticgeo.addAttribute( 'position', new THREE.Float32BufferAttribute( vtx2, 3 ) );
    this.staticpetals = new THREE.Points(staticgeo, mat);
    this.group.add(this.staticpetals);
}

THREE.Fall.prototype.addMushroom = function(x=0,z=0,scale=-1,rot=Math.PI/8) {
    
    
    if(!this.mushroomobj) return ;
    var object = this.mushroomobj.clone();
    if (scale != -1) {
        object.scale.setScalar(scale);
    } else {
        object.scale.setScalar(2);
        
    }
    object.position.set(x, 1, z);

    object.rotation.y = rot;
    this.group.add( object );
    
}


THREE.Fall.prototype.addCrop = function(x=0,z=0,scale=-1,rot=0) {
    
    
    if(!this.cropobj) return ;
    var object = this.cropobj.clone();
    if (scale != -1) {
        object.scale.setScalar(scale);
    } else {
        object.scale.setScalar(10);
        
    }
    object.position.set(x, -1, z);

    object.rotation.y = rot;
    this.group.add( object );
    
    

}

THREE.Fall.prototype.addlight = function() {
    
    var pl =  new THREE.DirectionalLight(0xFFF68F, 0.7);
    this.scene.add(pl); 

    pl.position.set(0, 100, 0);
    pl.position.add(this.group.position);
    var hlper = new THREE.PointLightHelper(pl);
    //this.scene.add(hlper);
    
    
    var plstrength = 0.9;
    
    var pl =  new THREE.PointLight(0xf8ffc9, plstrength, 35);
//    pl.castShadow = true;
    this.scene.add(pl); 
    pl.position.set(28, 10 , 11);
    pl.position.add(this.group.position);
    var hlper = new THREE.PointLightHelper(pl);
    //this.scene.add(hlper);

}

THREE.Fall.prototype.addObjTree = function(x = 0, z = 0, scaley = -1) {
    if(!this.treeobj) return ;
    var object = this.treeobj.clone();
    var self = this;
    object.position.y = 0.7;
    object.position.x = x;
    object.position.z = z;

    
    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley * THREE.Math.randFloat(0.5,0.9));
    }
    self.group.add( object );     
}

THREE.Fall.prototype.addGrass = function(posx, posz, _h = 1.5, r = 10) {
    var h = _h;
    var l = 6;
    var grassmap = grasstex;
    if (Math.random() > 0.5) {
        grassmap = grasstex2;
    }
    if (Math.random() > 0.5) {
        grassmap = grasstex3;
        l = 12;
        h = _h*0.9;
    }
    var grasspln = new THREE.PlaneGeometry(l,h);
    var grassmat = new THREE.MeshPhongMaterial( { 
        emissive:0xd23c28,
        emissiveIntensity:0.5,
        specular: 0xbbbbbb,
        map: grassmap
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


THREE.Fall.prototype.addStones = function(x=0,y=0, r=-1,cnt=25) {
    
    if (r == -1) r = this.basin.r2;
    
    
    var rockmap = new THREE.ImageUtils.loadTexture( 'imgs/rock1.jpg' );
    rockmap.wrapS = THREE.RepeatWrapping;
    rockmap.wrapT = THREE.RepeatWrapping; 
    rockmap.repeat.set(1,2);

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