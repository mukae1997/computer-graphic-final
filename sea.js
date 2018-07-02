THREE.Sea = function (x=0,y=0) {
    this.sea = null;
    this.group = new THREE.Group();
    this.mirrorCamera = null;
    this.mirrorTexture = new THREE.WebGLRenderTarget( 512,   512, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false
});
    this.textureMatrix = new THREE.Matrix4();
    
    
    
    
    
}
THREE.Sea.prototype.init = function(camera) {
    this.mirrorCamera = camera.clone();
    
    
    
    
    this.seaGeo = new THREE.PlaneGeometry( 700, 700, 50, 50);
//    console.log(seaGeo);
    
    this.updateSeaGeo();
    
    var seaMat = new THREE.MeshPhongMaterial( { 
        color: 0xffffff, 
        specular: 0x050505,
        map: THREE.ImageUtils.loadTexture('imgs/sea.jpg')
        , transparent: true  
    } );
    seaMat.color.setHSL( +201/360, 0.72, 0.45 );
    
    this.uniforms = {
//			time: { type: "f", value: 1.0 },
//			resolution: { type: "v2", value: new THREE.Vector2() },
        theTexture: {type: 't', value: THREE.ImageUtils.loadTexture('imgs/sea.jpg')},
        viewPos: {
            type:"v3", value: camera.position
        },
        ilightPos: {
            type:"v3", value: undefined
        },
        transform: {
            type: "m4", value: new THREE.Matrix4()
        },
        mirrorSampler: { 
            type: 't', 
            value: this.mirrorTexture.texture 
        },
        textureMatrix : {
            type: "m4", value: this.textureMatrix 
        },
        iState:{
            type:'f',
            value: 0.0
        },
        normalSampler: {
            type: 't',
            value: new THREE.TextureLoader().load( 'imgs/seanorm.jpg', function ( texture ) {
							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                
		    })
        }
        
    };
    
    
    
    this.mirrormat = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });
    
    

    
    this.sea = new THREE.Mesh( this.seaGeo, this.mirrormat );
    
    this.sea.lightpos = new THREE.Vector3(650.0,38.0,950.0);
    this.uniforms.ilightPos.value = this.sea.lightpos;
    
    this.sea.rotation.x = -Math.PI/2;
    
    
    // 应用mesh的变换
    this.uniforms.transform.value = this.sea.matrixWorld;
    this.uniforms.transform.needsUpdate = true; 
    this.uniforms.viewPos = camera.position;
    
    this.group.add(this.sea);
    
}

THREE.Sea.prototype.update = function (render, scene, camera, state) {
    
    
    
    this.updateSeaGeo();
    this.updateTexture(camera);
    
    this.sea.visible = false;
    renderer.render( scene, this.mirrorCamera, this.mirrorTexture, true );
    
    
    this.uniforms.mirrorSampler.value = this.mirrorTexture.texture;
    this.uniforms.mirrorSampler.needsUpdate = true;
    
    this.uniforms.iState = state;
    this.uniforms.iState.needsUpdate  = true;
    
    
    
    this.sea.matrixNeedsUpdate = true;
    this.sea.visible = true;
      
}
THREE.Sea.prototype.updateSeaGeo = function (){
    var seapos = this.seaGeo.vertices;
    var dt = new Date();
    
     // Properties
    var octaves = 4;
    var lacunarity = 2.0;
    var gain = 0.5;
    //
    // Initial values
    var amplitude = 5;
    var frequency = 0.1;
    
    
    for (var j = 0; j < 50; j++){
        for (var i = 0; i < 50; i++) {
            //
            // Loop of octaves
            var x = seapos[j*50+i].x;
//            var y;
//            for (var k = 0; k < octaves; k++) {
//                y += amplitude * perlin.noise(frequency*x,frequency*x,frequency*x);
//                frequency *= lacunarity;
//                amplitude *= gain; 
//            
//            }
//               console.log(perlin.noise(frequency*x,frequency*x,frequency*x))
            
            seapos[j*50+i].z = 2.0 * THREE.Math.mapLinear(Math.sin(j + dt.getTime() * 0.003) + Math.cos(j%50*2 + dt.getTime() * 0.002) + Math.cos(seapos[i].x + dt.getTime() * 0.002), -2, 3, -2, 1);
//            seapos[j*50+i].z = y;
            
            
    //        seapos[i].y = Math.sin(dt.getTime());
        }
    }
    
    this.seaGeo.verticesNeedUpdate = true;
}

THREE.Sea.prototype.updateTexture = function(camera){
    
//    sea.updateMatrixWorld();
//    camera.updateMatrixWorld();
    
    var camrot = new THREE.Matrix4();
    camrot.extractRotation(camera.matrixWorld);
    
    var searot = new THREE.Matrix4();
    searot.extractRotation(this.sea.matrixWorld);   
    
    var seanorm = new THREE.Vector3(0,0,1);
    seanorm.applyMatrix4(searot);
//    console.log(seanorm)
    
    // calculate view position
    var mirworldpos = new THREE.Vector3();
	var camworldpos = new THREE.Vector3();
    var seaworldpos = new THREE.Vector3();
    seaworldpos.setFromMatrixPosition(this.sea.matrixWorld);
    camworldpos.setFromMatrixPosition(camera.matrixWorld);
    
    var seedir = seaworldpos.clone().sub(camworldpos); 
    if (seedir.dot(seanorm) <= 0) {
        mirworldpos = seedir.reflect(seanorm).negate();  
//        console.log(camworldpos, mirworldpos)
		mirworldpos.add( seaworldpos );


        
        // calculate lookat vector
        
        var camtarget = new THREE.Vector3(0,0,-1); // 这是默认值吗？
        camtarget.applyMatrix4( camrot );
        camtarget.add( camworldpos ); // ?? 
        
        var temptarget = seaworldpos.clone().sub(camtarget);
//        mirrortarget.subVectors( seaworldpos, camtarget );
        var mirrortarget = temptarget.reflect( seanorm ).negate();
        mirrortarget.add( seaworldpos );
        
        
        // calculate up vector
//        var camup = camera.up.clone().applyMatrix4(camrot);
//        var mirrorup = new THREE.Vector3(0,1,0);
//        mirrorup.applyMatrix4( camrot );
//        mirrorup.reflect( seanorm );	
        
        
        // stemkoski:
        var tempup = new THREE.Vector3(0,-1,0);
        tempup.applyMatrix4(camrot);
        var mirrorup = tempup.reflect(seanorm);

        
        
        this.mirrorCamera.position.copy(mirworldpos);
        this.mirrorCamera.up = mirrorup.clone();
        this.mirrorCamera.lookAt(mirrortarget);	
        
        

		this.mirrorCamera.far = camera.far; // Used in WebGLBackground


        this.mirrorCamera.updateProjectionMatrix();
        this.mirrorCamera.updateMatrixWorld();  this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);
    //    console.log( camera.rotation )
        
    }
    this.uniforms.viewPos.value = camworldpos;
    this.uniforms.viewPos.needsUpdate = true;
    
    // Update the texture matrix
    this.textureMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
    ); // clipspace(0,1) to normal device(-1,1)
    this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
//    textureMatrix.multiply( mirrorCamera.normalMatrix );
    this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );
    
    this.uniforms.textureMatrix.value = this.textureMatrix;
    this.uniforms.textureMatrix.needsUpdate = true;
    
}