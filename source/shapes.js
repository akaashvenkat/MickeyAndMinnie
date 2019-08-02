window.Windmill = window.classes.Windmill = class Windmill extends Shape
{ constructor( num_blades )
    { super("positions", "normals", "texture_coords");
      for( var i = 0; i < num_blades; i++ )
        {
            var spin = Mat4.rotation( i * 2*Math.PI/num_blades, Vec.of( 0, 1, 0 ) );
            var newPoint  = spin.times( Vec.of( 1, 0, 0 ).to4(1) ).to3();
            this.positions.push( newPoint, newPoint.plus( [ 0, 1, 0 ] ), Vec.of( 0, 0, 0 )            );
            var newNormal = spin.times( Vec.of( 0, 0, 1 ).to4(0) ).to3();
            this.normals       .push( newNormal, newNormal, newNormal             );
            this.texture_coords.push( ...Vec.cast( [ 0, 0 ], [ 0, 1 ], [ 1, 0 ] ) );
            this.indices       .push( 3*i, 3*i + 1, 3*i + 2                       );
        }
    }
}


window.Square = window.classes.Square = class Square extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

window.Circle = window.classes.Circle = class Circle extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0.5, 0.5], [1, 0.5]));

        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 0]));
            this.normals.push(...Vec.cast(  [0,    0,    1]));
            this.texture_coords.push(...Vec.cast([(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                0, id - 1, id);
        }
    }
}

window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast(
            [-1,  1, -1], [-1, -1, -1], [ 1,  1, -1], [ 1, -1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [-1,  1,  1], [ 1,  1,  1], [-1,  1, -1], [ 1,  1, -1],
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1, -1], [ 1, -1,  1], [ 1,  1, -1], [ 1,  1,  1]
        ));

        this.texture_coords.push(...Vec.cast(
            [0,    2/3], [0.25, 2/3], [0,    1/3], [0.25, 1/3],
            [0.5,  2/3], [0.5,  1/3], [0.75, 2/3], [0.75, 1/3],
            [0.75, 2/3], [0.75, 1/3], [1,    2/3], [1,    1/3],
            [0.25, 2/3], [0.25, 1/3], [0.5,  2/3], [0.5,  1/3],
            [0.25, 2/3], [0.5,  2/3], [0.25, 1  ], [0.5,  1  ],
            [0.25, 1/3], [0.5,  1/3], [0.25, 0  ], [0.5,  0  ]
        ));

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  0, -1]),
            ...Array(4).fill([ 0,  0,  1]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-1,  0,  0]),
            ...Array(4).fill([ 1,  0,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );
    }
}


window.SimpleCube = window.classes.SimpleCube = class SimpleCube extends Shape {
    constructor() {
      super( "positions", "normals", "texture_coords" );
      for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ ) {
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
      }
    }
}

window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords");
        const s3 = Math.sqrt(3) / 4,
            v1 = Vec.of(Math.sqrt(8/9), -1/3, 0),
            v2 = Vec.of(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)),
            v3 = Vec.of(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)),
            v4 = Vec.of(0, 1, 0);

        this.positions.push(...Vec.cast(
            v1, v2, v3,
            v1, v3, v4,
            v1, v2, v4,
            v2, v3, v4));

        this.normals.push(...Vec.cast(
            ...Array(3).fill(v1.plus(v2).plus(v3).normalized()),
            ...Array(3).fill(v1.plus(v3).plus(v4).normalized()),
            ...Array(3).fill(v1.plus(v2).plus(v4).normalized()),
            ...Array(3).fill(v2.plus(v3).plus(v4).normalized())));

        this.texture_coords.push(...Vec.cast(
            [0.25, s3], [0.75, s3], [0.5, 0],
            [0.25, s3], [0.5,  0 ], [0,   0],
            [0.25, s3], [0.75, s3], [0.5, 2 * s3],
            [0.75, s3], [0.5,  0 ], [1,   0]));

        this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
    }
}

window.Cylinder = window.classes.Cylinder = class Cylinder extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 1], [1, 0, -1]));
        this.normals.push(...Vec.cast(  [1, 0, 0], [1, 0,  0]));
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for (let i = 0; i < sections; ++i) {
            const ratio = (i + 1) / sections,
                angle = 2 * Math.PI * ratio,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = 2 * i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 1], [v[0], v[1], -1]));
            this.normals.push(...Vec.cast(  [v[0], v[1], 0], [v[0], v[1],  0]));
            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);
        }
    }
}

window.Grass = window.classes.Grass = class Grass extends Shape {
    constructor(sections) {
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
        //this.indices.push(0,2,3,   3,1,0);

        var angle = curve_increment;
        var norm_angle = curve_increment/2;
        var x = 0;
        var y = 0;
        var z = 0;
        var taper = this.width * 0.4 / (this.segments/3);
        for(var i = 0; i < this.segments; i++) {
            y += segment_length*Math.cos(angle);
            z -= segment_length*Math.sin(angle);
            norm_angle += curve_increment;

            if(this.segments - i - 1 < this.segments/3) {
                this.positions.push(...Vec.cast(
                    [this.width * -0.1 + x - taper * (this.segments - i - 1), y, z],
                    [this.width * 0.1 + x + taper * (this.segments - i - 1), y, z],
                ));
            } else {
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

window.Cone = window.classes.Cone = class Cone extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([1, 0.5]));

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            this.positions.push(...Vec.cast(t, v));
            this.normals.push(...Vec.cast(
                v.mix(this.positions[id - 1], 0.5).plus(t).normalized(),
                v.plus(t).normalized()));
            this.texture_coords.push(...Vec.cast([0.5, 0.5], [(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                id - 1, id, id + 1);
        }
    }
}

window.Hill = window.classes.Hill = class Hill extends Shape{
    constructor() {
        super("positions", "normals", "texture_coords");

        var subdivisions = 15;
        var sub_size = 2/(subdivisions-1);

        for(var i = 0; i < subdivisions; i++) {
            var offset = (i/(subdivisions - 1)) * Math.PI;
            var h = Math.sin(offset) + 0.1;
            this.positions.push(...Vec.cast([sub_size*i - 1, -0.5, 0], [sub_size*i - 1, h, 0]));
            this.normals.push(...Vec.cast([0, 0, 1],[0, 0, 1]));
            this.texture_coords.push(...Vec.cast([i/(subdivisions-1), 0],[i/(subdivisions-1), (h+0.5)/1.6]));
            if(i != subdivisions - 1) {
                this.indices.push(2*i, 2*(i+1), 2*i + 1,    2*i + 1, 2*(i+1), 2*(i+1) + 1);
            }
        }
    }
}

window.Branch = window.classes.Branch = class Branch extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        var offset = 0;
        var coef = Math.PI;
        var amp = 2;
        var subdivisions = 8;


        let t = Vec.of(0, 0, 1);
        for (let i = 0; i <= sections; i++) {
            const angle = 2 * Math.PI * (i) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            for(var l = 0; l < subdivisions; l++) {
                this.positions.push(v.mix(t, l/subdivisions).plus(Vec.of(0, amp*Math.cos(coef*(l/subdivisions) + offset) - amp, 0)));
                if(l != 0) {
                    if(i == sections) {
                        //this.indices.push(i*subdivisions+l-1,i*subdivisions+l,l-1,     l-1, i*subdivisions+l,l);
                    } else {
                        this.indices.push(i*subdivisions+l-1,i*subdivisions+l,(i+1)*subdivisions+l-1 ,(i+1)*subdivisions+l-1, i*subdivisions+l, (i+1)*subdivisions+l);
                    }
                }

                //this.texture_coords.push([(Math.cos(angle) * (subdivisions - l)/subdivisions)/2 + .5, (Math.sin(angle) * (subdivisions - l)/subdivisions)/2 + .5]);
                this.texture_coords.push([i/sections, l/(subdivisions - 1)]);

            }


            this.normals.push(...Array(subdivisions).fill(Vec.of(Math.cos(angle), Math.sin(angle),1).normalized()));


        }
    }
}

// This Shape defines a Sphere surface, with nice (mostly) uniform triangles.  A subdivision surface
// (see) Wikipedia article on those) is initially simple, then builds itself into a more and more
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of
// some desired mathematical surface by projecting each new point onto that surface's known
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
window.Subdivision_Sphere = window.classes.Subdivision_Sphere = class Subdivision_Sphere extends Shape {
    constructor(max_subdivisions) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}
