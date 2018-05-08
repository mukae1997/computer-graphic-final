THREE.Spring = function(){
    
    this.type = "spring";
    this.group = new THREE.Group();
}

THREE.Spring.prototype.addObjs = function(){
    this.addObjTree();
//    this.addGrass();
    
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

            object.position.y = 0;
            object.position.x = 0;
            object.position.z = 0;
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

THREE.Spring.prototype.addGrass = () => {
    var h = 3;
    var l = 8;
    var grasspln = new THREE.PlaneGeometry(l,h);
//    var grassmat = new THREE.
    grass.rotation.x = Math.PI / 2;
}