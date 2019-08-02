window.Grass = window.classes.Grass = class Grass extends Shape
{
    constructor(sections)
    {
        super("positions", "normals", "texture_coords");

        this.curve = Math.PI/4;
        this.width = 1;
        this.thickness = 0.1;
        this.length = 10;
        this.segments = sections;
        var curve_increment = this.curve/this.segments;
        var vert_text_inc = 1/this.segments;
        var large_h_text_inc = this.width/(2 * (this.width + this.thickness));
        var small_h_text_inc = this.thickness/(2 * (this.width + this.thickness));
        var segment_length = this.length / this.segments;
        this.positions.push(...Vec.cast([this.width/-2, 0, 0], [this.width/2, 0, 0]));
        this.normals.push(...Vec.cast([0, 0, 1],[0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0, 0],[1, 0]));

        var angle = curve_increment;
        var norm_angle = curve_increment/2;
        var x = 0;
        var y = 0;
        var z = 0;
        var taper = this.width * 0.4 / (this.segments/3);
        for (var i = 0; i < this.segments; i++)
        {
            y += segment_length*Math.cos(angle);
            z -= segment_length*Math.sin(angle);
            norm_angle += curve_increment;

            if(this.segments - i - 1 < this.segments/3)
            {
                this.positions.push(...Vec.cast(
                    [this.width * -0.1 + x - taper * (this.segments - i - 1), y, z],
                    [this.width * 0.1 + x + taper * (this.segments - i - 1), y, z],
                ));
            } else
            {
                this.positions.push(...Vec.cast(
                    [this.width/-2 + x, y, z],
                    [this.width/2 + x, y, z],
                ));
            }
            this.normals.push(...Vec.cast(
                    [0, Math.sin(norm_angle), Math.cos(norm_angle)],
                    [0, Math.sin(norm_angle), Math.cos(norm_angle)],
            ));
            this.texture_coords.push(...Vec.cast(
                [0, vert_text_inc * (i + 1)],
                [1, vert_text_inc * (i + 1)]
            ));
            var l = this.positions.length - 1;
            angle += curve_increment;
            this.indices.push(l-3,l-2,l-1,   l-2,l,l-1);
        }
    }
}

window.Hill = window.classes.Hill = class Hill extends Shape
{
    constructor()
    {
        super("positions", "normals", "texture_coords");

        var subdivisions = 15;
        var sub_size = 2/(subdivisions-1);

        for (var i = 0; i < subdivisions; i++)
        {
            var offset = (i/(subdivisions - 1)) * Math.PI;
            var h = Math.sin(offset) + 0.1;
            this.positions.push(...Vec.cast([sub_size*i - 1, -0.5, 0], [sub_size*i - 1, h, 0]));
            this.normals.push(...Vec.cast([0, 0, 1],[0, 0, 1]));
            this.texture_coords.push(...Vec.cast([i/(subdivisions-1), 0],[i/(subdivisions-1), (h+0.5)/1.6]));
            if (i != subdivisions - 1)
            {
                this.indices.push(2*i, 2*(i+1), 2*i + 1,    2*i + 1, 2*(i+1), 2*(i+1) + 1);
            }
        }
    }
}

window.Branch = window.classes.Branch = class Branch extends Shape
{
    constructor (sections)
    {
        super("positions", "normals", "texture_coords");

        var offset = 0;
        var coef = Math.PI;
        var amp = 2;
        var subdivisions = 8;

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i <= sections; i++)
        {
            const angle = 2 * Math.PI * (i) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            for (var l = 0; l < subdivisions; l++)
            {
                this.positions.push(v.mix(t, l/subdivisions).plus(Vec.of(0, amp*Math.cos(coef*(l/subdivisions) + offset) - amp, 0)));
                if (l != 0)
                {
                    if (i == sections)
                    {
                    }
                    else
                    {
                        this.indices.push(i*subdivisions+l-1,i*subdivisions+l,(i+1)*subdivisions+l-1 ,(i+1)*subdivisions+l-1, i*subdivisions+l, (i+1)*subdivisions+l);
                    }
                }
                this.texture_coords.push([i/sections, l/(subdivisions - 1)]);
            }
            this.normals.push(...Array(subdivisions).fill(Vec.of(Math.cos(angle), Math.sin(angle),1).normalized()));
        }
    }
}

//helper class for Tears - not meant to be used inside display()
class Drop {
    constructor(xstart, ystart, zstart, scale, yground = -10) {
        this.scale = Mat4.scale(scale);
        this.position = Mat4.translation(Vec.of(xstart, ystart, zstart));
        this.ground = yground;
        this.errorconst = .01;
        this.ystart = ystart;
    }
    
    drawdrop(graphics_state, offset, geometry, material, rotation) {
        //NOTE: the following line has been changed to fix the bug
        //previously was: let m = Mat4.rotation(rotation, Vec.of(0, 1, 0)).times(this.position.times(offset)).times(this.scale);
        let m = this.position.times(Mat4.rotation(rotation, Vec.of(0, 1, 0))).times(offset).times(this.scale);
        geometry.draw(graphics_state,
                      m,
                      material);
    }
    
    hashittheground(yoffset) {
        let ydrop = this.ystart + yoffset;
        
        //if the drop is near/on the ground
        //note: the *10 is there because a large error constant is needed - so large that the collision detection
        //will not be accurate. The *10 allows me to make the errorconst smaller, but I end up sacrificing
        //accuracy for collisions that come from the below the ground. But we don't have anything below the
        //ground, so this tradeoff is okay
        if ( (ydrop < (this.ground + this.errorconst)) && (ydrop > (this.ground - this.errorconst*100))) {
            return true;
        }
        return false;
    }
}



class Tears {
    //Required parameters:
    //  xstart, ystart, zstart: the starting coordintates (where you want the tears to be coming from)
    
    //Optional parameters:
    //  size: size multiplier for each tear
    //  spacing: how far apart the tears are
    constructor(xstart, ystart, zstart, size, spacing) {
        this.tears1 = new Array(10);
        let i = 0;
        for (i = 0; i < 9; i = i + 2) {
            this.tears1[i] = new Drop(xstart, ystart, zstart, Vec.of(size, size, size));
            this.tears1[i+1] = new Drop(xstart, ystart, zstart, Vec.of(size, 2*size, size));
        }
        this.tears2 = new Array(10);
        for (i = 0; i < 9; i = i + 2) {
            this.tears2[i] = new Drop(xstart, ystart, zstart, Vec.of(size, size, size));
            this.tears2[i+1] = new Drop(xstart, ystart, zstart, Vec.of(size, 2*size, size));
        }
        this.tears3 = new Array(10);
        for (i = 0; i < 9; i = i + 2) {
            this.tears3[i] = new Drop(xstart, ystart, zstart, Vec.of(size, size, size));
            this.tears3[i+1] = new Drop(xstart, ystart, zstart, Vec.of(size, 2*size, size));
        }
        
        this.show = new Array(10);
        for (i = 0; i < 10; i++) {
            this.show[i] = false;
        }
        
        this.lifestart1 = new Array(10);
        for (i = 0; i < 10; i++) {
            this.lifestart1[i] = -((spacing/10) * i);
        }
        
    }
    
    //Use this function to draw the tears
    //A single Tears variable will create three streams of tears from its single staring point
    //
    //Required parameters:
    //  graphics_state: just graphics_state
    //  distance: distance the tears fall before respawning at starting point
    //  geometry: intended to always pass this.shapes.ball
    //  material: intended to always pass this.water
    //
    //Optional parameters:
    //  rotation: anlge of rotation around the y axis (in radians). Currently, the tears fall towards the right
    //of the screen. So a rotation of Math.PI would make the tears fall to the left.
    //  lifetime: how long the tears live before respawning at the starting point. Increasing this increases
    //falling speed.
    //  curve: how far out the tears go. Increasing this would make curve of the tears' path more obvious.
    cry(graphics_state, distance, geometry, material, rotation = 2, lifetime = 1000, curve = 5) {
        let i = 0;
        for (i = 0; i < 10; i++) {
            if ((graphics_state.animation_time - this.lifestart1[i]) > lifetime) {
                this.lifestart1[i] = graphics_state.animation_time;
                this.show[i] = true;
            }
            let toffset = (graphics_state.animation_time - this.lifestart1[i])/lifetime;
            let invt = 1 - toffset;
            let yoffset = -distance*toffset*toffset;
            let point = Mat4.translation(Vec.of((2*curve*toffset*invt + curve*toffset*toffset), yoffset, 0));
            if (this.tears1[i].hashittheground(yoffset)) {
                this.show[i] = false;
            }
            else if (this.show[i] == true) {
                this.tears1[i].drawdrop(graphics_state, point, geometry, material, rotation + Math.PI/3);
                this.tears2[i].drawdrop(graphics_state, point, geometry, material, rotation);
                this.tears3[i].drawdrop(graphics_state, point, geometry, material, rotation - Math.PI/3);
            }
        }
    }
}
