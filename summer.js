THREE.Summer = function() {
    
    this.type = "summer";
    this.group = new THREE.Group();
    
    this.scene = null;
    
    this.littlepalm = null;
    this.palmobj = null;

    this.beachchairobj = null;
    this.umbrellaobj = null;

    // this.mixers = [];
    
    this.bonfireobj = null;
}

THREE.Summer.prototype.addObjs = function(scene) {
    this.scene = scene;
    this.loadlittlepalm(() => {
        this.addlittlepalm(2, 13, -Math.PI/4, 2.2);
        this.addlittlepalm(-2, 8, Math.PI/6, 1.8);
        this.addlittlepalm(-8, 1, -Math.PI/8, 2.4);
        this.addlittlepalm(-5, -10, Math.PI/4, 2);
        this.addlittlepalm(-20, -6, 1, 2);
        this.addlittlepalm(-14, -3, -Math.PI/2, 2);
        this.addlittlepalm(-17, -9, Math.PI, 2);
    });
    this.loadPalm(() => {
        this.addPalm(-5, 19, -Math.PI/4, 0.15);
        this.addPalm(-15, 18, Math.PI/2, 0.18);
        this.addPalm(-3, 24, 1, 0.12);
        this.addPalm(-13, 10, -Math.PI/9, 0.14);
    });
    this.loadChair(() => {
        this.addChair(8,18, 0.06);
        this.addChair(18,18, 0.06);
    });
    this.loadUmbrella(() => {
        this.addUmbrella(13, 10, 0.08);
    });
    this.loadBonfire(() => {
        this.addBonfire(5, 0, 0.8);
    });
}

/////////////////////////////////////////////////


THREE.Summer.prototype.loadlittlepalm = function(callback) {
    // mtl obj file
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/palm5/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'palm.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'palm.obj', function ( object ) {
            
            self.littlepalm = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
    // 
    // obj file
    //  texture
    // var manager = new THREE.LoadingManager();
    // manager.onProgress = function (item, loaded, total) {
    //     console.log( item, loaded, total );
    // }
    // var textureLoader = new THREE.TextureLoader( manager );
    // var texture = textureLoader.load( 'obj/palm/palm_bark_norm.png' );

    // // model
    // var onProgress = function (xhr) {
    //     if ( xhr.lenghtComputable ) {
    //         var percentComplete = xhr.loaded / xhr.total * 100;
    //         console.log( Math.round(percentComplete, 2) + '% downloaded');
    //     }
    // };

    // var onError = function (xhr) {
    // };

    // var loader = new THREE.OBJLoader( manager );
    // loader.load( 'obj/palm/palm1.obj', function (object) {
    //     // body...
    //     object.traverse( function (child) {
    //         // body...
    //         if (child instanceof THREE.Mesh ) {
    //             child.material.map = texture;
    //         }
    //     });
    //     self.littlepalm = object;
    //     callback();
    // }, onProgress, onError );
}

THREE.Summer.prototype.addlittlepalm = function(x = 0, z = 0, roty = 1, scaley = -1) {
    // add forest obj to scene
    if(!this.littlepalm) return;
    var object = this.littlepalm.clone();
    var self = this;
    object.position.rotation = roty;
    object.position.set(x, -1, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley * THREE.Math.randFloat(0.05, 0.09));
    }

    self.group.add(object);
}


THREE.Summer.prototype.loadPalm = function(callback) {
    // mtl obj file
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/palmobj2/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'palmtree.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'palmtree.obj', function ( object ) {
            
            self.palmobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
    // 
    // 3ds file
    // var tdsloader = new THREE.TDSLoader();
    // tdsloader.setPath( 'obj/palmobj2' );
    // tdsloader.load( 'obj/palmobj2/palmtree.3ds', function( object ) {
    //     this.scene.add(object);
    // };
}

THREE.Summer.prototype.addPalm = function(x = 0, z = 0, roty = 1, scaley = -1) {
    // add palm tree obj to scene
    if(!this.palmobj) return;
    var object = this.palmobj.clone();
    var self = this;
    object.position.rotation = roty;
    object.position.set(x, -1, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 0.05;
        object.scale.setScalar(scaley * THREE.Math.randFloat(0.5, 0.9));
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadChair = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/deckChair/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'deckChair.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'deckChair.obj', function ( object ) {
            
            self.beachchairobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addChair = function(x = 0, z = 0, scaley = -1) {
    // add palm tree obj to scene
    if(!this.beachchairobj) return;
    var object = this.beachchairobj.clone();
    var self = this;
    object.rotation.y = Math.PI;
    object.position.set(x, -0.05, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadUmbrella = function(callback) {
    
    // var fbxloader = new THREE.FBXLoader();
    // // var treept = 'obj/patioUmbrella/';   
    // var self = this;
    // // fbxloader.setPath( treept );
    // fbxloader.load( 'obj/patioUmbrella/Patio_umbrella.fbx', function( object ) {

    //     object.mixer = new THREE.AnimationMixer( object );
    //     mixers.push( object.mixer );

    //     var action = object.mixer.clipAction( object.animations[0] );
    //     action.play();

    //     object.traverse( function (child) {
    //         if (child.isMesh) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //     });

    //     self.umbrellaobj = object;
    //     callback();

    // });
    //     
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/umbrella/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'umbrella.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'umbrella.obj', function ( object ) {
            
            self.umbrellaobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addUmbrella = function(x = 0, z = 0, scaley = -1) {
    // add palm tree obj to scene
    if(!this.umbrellaobj) return;
    var object = this.umbrellaobj.clone();
    var self = this;
    object.position.set(x, -1, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}


THREE.Summer.prototype.loadBonfire = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/bonfire/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'bonfire.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'bonfire.obj', function ( object ) {
            
            self.bonfireobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addBonfire = function(x = 0, z = 0, scaley = -1) {
    // add palm tree obj to scene
    if(!this.bonfireobj) return;
    var object = this.bonfireobj.clone();
    var self = this;
    object.rotation.y = Math.PI;
    object.position.set(x, -0.05, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}
    
    
