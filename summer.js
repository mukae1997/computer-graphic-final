THREE.Summer = function(){
    
    this.type = "summer";
    this.group = new THREE.Group();
    
    this.scene = null;
    
    this.forestobj = null;
        
}

THREE.Summer.prototype.addObjs = function(scene){
    this.scene = scene;
    this.loadforest(()=>{
        this.addForest(0,0,0.08);
    });			 
}

/////////////////////////////////////////////////




THREE.Summer.prototype.loadforest = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/Small_Tropical_Island/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'Small_Tropical_Island.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'Small_Tropical_Island.obj', function ( object ) {
            
            self.forestobj = object;
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addForest = function(x = 0, z = 0, scaley = -1) {
    // add forest obj to scene
    if(!this.forestobj) return;
    var object = this.forestobj.clone();
    var self = this;
    object.position.set(x, 1, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley * THREE.Math.randFloat(0.05, 0.09));
    }

    self.group.add(object);
}







    
    
