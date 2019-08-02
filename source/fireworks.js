class Firework
{
    //origin: starting point of firework
    //particle: the object to be used for particles
    //particle_size: how the object should be scaled after displacement transformations
    //particle_decay: how should the particle disintegrate (I used Vec.of(0.96, 0.96, 0.96))
    //height: how high the firework should go before exploding
    //material: material applied to particles
    //explosion_velocity: how fast should the particles explode out
    //gravity: how fast do you want the particles to fall?
    constructor(origin, particle, particle_size, particle_decay, height, material, explosion_velocity, gravity, mat2)
    {
        this.gravity = gravity;
        this.origin = Mat4.translation(origin);
        this.particle = particle;
        this.particle_size = particle_size;
        this.particle_decay = particle_decay;
        this.height = height;
        this.material = material;
        this.velocity = Math.sqrt(-2 * this.gravity[1] * this.height);
        this.exploded = false;
        this.particles = [];
        this.mat2 = mat2;
        this.explosion_velocity = explosion_velocity;
        this.particles.push(new Particle(this.origin, Vec.of(0, this.velocity, 0), particle, particle_size, this.gravity, material, null, mat2));
    }

    tick(graphics_state)
    {
        if(this.exploded)
        {
            for(var i = 0; i < this.particles.length; i++)
            {
                var elem = this.particles[i];
                elem.tick(graphics_state);
                if(elem.scale[0][0] < 0.05)
                {
                    this.particles.splice(i, 1);
                    i--
                }
            }
        }
        else
        {
            var vel = this.particles[0].get_velocity();
            if(vel[1] > 0)
            {
                this.particles[0].tick(graphics_state);
            }
            else
            {
                this.particles.pop();
                this.exploded = true;
                var a = Vec.of(0, 0, -1);
                var b = Vec.of(0, .9428, .3333);
                var c = Vec.of(-.8165, -.4714, .3333);
                var d = Vec.of(.8165, -.4714, .3333);
                this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), a.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2));
                this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), b.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2));
                this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), d.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2));
                this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), c.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2));
                this.subdivide(0, 1, 2, 2);
                this.subdivide(0, 2, 3, 2);
                this.subdivide(1, 2, 3, 2);
                this.subdivide(0, 1, 3, 2);
            }
        }
    }

    // borrow the subdivision code from shapes.js to create geodesic spheres
    subdivide(a, b, c, count)
    {
        if (count == 0)
        {
            return;
        }
        else
        {
            var abv = this.particles[a].velocity.mix(this.particles[b].velocity, 0.5).normalized();
            var bcv = this.particles[b].velocity.mix(this.particles[c].velocity, 0.5).normalized();
            var acv = this.particles[a].velocity.mix(this.particles[c].velocity, 0.5).normalized();

            var ab = this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), abv.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2)) - 1;
            var bc = this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), bcv.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2)) - 1;
            var ac = this.particles.push(new Particle(this.origin.times(Mat4.translation(Vec.of(0, this.height, 0))), acv.times(this.explosion_velocity), this.particle, this.particle_size, this.gravity, this.material, this.particle_decay, this.mat2)) - 1;

            this.subdivide(a, ab, ac, count - 1);
            this.subdivide(b, ab, bc, count - 1);
            this.subdivide(c, ac, bc, count - 1);
            this.subdivide(bc, ab, ac, count - 1);
        }
    }
}

class Emitter
{
    constructor(position, material, emitter_rate, emitter_variability, emitter_direction, emitter_box, emitter_fray, particle, size, growth, ttl)
    {
        this.position = position;
        this.material = material;
        this.emitter_rate = emitter_rate;
        this.emitter_variability = emitter_variability;
        this.emitter_direction = emitter_direction;
        this.emitter_box = emitter_box;
        this.emitter_fray = emitter_fray;
        this.ttl = ttl;
        this.growth = growth;
        this.particle = particle;
        this.count = 0;
        this.size = Mat4.scale(size, size, size);
        this.particles = [];
    }

    tick(graphics_state)
    {
        if(this.emitter_rate >= 1)
        {
            var num_part = Math.random()*this.emitter_variability + (this.emitter_rate - this.emitter_variability/2);
        }
        else
        {
            this.count+= this.emitter_rate;
            if(this.count % 1 == 0)
            {
                var num_part = 1;
            }
        }
        for(var i = 0; i < num_part; i++)
        {
            var variance_v = Math.random() - 0.5;
            var delta_v = this.emitter_fray.times(variance_v);
            var vel = this.emitter_direction.plus(delta_v);
            var variance_p = Math.random() - 0.5;
            var delta_p = this.emitter_box.times(variance_p);
            var pos = this.position.plus(delta_p);
            this.particles.push(new ShaderParticle(Mat4.translation(pos), vel, this.material, this.particle, this.size, Mat4.scale(Vec.of(this.growth, this.growth, this.growth)), this.ttl));
        }
        for(var i = 0; i < this.particles.length; i++)
        {
            if(this.particles[i].lifespan > this.ttl)
            {
                delete this.particles[i];
                this.particles.splice(i, 1);
                i--;
            }
            else
            {
                this.particles[i].tick(graphics_state);
            }
        }
    }
}

class ShaderParticle
{
    constructor(position, velocity, material, particle, size, growth, ttl)
    {
        this.position = position;
        this.growth = growth;
        this.velocity = velocity;
        this.material = material;
        this.particle = particle;
        this.size = size;
        this.lifespan = 0;
        this.opacity_delta = 1/ttl;
    }

    tick(graphics_state)
    {
        var camera_pos = graphics_state.camera_transform;
        var camera = Vec.of(-camera_pos[0][3], -camera_pos[1][3], -camera_pos[2][3]);
        var p = Vec.of(this.position[0][3], this.position[1][3], this.position[2][3]);
        var c = p.minus(camera).normalized();
        var phi = Math.asin(c[1]);
        var theta = Math.asin(c[0]/Math.cos(phi));
        var roty = Mat4. rotation(-theta, Vec.of(0, 1, 0));
        var rotx = Mat4.rotation(phi, Vec.of(1, 0, 0));

        this.particle.draw(graphics_state, this.position.times(roty).times(rotx).times(this.size), this.material);
        this.position = this.position.times(Mat4.translation(this.velocity));
        this.lifespan++;
        this.material = this.material.override({ opacity: 1 - this.lifespan * this.opacity_delta });
        this.size = this.size.times(this.growth);
    }

    get_lifespan()
    {
        return this.lifespan;
    }
}

class Particle
{
    // scale: how to scale the particle from its original size
    // shrink: set of compounding transformations applied over time
    constructor(initial_position, initial_velocity, geometry, scale, gravity, material, shrink, mat2)
    {
        this.material = material;
        if (shrink != null) this.shrink = Mat4.scale(shrink);
        else this.shrink = null;
        this.gravity = gravity;
        this.scale = Mat4.scale(scale);
        this.geometry = geometry;
        this.position = initial_position;
        this.velocity = initial_velocity;
        var pos = Vec.of(this.position[0][3], this.position[1][3], this.position[2][3]);
        this.emitter = new Emitter(pos, mat2, 1, 0, Vec.of(0, 0, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0), geometry, 0.2, 1, 10);
    }

    tick(graphics_state)
    {
        if (this.shrink != null) this.scale = this.scale.times(this.shrink)
        this.geometry.draw(graphics_state, this.position.times(this.scale), this.material);
        this.emitter.tick(graphics_state);
        this.position = this.position.times(Mat4.translation(this.velocity));
        this.velocity = this.velocity.plus(this.gravity);
        var pos = Vec.of(this.position[0][3], this.position[1][3], this.position[2][3]);
        this.emitter.position = pos;
    }

    get_velocity()
    {
        return this.velocity;
    }
}
