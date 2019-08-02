class Assignment_Two_Skeleton extends Scene_Component
{
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box)
    {
        super(context, control_box);

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -35]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
        // design.  Once you've told the GPU what the design of a cube is,
        // it would be redundant to tell it again.  You should just re-use
        // the one called "box" more than once in display() to draw
        // multiple cubes.  Don't define more than one blueprint for the
        // same thing here.
        const shapes =
        {
            'square': new Square(),
            'circle': new Circle(15),
            'pyramid': new Tetrahedron(false),
            'simplebox': new SimpleCube(),
            'box': new Cube(),
            'cylinder': new Cylinder(15),
            'cone': new Cone(20),
            'ball': new Subdivision_Sphere(4),
            'ball2': new Subdivision_Sphere(5),
            'grass': new Grass(5),
            'branch': new Branch(20),
            'hill': new Hill(),
            'pedals': new Windmill(20)
        }
        
        this.submit_shapes(context, shapes);
        this.shape_count = Object.keys(shapes).length;

        this.mouse_clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), { ambient: .85, diffusivity: .3 });
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.2, .9, .2, 1), { ambient: .4, diffusivity: .4 });
        this.far1 = context.get_instance(Phong_Shader).material(Color.of(.2, .4, .4, 1), { ambient: 1, diffusivity: 0 });
        this.far2 = context.get_instance(Phong_Shader).material(Color.of(.3, .5, .6, 1), { ambient: 1, diffusivity: 0 });
        this.far3 = context.get_instance(Phong_Shader).material(Color.of(.4, .6, .8, 1), { ambient: 1, diffusivity: 0 });
        
        this.plastic = this.clay.override({ specularity: .6 });
        this.mouse_plastic = this.mouse_clay.override({ specularity: .1 });
        this.texture_base = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, diffusivity: 1, specularity: 0.3 });
        this.water = context.get_instance(Phong_Shader).material(Color.of(.1, .5, .9, 1), { ambient: 1, diffusivity : 0.9, specularity : .9 });
        
        this.green = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, diffusivity: 1, specularity: 0.2, texture: context.get_instance("assets/green.png") });
        this.sky = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, diffusivity: 0.9, specularity: 0.2, texture: context.get_instance("assets/skymap.jpg") });
        this.bark = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), { ambient: 1, diffusivity: 0.8, specularity: 0.2, texture: context.get_instance("assets/treebark.png") });
        
        
        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures =
        {
            square: "assets/butterfly.png",
            box: "assets/even-dice-cubemap.png",
            cylinder: "assets/treebark.png",
            pyramid: "assets/tetrahedron-texture2.png",
            simplebox: "assets/tetrahedron-texture2.png",
            cone: "assets/hypnosis.jpg",
            circle: "assets/hypnosis.jpg",
            open_curtain: "assets/curtains.jpeg",
        };
        for (let t in shape_textures)
        {
            this.shape_materials[t] = this.texture_base.override({ texture: context.get_instance(shape_textures[t]) });
        }

        this.lights = [new Light(Vec.of(10, 100, 20, 1), Color.of(1, 1, 1, 1), 100000)];
        this.t = 0;
        
        this.yellow = Color.of(0.996, 0.952, 0.125, 1);
        this.red = Color.of(1, 0.078, 0.019, 1);
        this.brown = Color.of( .6, .4, 0, 1);
        this.pink = Color.of(0.964, 0.192, 0.552, 1);
        this.gray = Color.of(1, 1, 1, 1);
        this.white = Color.of(255, 99, 71, 1);
        this.black = Color.of(0, 0, 0, 1);
        this.tan = Color.of(0.968, 0.827, 0.588, 1);
        this.flower_green = Color.of(0.078, 1, 0.019, 1);
        
        this.gr = [];
        this.trees = [];
        this.hills = [];
        this.num_hills = 50;
        this.num_grass = 1000;
        this.num_trees = 50;
        for(var i = 0; i < this.num_grass; i++)
        {
            var dist = Math.random() * 100;
            var angle = Math.random() * Math.PI * 2;
            var posx = dist * Math.cos(angle);
            var posy = dist * Math.sin(angle);
            var orientation = Math.random() * Math.PI*2;
            var height = Math.random() * 0.02 + 0.1;
            this.gr.push([posx, posy, orientation, height]);
        }
        
        for(var i = 0; i < this.num_trees; i++)
        {
            var dist = Math.random() * 50 + 50;
            var angle = Math.random() * Math.PI * 2;
            var height = Math.random() * 0.5 + 0.9;
            var posx = dist * Math.cos(angle);
            var posy = dist * Math.sin(angle);
            var type = Math.random() > 0.5;
            angle = Math.random() * Math.PI * 2;
            this.trees.push([posx, posy, height, type, angle]);
        }
        
        for(var i = 0; i < this.num_hills; i++) {
            var angle = Math.random() * Math.PI * 2;
            var size = Math.random() * 10 + 15;
            var pos = Math.floor(Math.random() * 3);
            this.hills.push([angle, size, pos])
        }
        
        this.tears1 = new Tears(-6.1, -5.1, 5, 0.04, 3000);
        this.tears2 = new Tears(-5.9, -5.1, 5, 0.04, 3000);
        this.tears3 = new Tears(-6, -4.75, 5, 0.07, 3000);
        this.tears4 = new Tears(-5.5, -4.75, 5, 0.07, 3000);
        this.firework1 = new Firework(Vec.of(-20, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
        this.firework2 = new Firework(Vec.of(20, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
        this.firework3 = new Firework(Vec.of(0, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
        this.firework4 = new Firework(Vec.of(-20, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
        this.firework5 = new Firework(Vec.of(20, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
        this.firework6 = new Firework(Vec.of(0, 3, 0), this.shapes['circle'], Vec.of(0.3, 0.3, 0.3), Vec.of(0.9, 0.9, 0.9), 10, context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}), 0.5, Vec.of(0, -.05, 0), context.get_instance(Phong_Shader).material(Color.of(.2, .2, .9, 1), { ambient: 1, diffusivity: 1, specularity: 0, texture: context.get_instance("assets/spark.png")}));
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel()
    {
        this.key_triggered_button("Pause Time", ["n"], () => { this.paused = !this.paused; });
    }

    
    drawPark(graphics_state) {
        this.shapes["circle"].draw(graphics_state, Mat4.translation(Vec.of(0, -10, 0)).times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(100, 100, 1))), this.plastic);
        this.shapes["ball2"].draw(graphics_state, Mat4.scale(Vec.of(200, 200, 200)).times(Mat4.rotation(Math.PI, Vec.of(1, 0, 0))), this.sky);
        for(var i = 0; i < this.num_grass; i++) {
            var posx = this.gr[i][0];
            var posy = this.gr[i][1];
            var orientation = this.gr[i][2];
            var height = this.gr[i][3];
            this.shapes['grass'].draw(graphics_state,
                                      Mat4.identity().times(Mat4.translation(Vec.of(posx, -10, posy))).times(Mat4.rotation(orientation, Vec.of(0, 1, 0))).times(Mat4.scale(Vec.of(0.1, height, 0.1))),
                                      this.clay
                                      );
        }
        for(var i = 0; i < this.num_trees; i++) {
            var posx = this.trees[i][0];
            var posy = this.trees[i][1];
            var height = this.trees[i][2];
            if(this.trees[i][3]) {
                this.draw_tree1(graphics_state, height, this.trees[i][4], Vec.of(posx, -10, posy));
            } else {
                this.draw_tree2(graphics_state, height, this.trees[i][4], Vec.of(posx, -10, posy));
            }
        }
        for(var i = 0; i < this.num_hills; i++) {
            var m = Mat4.identity().times(Mat4.rotation(this.hills[i][0], Vec.of(0, 1, 0)));
            if(this.hills[i][2] == 0) {
                m = m.times(Mat4.translation(Vec.of(0, -15, -125)));
                m = m.times(Mat4.scale(Vec.of(this.hills[i][1] * 2, this.hills[i][1], this.hills[i][1])));
                this.shapes['hill'].draw(graphics_state, m, this.far1);
            } else if(this.hills[i][2] == 1) {
                m = m.times(Mat4.translation(Vec.of(0, -15, -150)));
                m = m.times(Mat4.scale(Vec.of(this.hills[i][1] * 3, this.hills[i][1], this.hills[i][1])));
                this.shapes['hill'].draw(graphics_state, m, this.far2);
            } else {
                m = m.times(Mat4.translation(Vec.of(0, -15, -175)));
                m = m.times(Mat4.scale(Vec.of(this.hills[i][1] * 3, this.hills[i][1], this.hills[i][1])));
                this.shapes['hill'].draw(graphics_state, m, this.far3);
            }
        }
    }
    
    
    draw_tree1(graphics_state, scale, orientation, location) {
        var s = Mat4.scale(Vec.of(scale, scale, scale));
        var l = Mat4.translation(location);
        var o = Mat4.rotation(orientation, Vec.of(0, 1, 0));
        var m = Mat4.identity().times(l).times(s).times(o);
        this.shapes['branch'].draw(graphics_state, m.times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(1, 1, 10))), this.bark);
        this.shapes['branch'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 5, 2))).times(Mat4.rotation(-4.25 * Math.PI/4, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(0.5, 0.5, 1))), this.bark);
        this.shapes['ball2'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 10, 5))).times(Mat4.scale(Vec.of(5, 5, 5))), this.green);
        this.shapes['ball2'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 9.5, 0))).times(Mat4.scale(Vec.of(4, 4, 4))), this.green);
    }
    
    draw_tree2(graphics_state, scale, orientation, location) {
        var s = Mat4.scale(Vec.of(scale, scale, scale));
        var l = Mat4.translation(location);
        var o = Mat4.rotation(orientation, Vec.of(0, 1, 0));
        var m = Mat4.identity().times(l).times(s).times(o);
        this.shapes['branch'].draw(graphics_state, m.times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(1, 1, 10))), this.bark);
        this.shapes['branch'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 3, 1))).times(Mat4.rotation(-3.5 * Math.PI/4, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(0.7, 0.7, 4))), this.bark);
        this.shapes['branch'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 4.75, -0.25))).times(Mat4.rotation(-1.5 * Math.PI/4, Vec.of(1, 0, 0))).times(Mat4.scale(Vec.of(0.25, 0.25, 2))), this.bark);
        this.shapes['ball2'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 9.5, 1))).times(Mat4.scale(Vec.of(4, 4, 4))), this.green);
        this.shapes['ball2'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 9, 5))).times(Mat4.scale(Vec.of(3, 3, 3))), this.green);
        this.shapes['ball2'].draw(graphics_state, m.times(Mat4.translation(Vec.of(0, 9, -3))).times(Mat4.scale(Vec.of(3, 3, 3))), this.green);
    }
    
    drawFlower(graphics_state, m, scale_factor, x_offset, y_offset, z_offset) {
        m = m.times(Mat4.scale(Vec.of(scale_factor,scale_factor,scale_factor))).times(Mat4.translation(Vec.of(x_offset,y_offset,z_offset)));
        m = m.times(Mat4.translation(Vec.of(6, 0, 0)));
        m = m.times(Mat4.scale([.4, .4, .4]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.yellow}));
        m = m.times(Mat4.scale([2.5, 2.5, 2.5]));
        m = m.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0)));
        this.shapes.circle.draw(graphics_state, m , this.plastic.override({color: this.red}));
        this.shapes.cone.draw(graphics_state, m, this.plastic.override({color: this.red}));
        m = m.times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0)));
        this.shapes.pedals.draw(graphics_state, m, this.plastic.override({color: this.red}));
        m = m.times(Mat4.translation([0, -2 , 0]));
        m = m.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0)));
        m = m.times(Mat4.scale([.1, .1 , 2]));
        this.shapes.cylinder.draw(graphics_state, m, this.plastic.override({color: this.flower_green}));
    }
    
    drawDogBody(graphics_state, m) {
        
        // Initial positioning
        m = m.times(Mat4.translation(Vec.of(20, 0, 0)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        m = m.times(Mat4.translation(Vec.of(0, 0, 2)));
        m = m.times(Mat4.scale([1, 1, 2]));
        this.shapes.cylinder.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        m = m.times(Mat4.translation(Vec.of(0, 0, 1)));
        m = m.times(Mat4.scale([1, 1, .5]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        // Head
        m = m.times(Mat4.translation(Vec.of(0, 1, 1)));
        m = m.times(Mat4.scale([1, 1, .8]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        // Snout
        m = m.times(Mat4.translation(Vec.of(0, -.25, .5)));
        m = m.times(Mat4.scale([.5, .5, .5]));
        m = m.times(Mat4.scale([1, 1, 3]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        // Nose
        m = m.times(Mat4.scale([1, 1, .2]));
        m = m.times(Mat4.translation(Vec.of(0, 0, 4.5)));
        m = m.times(Mat4.scale([.5, .5, .5]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.black}));
        
        // Ears
        m = m.times(Mat4.translation(Vec.of(-3, 5, -14)));
        m = m.times(Mat4.scale([1, 2, 1.5]));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        m = m.times(Mat4.translation(Vec.of(6, 0, 0)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        m = m.times(Mat4.scale([1, .5, .7]));
        m = m.times(Mat4.translation(Vec.of(-1.5, -3, 6)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.black}));
        
        m = m.times(Mat4.translation(Vec.of(-3, 0, 0)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.black}));
    }
    
    drawDogTail(graphics_state, m) {
        
        // wagging
        let tail_movement = Mat4.rotation(Math.PI/36 * -((Math.sin(10*this.t))), Vec.of(1,0,0));

        m = m.times(Mat4.translation(Vec.of(20, 0, 0)));
        m = m.times(Mat4.translation(Vec.of(0, -2, 0)));
        m = m.times(tail_movement);
        m = m.times(Mat4.translation(Vec.of(0, 2, 0)));
        m = m.times(Mat4.rotation(-7* Math.PI/8, Vec.of(1, 0, 0)));
        m = m.times(Mat4.scale(Vec.of(.5, .5, 2.5)));
        this.shapes.cone.draw(graphics_state, m, this.plastic.override({color: this.brown}));
    }
    
    drawDogBack(graphics_state, m) {
        m = m.times(Mat4.translation(Vec.of(19.5, -1, 0)));
        
        // Swinging of the legs
        let leg_movement1 =  Mat4.rotation(Math.PI/8 * -((Math.sin(3*this.t))),Vec.of(1,0,0));
        m = m.times(Mat4.translation(Vec.of(0, 1.5, 0)));
        m = m.times(leg_movement1);
        m = m.times(Mat4.translation(Vec.of(0, -1.5, 0)));
        m = m.times(Mat4.scale(Vec.of(.4, 1.5, .4)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        
        m = m.times(Mat4.scale(Vec.of(2.5, .666, 2.5)));
        m = m.times(Mat4.translation(Vec.of(1, 0, 0)));
        m = m.times(Mat4.scale(Vec.of(.4, 1.5, .4)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
    }
    
    drawDogFront(graphics_state, m) {
        m = m.times(Mat4.translation(Vec.of(19.5, -1, 4)));
        
        // Swinging of the legs
        let leg_movement2 =  Mat4.rotation(Math.PI/8 * ((Math.sin(3*this.t))),Vec.of(1,0,0));
        m = m.times(Mat4.translation(Vec.of(0, 1.5, 0)));
        m = m.times(leg_movement2);
        m = m.times(Mat4.translation(Vec.of(0, -1.5, 0)));
        m = m.times(Mat4.scale(Vec.of(.4, 1.5, .4)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
        m = m.times(Mat4.scale(Vec.of(2.5, .666, 2.5)));
        m = m.times(Mat4.translation(Vec.of(1, 0, 0)));
        m = m.times(Mat4.scale(Vec.of(.4, 1.5, .4)));
        this.shapes.ball.draw(graphics_state, m, this.plastic.override({color: this.brown}));
    }
    
    drawDog(graphics_state, m, scale_factor, x_offset, y_offset, z_offset, flip) {
        if (flip == false)
            m = m.times(Mat4.scale(Vec.of(scale_factor,scale_factor,scale_factor))).times(Mat4.translation(Vec.of(x_offset,y_offset,z_offset)));
        else
            m = m.times(Mat4.scale(Vec.of(-scale_factor,scale_factor,scale_factor))).times(Mat4.translation(Vec.of(x_offset,y_offset,z_offset)));
        
        this.drawDogBody(graphics_state, m);
        this.drawDogTail(graphics_state, m);
        this.drawDogBack(graphics_state, m);
        this.drawDogFront(graphics_state, m);
    }
    
    
    drawMickey(graphics_state, spacing, m, scale_factor, x_offset, y_offset, z_offset, is_walking, hand_down) {
        
        m = m.times(Mat4.scale(Vec.of(scale_factor,scale_factor,scale_factor))).times(Mat4.translation(Vec.of(x_offset,y_offset,z_offset)));
        
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/4, Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(6.5,-6.8,2)))
                                 .times(Mat4.scale(Vec.of(0.25,0.6,0.6))),
                                 this.mouse_plastic.override({color : this.white}));
        
        //tail
        this.shapes["circle"].draw(
                                   graphics_state,
                                   m.times(Mat4.rotation(-Math.PI/4, Vec.of(0,0,1)))
                                   .times(Mat4.translation(Vec.of(10.5,6.8,0)))
                                   .times(Mat4.scale(Vec.of(1.8,0.2,0.4))),
                                   this.mouse_plastic.override({color : this.black}));
        
        this.shapes["circle"].draw(
                                   graphics_state,
                                   m.times(Mat4.rotation(Math.PI/6, Vec.of(0,0,1)))
                                   .times(Mat4.translation(Vec.of(10.9,-10,0)))
                                   .times(Mat4.scale(Vec.of(1.2,0.2,0.4))),
                                   this.mouse_plastic.override({color : this.black}));
        
        //palm
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(-Math.PI/4, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(.6, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(6.7,5.5,-2.22)))
                                 .times(Mat4.scale(Vec.of(1.05,1,1))),
                                 this.mouse_plastic.override({color : this.white}));
        
        if (hand_down == false)
        {
            //back hand
            //wrist
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.translation(Vec.of(4.5,0.8,-1)))
                                     .times(Mat4.scale(Vec.of(0.25,0.6,0.6))),
                                     this.mouse_plastic.override({color : this.white}));
            //thumb
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/6, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(4,-0.8,-1)))
                                     .times(Mat4.scale(Vec.of(0.4,1,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(-Math.PI/6, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(2,2.98,-1)))
                                     .times(Mat4.scale(Vec.of(0.4,0.7,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            //pinky
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(2*Math.PI, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(2.9,0.4,-1.1)))
                                     .times(Mat4.scale(Vec.of(1.4,0.4,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            //middle finger
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(2*Math.PI, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(2.9,1,-1.1)))
                                     .times(Mat4.scale(Vec.of(0.8,0.4,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            
            //top finger
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(2*Math.PI, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(2.9,1.6,-1.1)))
                                     .times(Mat4.scale(Vec.of(0.8,0.4,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            
            //palm
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/2, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(1.1,-3.5,-1.1)))
                                     .times(Mat4.scale(Vec.of(0.7,0.8,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            
            //back arm (giving flowers)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(1.3, Vec.of(0, 0,-1)))
                                     .times(Mat4.rotation(0.4, Vec.of(1,0 , 0)))
                                     .times(Mat4.translation(Vec.of(0.5, 7, -4.5)))
                                     .times(Mat4.scale(Vec.of(0.7, 1.8 ,0.7))),
                                     this.mouse_plastic.override({color : this.black}));
            
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(1.3, Vec.of(0, 0,-1)))
                                     .times(Mat4.rotation(-0.4, Vec.of(1,0 , 0)))
                                     .times(Mat4.translation(Vec.of(0.5, 6.2, 1)))
                                     .times(Mat4.scale(Vec.of(0.6, 1.8 ,0.6))),
                                     this.mouse_plastic.override({color : this.black}));
        }
        else
        {
            //palm
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/2, Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(1.1,-6,-1.1)))
                                     .times(Mat4.scale(Vec.of(0.7,0.8,0.3))),
                                     this.mouse_plastic.override({color : this.white}));
            
            
            //back arm
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(1.3, Vec.of(0, 0,-1)))
                                     .times(Mat4.rotation(0.4, Vec.of(1,0 , 0)))
                                     .times(Mat4.translation(Vec.of(0.5, 7, -4.5)))
                                     .times(Mat4.scale(Vec.of(0.7, 1.8 ,0.7))),
                                     this.mouse_plastic.override({color : this.black}));
            
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(1.3, Vec.of(0, 0,-1)))
                                     .times(Mat4.rotation(-0.4, Vec.of(1,0 , 0)))
                                     .times(Mat4.translation(Vec.of(0.5, 8.2, 1)))
                                     .times(Mat4.scale(Vec.of(0.6, 1.8 ,0.6))),
                                     this.mouse_plastic.override({color : this.black}));

        }
        
        //front arm (in waist)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1, Vec.of(0, 0,1)))
                                 .times(Mat4.rotation(2.3, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(7 ,6,4.5)))  //y, z, x
                                 .times(Mat4.scale(Vec.of(0.7, 1.8 ,0.7))),
                                 this.mouse_plastic.override({color : this.black}));
        
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.7, Vec.of(0, 0,-1)))
                                 .times(Mat4.rotation(0.26, Vec.of(1,0 , 0)))
                                 .times(Mat4.translation(Vec.of(7.28, 7.5,0.4)))
                                 .times(Mat4.scale(Vec.of(0.6, 1.3 ,0.6))),
                                 this.mouse_plastic.override({color : this.black}));


        //shorts (big ball)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(-1,0,0)))
                                 .times(Mat4.rotation(Math.PI/10,Vec.of(0,0,-1)))
                                 .times(Mat4.translation(Vec.of(8.7, 1.8, 0)))
                                 .times(Mat4.scale(Vec.of(2.3,3, 2))),
                                 this.mouse_plastic.override({color: this.red}));
        
        //buttons
        //front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.4, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(1,-7.8,1.2)))
                                 .times(Mat4.scale(Vec.of(1, 0.5 ,0.7))),
                                 this.mouse_plastic.override({color: this.white}));
        
        //back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.4, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(1,-7,0.3)))
                                 .times(Mat4.scale(Vec.of(1, 0.5 ,0.5))),
                                 this.mouse_plastic.override({color: this.white}));
        
        //eyes
        //front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(4.9,-8.8,1.4)))
                                 .times(Mat4.scale(Vec.of(1, 0.5 ,0.7))),
                                 this.mouse_plastic.override({color: this.white}));
        
        
        //back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(5.1,-8.3,0.8)))
                                 .times(Mat4.scale(Vec.of(0.9, 0.5 ,0.7))),
                                 this.mouse_plastic.override({color: this.white}));
        
        
        //Pupils
        //front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(4.55,-8.7,1.4)))
                                 .times(Mat4.scale(Vec.of(0.6, 0.3 ,0.7))),
                                 this.mouse_plastic.override({color: this.black}))
        
        //back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(4.8,-8,0.95)))
                                 .times(Mat4.scale(Vec.of(0.5, 0.2 ,0.7))),
                                 this.mouse_plastic.override({color: this.black}))
        
        
        if (is_walking == true)
        {
            var walking_angle_1 =  (0.18 + 0.18 * Math.cos(2*this.t + 0.5));
            var walking_angle_2 =  (0.15 + 0.15 * Math.cos(2*this.t - 2.5));
            
            //legs (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_1, Vec.of(1, 0, 0)))
                                         .times(Mat4.rotation(Math.PI/118* 180,Vec.of(0,0,-1)))
                                         .times(Mat4.rotation(Math.PI/72.5* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(0, -7.6, -4.5)))
                                         .times(Mat4.scale(Vec.of(0.4,0.4, 1.1))),
                                         this.mouse_plastic.override({color: this.black}));
            
            //legs (right)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_2, Vec.of(0, 1, 0)))
                                         .times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(-1.6, 8, 9)))
                                         .times(Mat4.scale(Vec.of(0.4,0.4, 1.2))),
                                         this.mouse_plastic.override({color: this.black}));
            
            //shoes (left)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_1, Vec.of(1, 0, 0)))
                                     .times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-2,-6.4,-6)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1, 2))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_1, Vec.of(1, 0, 0)))
                                     .times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-2,-6.3,-5.4)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1,1.5))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            //shoes (right)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_2, Vec.of(0, 1, 0)))
                                     .times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-3,-6.4,-10)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1, 2))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_2, Vec.of(0, 1, 0)))
                                     .times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-3,-6.3,-10.5)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1,1.5))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            //shortlegs  (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_1, Vec.of(1, 0, 0)))
                                         .times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,-1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(0, -8, 0.3)))
                                         .times(Mat4.scale(Vec.of(1,1, 1))),
                                         this.mouse_plastic.override({color: this.red}));
            
            
            //shortlegs(right)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_2, Vec.of(0, 1, 0)))
                                         .times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(-1.5, 8, 7)))
                                         .times(Mat4.scale(Vec.of(1,1, 1))),
                                         this.mouse_plastic.override({color: this.red}));
        }
        else
        {
            //legs (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/118* 180,Vec.of(0,0,-1)))
                                         .times(Mat4.rotation(Math.PI/72.5* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(0, -7.6, -4.5)))
                                         .times(Mat4.scale(Vec.of(0.4,0.4, 1.1))),
                                         this.mouse_plastic.override({color: this.black}));
            
            
            //legs (right)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(-1.6, 8, 9)))
                                         .times(Mat4.scale(Vec.of(0.4,0.4, 1.2))),
                                         this.mouse_plastic.override({color: this.black}));
            
            //shoes (left)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-2,-6.4,-6)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1, 2))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-2,-6.3,-5.4)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1,1.5))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            //shoes (right)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-3,-6.4,-10)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1, 2))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,1)))
                                     .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                     .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                     .times(Mat4.translation(Vec.of(-3,-6.3,-10.5)))
                                     .times(Mat4.scale(Vec.of(1.8,1.1,1.5))),
                                     this.mouse_plastic.override({color: this.yellow}));
            
            //shortlegs  (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,-1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(0, -8, 0.3)))
                                         .times(Mat4.scale(Vec.of(1,1, 1))),
                                         this.mouse_plastic.override({color: this.red}));
            
            
            //shortlegs(right)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                         .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                         .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                         .times(Mat4.translation(Vec.of(-1.5, 8, 7)))
                                         .times(Mat4.scale(Vec.of(1,1, 1))),
                                         this.mouse_plastic.override({color: this.red}));
        }
        
        
        
        
        //torso
        this.shapes["cone"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/120 * 180 ,Vec.of(1,0,0)))
                                 .times(Mat4.rotation(Math.PI/93 * 180, Vec.of(0,-1,0)))
                                 .times(Mat4.translation(Vec.of(9,0,2)))
                                 .times(Mat4.scale(Vec.of(2, 1.2,6))),
                                 this.mouse_plastic.override({color : this.black}));
        
        
        
        //head
        this.shapes["ball"].draw(
                                 graphics_state,
                                 //m.times(Mat4.rotation(t, Vec.of(0, 1, 0))),
                                 m.times(Mat4.translation(Vec.of(10,5,0))).
                                 times(Mat4.scale(Vec.of(2.2, 2.4,2.2))),
                                 this.mouse_plastic.override({color: this.black}));
        m = m.times(Mat4.translation(Vec.of(spacing, 0, 0)));
        
        
        //vertical tan back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 //m.times(Mat4.rotation(t, Vec.of(0, 1, 0))),
                                 m.times(Mat4.translation(Vec.of(2.3,5,0.2))).
                                 times(Mat4.scale(Vec.of(0.5, 1.5,1.4))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        //vertical tan front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 //m.times(Mat4.rotation(t, Vec.of(0, 1, 0))),
                                 m.times(Mat4.translation(Vec.of(3.2,5,0.8))).
                                 times(Mat4.scale(Vec.of(1, 1.8,1.4))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        
        
        //jaw front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/95* 180,Vec.of(0,0,1)))
                                 .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,1,0)))
                                 .times(Mat4.rotation(Math.PI/90 * 180, Vec.of(-1,0,0)))
                                 .times(Mat4.translation(Vec.of(0,4.4,1.2)))
                                 .times(Mat4.scale(Vec.of(1.8,1.1, 2.2))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        //jaw back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/6,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(5.5,1,0.1)))
                                 .times(Mat4.scale(Vec.of(1.8,1.2, 2.2))),
                                 this.mouse_plastic.override({color: this.tan}));

        
        //lower ear
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(7.5,4.5,0)))
                                 .times(Mat4.scale(Vec.of(1.5, 1.5, 0.8)))
                                 .times(Mat4.rotation(Math.PI,Vec.of(1,0, 0))),
                                 this.mouse_plastic.override({color: this.black}));
        
        //top ear
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(5.5,8.5,0)))
                                 .times(Mat4.scale(Vec.of(1.5, 1.5, 0.8)))
                                 .times(Mat4.rotation(Math.PI,Vec.of(1,0, 0))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        
        //nose
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                 .times(Mat4.rotation(Math.PI* 60,Vec.of(1,0,0)))
                                 .times(Mat4.rotation(Math.PI * 40, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(-4.2,2.8,0)))
                                 .times(Mat4.scale(Vec.of(0.9, 0.6, 0.5))),
                                 this.mouse_plastic.override({color: this.black}));

    }
    
    drawMinnie(graphics_state, spacing, m, scale_factor, x_offset, y_offset, z_offset, is_walking) {
        
        m = m.times(Mat4.scale(Vec.of(scale_factor,scale_factor,scale_factor))).times(Mat4.translation(Vec.of(x_offset,y_offset,z_offset)));
        
        
        //tail
        this.shapes["circle"].draw(
                                   graphics_state,
                                   m.times(Mat4.rotation(Math.PI/4, Vec.of(0,0,1)))
                                   .times(Mat4.translation(Vec.of(-12,8.5,0)))
                                   .times(Mat4.scale(Vec.of(1.5,0.2,0.4))),
                                   this.mouse_plastic.override({color : this.black}));
        
        this.shapes["circle"].draw(
                                   graphics_state,
                                   m.times(Mat4.rotation(-Math.PI/6, Vec.of(0,0,1)))
                                   .times(Mat4.translation(Vec.of(-12.8,-10.8,0)))
                                   .times(Mat4.scale(Vec.of(1.2,0.2,0.4))),
                                   this.mouse_plastic.override({color : this.black}));
        
        //eyes
        //front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(4.6,14.7,1.9)))
                                 .times(Mat4.scale(Vec.of(1, 0.5 ,0.7))),
                                 this.mouse_plastic.override({color: this.white}));
        
        
        //back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(4.55,15.4,1.5)))
                                 .times(Mat4.scale(Vec.of(0.7, 0.3 ,0.7))),
                                 this.mouse_plastic.override({color: this.white}));
        
        
        //pupils
        //front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(-1.3 , Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-8.58,-12.83,2.6)))
                                 .times(Mat4.scale(Vec.of(0.35, 0.2 ,0.03))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        //back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(-1.3 , Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-8.7,-13.53,2.2)))
                                 .times(Mat4.scale(Vec.of(0.25, 0.15 ,0.03))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        //lashe
        //back
        this.shapes["square"].draw(
                                   graphics_state,
                                   m.times(Mat4.translation(Vec.of(-15.5, 5.1, 2.2)))
                                   .times(Mat4.scale(Vec.of(0.03, 0.1 ,0.5))),
                                   this.mouse_plastic.override({color: this.black}));
        
        this.shapes["square"].draw(
                                   graphics_state,
                                   m.times(Mat4.translation(Vec.of(-15.3, 5.1, 2.2)))
                                   .times(Mat4.scale(Vec.of(0.03, 0.1 ,0.5))),
                                   this.mouse_plastic.override({color: this.black}));
        
        //front
        this.shapes["square"].draw(
                                   graphics_state,
                                   m.times(Mat4.translation(Vec.of(-14.9, 5.2, 2.7)))
                                   .times(Mat4.scale(Vec.of(0.03, 0.2 ,0.5))),
                                   this.mouse_plastic.override({color: this.black}));
        
        this.shapes["square"].draw(
                                   graphics_state,
                                   m.times(Mat4.translation(Vec.of(-14.5, 5.2, 2.7)))
                                   .times(Mat4.scale(Vec.of(0.03, 0.2 ,0.5))),
                                   this.mouse_plastic.override({color: this.black}));
        
        this.shapes["square"].draw(
                                   graphics_state,
                                   m.times(Mat4.translation(Vec.of(-14.7, 5.3, 2.7)))
                                   .times(Mat4.scale(Vec.of(0.03, 0.2 ,0.5))),
                                   this.mouse_plastic.override({color: this.black}));
        
        
        //back wrist
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(-0.7, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(0.7, Vec.of(1, 0, 0)))
                                 .times(Mat4.rotation(-0.7, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-3,-4,7.8))) //z, y, x
                                 .times(Mat4.scale(Vec.of(0.25,0.6,0.6))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        //front wrist
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/8, Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(-10.8,4.5,2.2))) //z, y, x
                                 .times(Mat4.scale(Vec.of(0.25,0.5,0.5))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //back palm
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.7, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(-0.8, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(0.8, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-8.5,3.2,-1.5)))
                                 .times(Mat4.scale(Vec.of(0.6,0.7,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        //back pinky
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.4, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(-0.8, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(0.8, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-7.8,1,-3.7)))
                                 .times(Mat4.scale(Vec.of(0.2,0.8,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //back middle finger
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.4, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(-0.7, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(0.8, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-8.1,1.2,-3.8)))
                                 .times(Mat4.scale(Vec.of(0.2,0.8,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //back front finger
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.4, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(-0.7, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(0.8, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-8.4,1.2,-3.9)))
                                 .times(Mat4.scale(Vec.of(0.2,0.8,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //back thumb
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(-0.7, Vec.of(0,0,1)))
                                 .times(Mat4.rotation(-0.7, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(0.8, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-3,-5.8,-7.4)))
                                 .times(Mat4.scale(Vec.of(0.2,0.6,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //front
        //front palm
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/4, Vec.of(1,0,0)))
                                 
                                 .times(Mat4.translation(Vec.of(-10.9,1.6,1.5)))
                                 .times(Mat4.scale(Vec.of(0.7,0.3,0.6))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        //front pinky
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m
                                 .times(Mat4.rotation(1.1, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(-0.05, Vec.of(0, 1, 0)))
                                 .times(Mat4.rotation(-0.35, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-10.4,-1.7,1.8)))
                                 .times(Mat4.scale(Vec.of(0.8,0.2,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        
        //front middle finger
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m
                                 .times(Mat4.rotation(1.1, Vec.of(1,0,0)))
                                 .times(Mat4.rotation(-0.05, Vec.of(0, 1,0)))
                                 .times(Mat4.rotation(-0.35, Vec.of(0, 0,1)))
                                 .times(Mat4.translation(Vec.of(-10.3,-1.8,1.5)))
                                 .times(Mat4.scale(Vec.of(0.8, 0.2,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //front front finger
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m
                                 .times(Mat4.rotation(1.1,Vec.of(1, 0,0)))
                                 .times(Mat4.rotation(-0.15, Vec.of(0,1,0)))
                                 .times(Mat4.rotation(-0.35, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-10.3,-1.87,2.3)))
                                 .times(Mat4.scale(Vec.of(0.8,0.2,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //front thumb
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m
                                 .times(Mat4.rotation(1.1,Vec.of(1, 0,0)))
                                 .times(Mat4.rotation(0.15, Vec.of(0,1,0)))
                                 .times(Mat4.rotation(-0.8, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-8.4,-6.8,-1.2)))
                                 .times(Mat4.scale(Vec.of(0.8,0.2,0.3))),
                                 this.mouse_plastic.override({color : this.gray}));
        
        
        //back arm
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation( Math.PI/4, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(-6.1,8.9,-0.5)))
                                 .times(Mat4.scale(Vec.of(0.5, 1, 0.5))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(0.7, Vec.of(0, 0,1)))
                                 .times(Mat4.rotation(-0.7, Vec.of(1,0 , 0)))
                                 .times(Mat4.translation(Vec.of(-6.8,5.3, 4.5)))
                                 .times(Mat4.scale(Vec.of(0.5, 1 ,0.5))),
                                 this.mouse_plastic.override({color : this.black}));
        
        
        //front arm
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/4, Vec.of(0, 0, 1)))
                                 .times(Mat4.rotation(-0.6, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(-9.2,7.2,6.7)))
                                 .times(Mat4.scale(Vec.of(0.5, 1, 0.5))),
                                 this.mouse_plastic.override({color: this.black}));
        
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.4, Vec.of(0, 0, 1)))
                                 .times(Mat4.rotation(0.35, Vec.of(-1,0,0)))
                                 .times(Mat4.rotation(0.35,Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(-2.2,12.2,2)))
                                 .times(Mat4.scale(Vec.of(0.5, 1, 0.5))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        
        //torso
        
        this.shapes["cone"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2 ,Vec.of(-1,0,0)))
                                 .times(Mat4.rotation(Math.PI/95 * 180, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(-11.5,0,4)))
                                 .times(Mat4.scale(Vec.of(2, 1.2,6))),
                                 this.mouse_plastic.override({color : this.yellow}));
        
        
        
        //bow
        //top right
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.4, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(7.2 ,15.8  ,1)))
                                 .times(Mat4.scale(Vec.of(2, 1,0.7))),
                                 this.mouse_plastic.override({color: this.pink}));
        
        
        
        //bottom right
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(-14 ,7.8  ,0.8)))
                                 .times(Mat4.scale(Vec.of(1.1, 1.2,0.7))),
                                 this.mouse_plastic.override({color: this.pink}))
        
        
        
        //middle
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.6, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(8.2,14.7 ,1.2)))
                                 .times(Mat4.scale(Vec.of(1, 0.5 ,0.9))),
                                 this.mouse_plastic.override({color: this.pink}))
        
        
        //bottom left
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(2.6, Vec.of(0, 0,1 )))
                                 .times(Mat4.translation(Vec.of(17 ,2,0.8)))
                                 .times(Mat4.scale(Vec.of(1, 1.5, 0.5))),
                                 this.mouse_plastic.override({color: this.pink}));
        
        
        
        //top left
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(2.3, Vec.of(0, 0, 1)))
                                 .times(Mat4.translation(Vec.of(17.4,6.6,0.8 )))
                                 .times(Mat4.scale(Vec.of(1.8 , 1, 0.7))),
                                 this.mouse_plastic.override({color: this.pink}));
        
        
        //head
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(-14,5,0)))
                                 .times(Mat4.scale(Vec.of(2.2, 2.4,2.2))),
                                 this.mouse_plastic.override({color: this.black}));
        
        m = m.times(Mat4.translation(Vec.of(spacing, 0, 0)));
        
        
        //vertical tan
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m
                                 .times(Mat4.translation(Vec.of(-20.55,4.85,0.3)))
                                 .times(Mat4.scale(Vec.of(1.5, 2.2,2.2))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        
        //top black part(under the bow)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/6, Vec.of(0, 0,1)))
                                 .times(Mat4.translation(Vec.of(-15, 16.25, 1)))
                                 .times(Mat4.scale(Vec.of(0.5, 0.2, 0.5))),
                                 this.mouse_plastic.override({color : this.black}));
        
        //jaw back
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/5,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(-13.6,14.6,0)))
                                 .times(Mat4.scale(Vec.of(2,1.2, 2))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        //jaw front
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/90* 180,Vec.of(0,0,-1)))
                                 .times(Mat4.rotation(Math.PI/70* 180,Vec.of(0,-1,0)))
                                 .times(Mat4.rotation(Math.PI/89 * 180, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(4.5,4.8,20.1)))
                                 .times(Mat4.scale(Vec.of(1.8,1.1, 2.2))),
                                 this.mouse_plastic.override({color: this.tan}));
        
        
        
        //lower ear
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(-16.7,6.2,0)))
                                 .times(Mat4.scale(Vec.of(1.5, 1.5, 0.8)))
                                 .times(Mat4.rotation(Math.PI,Vec.of(1,0, 0))),
                                 this.mouse_plastic.override({color: this.black}));
        
        //top ear
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.translation(Vec.of(-19.8,8.5,0)))
                                 .times(Mat4.scale(Vec.of(1.5, 1.5, 0.8)))
                                 .times(Mat4.rotation(Math.PI,Vec.of(1,0, 0))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        
        //nose
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/110* 180,Vec.of(0,0,1)))
                                 .times(Mat4.rotation(Math.PI* 60,Vec.of(1,0,0)))
                                 .times(Mat4.rotation(Math.PI * 40, Vec.of(1,0,0)))
                                 .times(Mat4.translation(Vec.of(-13.3,-19.4,0)))
                                 .times(Mat4.scale(Vec.of(0.9, 0.6, 0.5))),
                                 this.mouse_plastic.override({color: this.black}));
        
        
        
        //front shoulder (top)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.91,Vec.of(0,0,1)))
                                 .times(Mat4.rotation(0.1, Vec.of(0,1,0)))
                                 .times(Mat4.translation(Vec.of(8.3,18.1,1.8)))
                                 .times(Mat4.scale(Vec.of(0.9, 0.6, 0.5))),
                                 this.mouse_plastic.override({color: this.yellow}));
        
        
        //(bottom)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.9,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(7.5,18.4,1)))
                                 .times(Mat4.scale(Vec.of(0.6, 0.8, 0.5))),
                                 this.mouse_plastic.override({color: this.yellow}));
        
        
        
        
        //back shoulder (top)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(2.4,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(15.2,10,-0.5)))
                                 .times(Mat4.scale(Vec.of(0.9, 0.6, 0.8))),
                                 this.mouse_plastic.override({color: this.yellow}));
        //(bottom)
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(1.9,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(7.9,15.6,-0.5)))
                                 .times(Mat4.scale(Vec.of(0.4, 0.6, 0.5))),
                                 this.mouse_plastic.override({color: this.yellow}));
        
        
        //(dress structure)
        this.shapes["cone"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(Math.PI/2 ,Vec.of(-1,0,0)))
                                 .times(Mat4.rotation(Math.PI/91 * 180, Vec.of(0,-1,0)))
                                 .times(Mat4.translation(Vec.of(-17.5,0,-2.3)))
                                 .times(Mat4.scale(Vec.of(3.3, 3,3))),
                                 this.mouse_plastic.override({color : this.yellow}));
        
        
        //dress flare
        this.shapes["ball"].draw(
                                 graphics_state,
                                 m.times(Mat4.rotation(3.05,Vec.of(0,0,1)))
                                 .times(Mat4.translation(Vec.of(17.5,3,0)))
                                 .times(Mat4.scale(Vec.of(4, 0.8, 4))),
                                 this.mouse_plastic.override({color: this.yellow}));
        
        if (is_walking == true)
        {
            var walking_angle_1 =  (0.04 * Math.cos(2 * this.t + 0));
            var walking_angle_2 =  (0.04 * Math.cos(2 * this.t + 3.14));
            
            //legs (right)

            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_1, Vec.of(0, 0, 1)))
                                         .times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0)))
                                         .times(Mat4.rotation(0.3, Vec.of(0,-1,0)))
                                         .times(Mat4.translation(Vec.of(-15, 0, 8)))
                                         .times(Mat4.scale(Vec.of(0.5,0.5, 1.3))),
                                         this.mouse_plastic.override({color: this.black}));

            
            
            //legs (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m
                                         .times(Mat4.rotation(walking_angle_2, Vec.of(0, 0, 1)))
                                         .times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0)))
                                         .times(Mat4.rotation(0.3,Vec.of(0,-1,0)))
                                         .times(Mat4.translation(Vec.of(-18, 0, 8)))
                                         .times(Mat4.scale(Vec.of(0.5,0.5, 1.2))),
                                         this.mouse_plastic.override({color: this.black}))
            
            
            //shoes (right)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_1, Vec.of(0, 0, 1)))
                                     .times(Mat4.rotation(-0.4 ,Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(-15,-11.9,-0.5)))
                                     .times(Mat4.scale(Vec.of(1.8,1.2, 1.4))),
                                     this.mouse_plastic.override({color: this.pink}));

            
            //left
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m
                                     .times(Mat4.rotation(walking_angle_2, Vec.of(0, 0, 1)))
                                     .times(Mat4.rotation(0.5,Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(-20.5,5.5,-0.3)))
                                     .times(Mat4.scale(Vec.of(2,1.3,1.5))),
                                     this.mouse_plastic.override({color: this.pink}));
            
        }
        else
        {
            //legs (left)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0)))
                                         .times(Mat4.rotation(0.3, Vec.of(0,-1,0)))
                                         .times(Mat4.translation(Vec.of(-15, 0, 8)))
                                         .times(Mat4.scale(Vec.of(0.5,0.5, 1.1))),
                                         this.mouse_plastic.override({color: this.black}));
            
            
            //legs (right)
            this.shapes["cylinder"].draw(
                                         graphics_state,
                                         m.times(Mat4.rotation(Math.PI/2,Vec.of(1,0,0)))
                                         .times(Mat4.rotation(0.3,Vec.of(0,-1,0)))
                                         .times(Mat4.translation(Vec.of(-17, 0, 8)))
                                         .times(Mat4.scale(Vec.of(0.5,0.5, 1.2))),
                                         this.mouse_plastic.override({color: this.black}))
            
            
            
            //shoes (left)
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(-0.4 ,Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(-13,-10.5,-0.5)))
                                     .times(Mat4.scale(Vec.of(1.8,1.2, 1.4))),
                                     this.mouse_plastic.override({color: this.pink}));
            //right
            this.shapes["ball"].draw(
                                     graphics_state,
                                     m.times(Mat4.rotation(0.5,Vec.of(0,0,1)))
                                     .times(Mat4.translation(Vec.of(-19.2,5,-0.3)))
                                     .times(Mat4.scale(Vec.of(2,1.3,1.5))),
                                     this.mouse_plastic.override({color: this.pink}));
        }
    }
    

    
    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;

        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        let spacing = 6;
        
        var canvasContainer = document.getElementById("main-canvas");
        let m = Mat4.identity();
        var mouse_matrix = m.times(Mat4.translation(Vec.of(0, 4, 0)));

        var intro_delay = 1000;
        var intro_length = 3000; //3000
        var dog_enters_1_delay = intro_delay + intro_length - 2000;
        var dog_enters_1_length = 23000; //23000
        var dog_enters_2_delay = dog_enters_1_delay + dog_enters_1_length;
        var dog_enters_2_length = 9000; //9000
        var mickey_enters_delay = dog_enters_2_delay + dog_enters_2_length;
        var mickey_enters_length = 11000; //11000
        var minnie_happy_delay = mickey_enters_delay + mickey_enters_length;
        var minnie_happy_length = 2000; //2000
        var couple_leaves_delay = minnie_happy_delay + minnie_happy_length;
        var couple_leaves_length = 9000; // 9000
        var fireworks_delay = couple_leaves_delay + couple_leaves_length - 4000;
        var fireworks_length = 15000; //15000
        var closing_delay = fireworks_delay + fireworks_length - 3900;
        var closing_length = 5000; //5000

        var intro = graphics_state.animation_time - intro_delay;
        var dog_enters_1 = graphics_state.animation_time - dog_enters_1_delay;
        var dog_enters_2 = graphics_state.animation_time - dog_enters_2_delay;
        var mickey_enters = graphics_state.animation_time - mickey_enters_delay;
        var minnie_happy = graphics_state.animation_time - minnie_happy_delay;
        var couple_leaves = graphics_state.animation_time - couple_leaves_delay;
        var fireworks_display = graphics_state.animation_time - fireworks_delay;
        var closing = graphics_state.animation_time - closing_delay;
    
        if (intro > intro_length)
            intro = -1;
        if (dog_enters_1 > dog_enters_1_length)
            dog_enters_1 = -1;
        if (dog_enters_2 > dog_enters_2_length)
            dog_enters_2 = -1;
        if (mickey_enters > mickey_enters_length)
            mickey_enters = -1;
        if (minnie_happy > minnie_happy_length)
            minnie_happy = -1;
        if (couple_leaves > couple_leaves_length)
            couple_leaves = -1;
        if (fireworks_display > fireworks_length)
            fireworks_display = -1;
        if (closing > closing_length)
            closing = -1;

        if (intro > 0)
        {
            var curtain_left = m.times(Mat4.translation([-13.1 - intro * 0.01, 5, 12])).times(Mat4.scale([16,28,1]));
            var curtain_right = m.times(Mat4.translation([13.1 + intro * 0.01, 5, 12])).times(Mat4.scale([16,28,1]));
            this.shapes.square.draw(graphics_state, curtain_left, this.shape_materials.open_curtain);
            this.shapes.square.draw(graphics_state, curtain_right, this.shape_materials.open_curtain);
        }
        
        if (dog_enters_1 > 2000)
        {
            graphics_state.camera_transform = Mat4.look_at(Vec.of(0,10,-20) , Vec.of(-30, -75, -100 + dog_enters_1/90), Vec.of(0,1,0))
            this.drawPark(graphics_state);
            this.drawDog(graphics_state, m, 1, -30 , -7.5, -100 + dog_enters_1/140, false);
        }
        if (dog_enters_2 > 0)
        {
            if (dog_enters_2 > 4000)
                graphics_state.camera_transform = Mat4.translation([6, 5, -20]);
            else
                graphics_state.camera_transform = Mat4.translation([(dog_enters_2/666.67), (dog_enters_2/800), (-1 * dog_enters_2)/200]);
            this.drawPark(graphics_state);
            this.drawMinnie(graphics_state, spacing, mouse_matrix, 0.4, 0, -27, 0, false, false, false);
            this.tears1.cry(graphics_state, 50, this.shapes.ball, this.water, Math.PI);
            this.tears2.cry(graphics_state, 50, this.shapes.ball, this.water, Math.PI);
            this.drawDog(graphics_state, m, 1, -30 , -7.5, -100 + dog_enters_2/60, false);
        }
        
        if (mickey_enters > 0)
        {
            graphics_state.camera_transform = Mat4.translation([0, 0, -40]);
            this.drawPark(graphics_state);
            if (mickey_enters > 10000)
            {
                this.drawMickey(graphics_state, spacing, mouse_matrix, 0.4, 70 - 10000/125, -26, 0, false, false);
                this.drawFlower(graphics_state, mouse_matrix, 0.38, 70 - 10000/120, -23, 0);
            }
            else
            {
                this.drawMickey(graphics_state, spacing, mouse_matrix, 0.4, 70 - mickey_enters/125, -26, 0, true, false);
                this.drawFlower(graphics_state, mouse_matrix, 0.38, 70 - mickey_enters/120, -23, 0);
            }
            this.drawMinnie(graphics_state, spacing, mouse_matrix, 0.4, 0, -27, 0, false);
            this.tears3.cry(graphics_state, 50, this.shapes.ball, this.water, Math.PI);
            this.tears4.cry(graphics_state, 50, this.shapes.ball, this.water, Math.PI);
        }
        
        if (minnie_happy > 0)
        {
            graphics_state.camera_transform = Mat4.translation([6, 5, -4.5]);
            this.drawPark(graphics_state);
            this.drawMinnie(graphics_state, spacing, mouse_matrix, 0.4, 0, -27, 0, false);
        }
        
        if (couple_leaves > 0)
        {
            if (couple_leaves < 100)
                graphics_state.camera_transform = Mat4.translation([0, 0, -40]);
            this.drawPark(graphics_state);
            if (couple_leaves > 1000)
            {
                this.drawMickey(graphics_state, spacing, mouse_matrix, 0.4, (70 - 10000/125) - (couple_leaves - 1000)/100, -26, 0, true, true);
                this.drawMinnie(graphics_state, spacing, mouse_matrix, 0.4, - (couple_leaves - 1000)/100, -27, 0, true);
                this.drawFlower(graphics_state, mouse_matrix, 0.38,  - 16 - (couple_leaves - 1000)/94, -25, 0);
            }
            else
            {
                this.drawMickey(graphics_state, spacing, mouse_matrix, 0.4, 70 - 10000/125, -26, 0, false, true);
                this.drawMinnie(graphics_state, spacing, mouse_matrix, 0.4, 0, -27, 0, false);
                this.drawFlower(graphics_state, mouse_matrix, 0.38, -16, -25, 0);
            }
        }
        
        if (fireworks_display > 0)
        {
            if (fireworks_display > 8000)
                graphics_state.camera_transform = Mat4.translation([0, - 7000/1200, -40]);
            else if (fireworks_display > 1000)
                graphics_state.camera_transform = Mat4.translation([0, - (fireworks_display-1000)/1200, -40]);
            else
                graphics_state.camera_transform = Mat4.translation([0, 0, -40]);
            
            this.drawPark(graphics_state);

            if (fireworks_display > 9500)
                this.firework6.tick(graphics_state);
            if (fireworks_display > 8000)
            {
                this.firework4.tick(graphics_state);
                this.firework5.tick(graphics_state);
            }
            if (fireworks_display > 4000)
                this.firework3.tick(graphics_state);
            if (fireworks_display > 2000)
                this.firework2.tick(graphics_state);
            if (fireworks_display > 1000)
                this.firework1.tick(graphics_state);
        }

        if (closing > 0)
        {
            graphics_state.camera_transform = Mat4.translation([0, - 8000/1200, -40]);
            var curtain_left = Mat4.identity();
            var curtain_right = Mat4.identity();
            if (closing > 2618)
            {
                curtain_left = m.times(Mat4.translation([-39.5 + 2618 * 0.009, 5, 6.5])).times(Mat4.scale([16,28,1]));
                curtain_right = m.times(Mat4.translation([39.5 - 2618 * 0.009, 5, 6.5])).times(Mat4.scale([16,28,1]));
            }
            else
            {
                curtain_left = m.times(Mat4.translation([-39.5 + closing * 0.009, 5, 6.5])).times(Mat4.scale([16,28,1]));
                curtain_right = m.times(Mat4.translation([39.5 - closing * 0.009, 5, 6.5])).times(Mat4.scale([16,28,1]));
            }
            this.shapes.square.draw(graphics_state, curtain_left, this.shape_materials.open_curtain);
            this.shapes.square.draw(graphics_state, curtain_right, this.shape_materials.open_curtain);
        }
    }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;
