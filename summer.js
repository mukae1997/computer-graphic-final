THREE.Summer = function() {
    
    this.type = "summer";
    this.group = new THREE.Group();
    
    this.scene = null;
    
    // add two type of palm tree
    this.littlepalm = null;
    this.canepalm = null;

    // add beach deckChair
    this.beachchairobj = null;

    // add beach umbrella
    this.umbrellaobj = null;
 
    // add bonfire wood   
    this.bonfireobj = null;

    // add bonfire
    this.fireX = 5;
    this.fireZ = 0;
    this.fireY = -1.5;
    this.size = 0.1;    
    this.bonfire = new Fire(this.fireX, this.fireY, this.fireZ, this.size);

    // add light house
    this.Lighthouseobj = null;

    this.bridgeobj = null;
    this.stairobj = null;
    

    this.shell = null;
    this.starfish = null;    
}

THREE.Summer.prototype.update = function () {
    this.bonfire.update();
}

THREE.Summer.prototype.addObjs = function(scene) {
    this.scene = scene;
    this.loadlittlepalm(() => {
        this.addlittlepalm(2, 13, -Math.PI/4, 2.2);
        this.addlittlepalm(-2, 8, Math.PI/6, 1.8);
        this.addlittlepalm(-8, 1, -Math.PI/8, 2.4);
        this.addlittlepalm(-5, -10, Math.PI/4, 2);
        this.addlittlepalm(-5, -5, 1, 2);
        this.addlittlepalm(-7, 9, -Math.PI/2, 2);
        // this.addlittlepalm(-17, -9, Math.PI, 2);
    });
    this.loadcanepalm(() => {
        this.addcanepalm(8, 32, -Math.PI/4, 0.7);
        this.addcanepalm(18, 32, -Math.PI/4, 0.7);
        this.addcanepalm(5, 32, -Math.PI/4, 0.7);
        this.addcanepalm(13, 32, -Math.PI/4, 0.7);
        this.addcanepalm(25, 32, -Math.PI/4, 0.7);
        this.addcanepalm(8, 32, -Math.PI/4, 0.5);
        this.addcanepalm(18, 28, -Math.PI/4, 0.5);
        this.addcanepalm(5, 28, -Math.PI/4, 0.5);
        this.addcanepalm(13, 28, -Math.PI/4, 0.5);
        this.addcanepalm(25, 28, -Math.PI/4, 0.5);
        this.addcanepalm(3, 15, -Math.PI/4, 0.46);
        this.addcanepalm(-4, 6, -Math.PI/4, 0.52);
        this.addcanepalm(-7, 3, -Math.PI/4, 0.6);
        this.addcanepalm(-4, -8, -Math.PI/4, 0.45);
        this.addcanepalm(-5, 12, -Math.PI/4, 0.53);
        this.addcanepalm(-5, 8, -Math.PI/4, 0.5);
        this.addcanepalm(-5, -5, -Math.PI/4, 0.5);
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
    this.group.add(this.bonfire.fire);
    this.loadhouse(() => {
        this.addLighthouse(-20, -23, 3);
    });
    this.loadbridge(() => {
        this.addbridge(-20, 2, 0.02);
    });
    this.loadstair(() => {
        this.addstair(-19.8, 18, 7.7);
    });
    this.loadShell(() => {
        this.addshell(5, -5, 0.25);
        this.addshell(-5, 1, 0.3);
        this.addshell(8, -3, 0.32);
        this.addshell(10, 4, 0.28);
        this.addshell(0, -12, 0.28);
        this.addshell(-2, -14, 0.28);
        this.addshell(10, -17, 0.28);
    });
    this.loadstarfish(() => {
        this.addstarfish(5, 8, 0.05);
        this.addstarfish(5, 6, 0.03);
        this.addstarfish(15, 2, 0.032);
        this.addstarfish(9, 3, 0.038);
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

            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });

            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
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

THREE.Summer.prototype.loadcanepalm = function(callback) {
    // mtl obj file
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/IvoryCanePalmTree/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'IvoryCanePalmTree.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'IvoryCanePalmTree.obj', function ( object ) {
            
            self.canepalm = object;

            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });

            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addcanepalm = function(x = 0, z = 0, roty = 1, scaley = -1) {
    // add forest obj to scene
    if(!this.canepalm) return;
    var object = this.canepalm.clone();
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
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });
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
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });
            
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
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            })
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
    
// fire and smoke
function Fire(x, y, z, size) {
    this.particleCount = 300;
    this.particles = new THREE.Geometry();
    // console.log("geometry",this.particles);

    var max = 60;

    // var texture = new THREE.TextureLoader().load("imgs/spark.png");
    var material = new THREE.PointsMaterial({
        size:size,
        transparent: true,
        // opacity: 0.8,
        vertexColors: true,
        color: 0xffffff,
        sizeAnnutation: true,
        // map: texture
    });
    // console.log("material", material);

    var range = 100;
    var life = 0;
    for (var i = 0; i < this.particleCount; i++) {

        var particle = new THREE.Vector3(x, y, z);

        particle.life = 0; 

        this.particles.vertices.push(particle);
        // var a = ((max - particle.life) / max) * 0.4;
        // var r = (1-a) * 45 + a * (260 - (particle.life * 2));
        // var g = (1-a) * 20 + a * ((particle.life * 2) + 50);
        // var b = (1-a) * 37 + a * particle.life * 2;
        // var color = new THREE.Color(r/255, g/255, b/255);
        var color = new THREE.Color((260 - (particle.life * 2)) / 255, ((particle.life * 2) + 50) /255, (particle.life * 2)/255, ((max - particle.life) / max) * 0.4);
        this.particles.colors.push(color);
    }
    this.fire = new THREE.Points(this.particles, material);
    // console.log("test summer fire initial", this.particles.vertices[0]);
}
var debug = true;
Fire.prototype.update = function() {
    var speed = 0.2;
    var yspeed = 0.2;
    var max = 60;
    var min = 58;

    var x = 5, y = 0.1, z = 0;

    for (var i = 0; i < this.particleCount; i++) {
        var particle = new THREE.Vector3(x, y, z);
        particle.life = 0;
        particle.speed = speed;
        this.particles.vertices.push(particle);
        var color = new THREE.Color((260 - (particle.life * 2)) / 255, ((particle.life * 2) + 50) /255, (particle.life * 2)/255, ((max - particle.life) / max) * 0.4);
        this.particles.colors.push(color);
    }

    for (var i = 0; i < this.particles.vertices.length; i++) {
        var particle = this.particles.vertices[i];
        // if (i == 0 && debug) {
        //     console.log("get particle", particle);
        // }
        var a = ((max - particle.life) / max);
        var r = (1-a) * 241 + a * (260 - (particle.life * 2));
        var g = (1-a) * 200 + a * ((particle.life * 2) + 50);
        var b = (1-a) * 156 + a * particle.life * 2;
        this.particles.colors[i].setRGB(r / 255, g /255, b /255);      
        // this.particles.colors[i].setRGB((260 - (particle.life * 2)) / 255, ((particle.life * 2) + 50) /255, (particle.life * 2)/255);

        var pspeed = particle.speed;
        var xs = (Math.random() * 2 * pspeed - pspeed)/2;
        var ys = (Math.random() * 2 * yspeed) / 2;
        var zs = (Math.random() * 2 * pspeed - pspeed)/2;
        // if (i == 0 && debug) {
        //     console.log("before update xyz", particle);
        //     console.log("xs", xs);
        //     console.log("ys", ys);
        // }
        particle.x += xs;
        particle.y += ys;
        particle.z += zs;
        particle.life++;
        if (pspeed < 0.35) {
            particle.speed = pspeed + 0.003;
        }

        // if (i == 0 && debug) {

        //     debug = false;
        //     console.log("the number of particles", this.particles.vertices.length);
        // }
        if (particle.life < max && particle.life > min) {
            var random = Math.random();
            if (random > 0.5) {
                this.particles.colors[i].setRGB(0.8705, 0.8715, 0.8798);
                // console.log("x, z", particle.x, particle.z);
            } else {
                this.particles.colors[i].setRGB(0.6505, 0.6515, 0.6598);            
            }
        }
        if ((particle.x > 5.5 && particle.z > 1.5) || (particle.x < 4.5 && particle.z > -0.5)|| (particle.x > 5.5 && particle.z > -0.5)|| (particle.x < 4.5 && particle.z < 1.5)) {
            if (Math.random() > 0.9) {
                this.particles.colors[i].setRGB(0.6505, 0.6515, 0.6598);                
            }
        }
        if (particle.life >= max) {
            this.particles.vertices.splice(i, 1);
            i--;
        }
    }
    this.fire.geometry.verticesNeedUpdate = true;
    this.fire.geometry.colorsNeedUpdate = true;
    // console.log("test summer fire update", this.particles.vertices[0]);
}


THREE.Summer.prototype.loadhouse = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/Lighthouse/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'Lighthouse singly.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'Lighthouse singly.obj', function ( object ) {
            
            self.Lighthouseobj = object;
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            })
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addLighthouse = function(x = 0, z = 0, scaley = -1) {
    // add light house obj to scene
    if(!this.Lighthouseobj) return;
    var object = this.Lighthouseobj.clone();
    var self = this;
    object.rotation.y = Math.PI;
    object.position.set(x, 5, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadbridge = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/Wood Bridge/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'Wood Bridge .mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'Wood Bridge .obj', function ( object ) {
            
            self.bridgeobj = object;
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            })
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addbridge = function(x = 0, z = 0, scaley = -1) {
    // add bridge obj to scene
    if(!this.bridgeobj) return;
    var object = this.bridgeobj.clone();
    var self = this;
    object.rotateY(Math.PI/2);
    object.position.set(x, 1.5, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadstair = function(callback) {
    
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/stair/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'materials.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'model.obj', function ( object ) {
            
            self.stairobj = object;
            object.traverse( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            })
            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addstair = function(x = 0, z = 0, scaley = -1) {
    // add stair obj to scene
    if(!this.stairobj) return;
    var object = this.stairobj.clone();
    var self = this;
    object.rotateY(Math.PI);
    object.position.set(x, 3.5, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadShell = function(callback) {
    // mtl obj file
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/seaShell/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'seaShell2.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'seaShell2.obj', function ( object ) {
            
            self.crabObj = object;

            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addshell = function(x = 0, z = 0, scaley = -1) {
    // add shell obj to scene
    if(!this.crabObj) return;
    var object = this.crabObj.clone();
    var self = this;
    object.position.set(x, 0.3, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}

THREE.Summer.prototype.loadstarfish = function(callback) {
    // mtl obj file
    var mtlLoader = new THREE.MTLLoader();
    var treept = 'obj/starfish/';   
    var self = this;
    mtlLoader.setPath( treept );
    mtlLoader.load( 'starfish.mtl', function( materials ) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( treept );
        objLoader.load( 'starfish.obj', function ( object ) {
            
            self.starfish = object;

            callback();

 
        }, ()=>{}  , ()=>{}  );

    });
}

THREE.Summer.prototype.addstarfish = function(x = 0, z = 0, scaley = -1) {
    // add starfish obj to scene
    if(!this.starfish) return;
    var object = this.starfish.clone();
    var self = this;
    object.position.set(x, 1, z);

    if (scaley != -1) {
        object.scale.setScalar(scaley);
    } else {
        scaley = 1;
        object.scale.setScalar(scaley);
    }

    self.group.add(object);
}
