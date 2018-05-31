THREE.Winter = function (x = 0, y = 0, z = 0, size = 30) {
    this.type = "winter";
    this.group = new THREE.Group();

    this.position = {x, y, z};
    this.size = size;
    this.height = 60;

    // 粒子系统（雪）
    this.particle = new Particle(this.position, size, this.height);
    this.group.add(this.particle.particleSystem);
}

THREE.Winter.prototype.update = function () {
    this.particle.update();
}

function Particle(center, size, height) {
    // center 指粒子系统中心，size 为范围
    this.particleCount = 2000;
    this.particles = new THREE.Geometry();
    this.center = center;
    this.size = size;
    this.height = height;

    var texture = new THREE.TextureLoader().load( "https://raw.githubusercontent.com/lonelyhope/img/master/imgfile/snowflake-27-64.png" );
    var pMaterial = new THREE.PointsMaterial({
            size: 0.5,
            map: texture,
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
    // scene.add(particleSystem); 
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