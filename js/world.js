
if (!Array.prototype.contains) {  
    Array.prototype.contains = function(object) {  
        return this.indexOf(object) != -1 ? true : false;        
    };
}

if (!Array.prototype.remove) {  
    Array.prototype.remove = function(object) {  
        var removeIndex = this.indexOf(object);
        if(removeIndex != -1){
            return this.splice(removeIndex, 1)[0]; 
        }
        return null;
    };
};

if (!Array.prototype.removeAtIndex) {  
    Array.prototype.removeAtIndex = function(index) {  
        return this.splice(index, 1)[0]; 
    };
};

function sketchProc(p){

    function LinkedVertex(xpos, ypos, zpos, vname){
        this.vname = vname || "default";
        this.xpos = xpos;
        this.ypos = ypos;
        this.zpos = zpos;
        this.joins = [];

        this.draw = function(){
            // console.log(_vname);
            p.vertex(this.xpos, this.ypos, this.zpos); 
        };
        this.move = function(dx, dy, dz){
            this.xpos += dx;
            this.ypos += dy;
            this.zpos += dz;
        };
        this.rotate = function(xopos, yopos, zopos, radius, zenithrad, azimuthrad){
            // our y direction is treated as z in spherical coords 
            this.xpos = xopos + radius*p.cos(azimuthrad)*p.sin(zenithrad);
            this.ypos = yopos + radius*p.cos(zenithrad);
            this.zpos = zopos + radius*p.sin(azimuthrad)*p.sin(zenithrad);
        };
        this.rotateX = function(rp, radius, zenithrad){
            this.rotate(rp.xpos, rp.ypos, rp.zpos, radius, zenithrad, p.PI/2);
        };
        this.rotateY = function(xopos, yopos, zopos, radius, azimuthrad){
            this.rotate(xopos, yopos, zopos, radius, p.PI/2, azimuthrad);
        };
        this.rotateZ = function(xopos, yopos, zopos, radius, zenithrad){
            this.rotate(xopos, yopos, zopos, radius, zenithrad, 0);
        };
        this.distanceFrom = function(vertex){
            return Math.sqrt(Math.pow(vertex.xpos - this.xpos, 2) + Math.pow(vertex.ypos - this.ypos, 2)
                + Math.pow(vertex.zpos - this.zpos, 2));
        };
    };

    function Shape(shapeFunction, shapeArgs, color, position, extraArgs){
        this.shapeFunction = shapeFunction; 
        this.shapeArgs = shapeArgs; 
        this.color = color; 
        this.position = position; 
        this.extraArgs = extraArgs; 
    }

    Shape.prototype.color = null; 
    Shape.prototype.position = null;
    Shape.prototype.shapeArgs = null;
    Shape.prototype.shapeFunction = null;
    Shape.prototype.extraArgs = null;

    Shape.prototype.moveVertex = function(vertexIndex, dx, dy, dz){
        this.shapeArgs[vertexIndex].move(dx, dy, dz);
    }

    /* vertex object or index of vertex in vertices can be passed */
    Shape.prototype.rotateVertexX = function(vertex, zenithrad, rotationPoint){
        var rotatingVertex = typeof vertex === "number" ? this.shapeArgs[vertex] : vertex; 
        rotatingVertex.rotateX(rotationPoint, rotationPoint.distanceFrom(vertex), zenithrad);
    }

    function Sphere(position, rsize, color, extraArgs){
       Shape.apply(this, [function(radius){p.sphere(radius);}, [rsize], color, position, extraArgs]);
    };
    Sphere.prototype = new Shape();

    function Box(position, xsize, ysize, zsize, color, extraArgs){
       this.dimensions = [xsize, ysize, zsize];
       Shape.apply(this, [function(x,y,z){p.box(x,y,z);}, this.dimensions, color, position, extraArgs]);
    };
    Box.prototype = new Shape();
    Box.prototype.dimensions = null;

    function Head(xpos, ypos, zpos, rsize, color){
        var position = new LinkedVertex(xpos, ypos, zpos);
        Sphere.apply(this, [position, rsize, color, {}]);
    };
    Head.prototype = new Sphere();

    function VerticalPyramid(r, l, color, position, extraArgs){

        var point = new LinkedVertex(0, l/2, 0, "point");
        var b1 = new LinkedVertex(+r, -l/2, -r, "b1");
        var b2 = new LinkedVertex(+r, -l/2, +r, "b2");
        var b3 = new LinkedVertex(-r, -l/2, +r, "b3");
        var b4 = new LinkedVertex(-r, -l/2, -r, "b4");

        this.rotationPoint  = new LinkedVertex(0, -l/2, 0, "rp");

        Shape.apply(this, [vertexShape, [[point, b1, b2, b3, b4]], color, position, extraArgs]);

        point.joins = [b1, b2, b3, b4];
        b1.joins = [point, b4, b2];
        b2.joins = [point, b1, b3];
        b3.joins = [point, b2, b4];
        b4.joins = [point, b3, b1];
    };    
    VerticalPyramid.prototype = new Shape();
    VerticalPyramid.prototype.rotationPoint = null;
    VerticalPyramid.prototype.rotatePointX = function(zenithrad){
        this.rotateVertexX(this.shapeArgs[0][0], zenithrad, this.rotationPoint);
    };

    function Body(xpos, ypos, zpos, xsize, ysize, zsize, color){
        var position = new LinkedVertex(xpos, ypos, zpos);
        Box.apply(this, [position, xsize, ysize, zsize, color, {}]);
    };
    Body.prototype = new Box();

    function World(xpos, ypos, zpos, rsize, color, rotate){
        this.r = 0.0;
        var position = new LinkedVertex(xpos, ypos, zpos);
        var extraArgs = {
            hook : function(_rotate, self){
                self.r += 0.01;
                console.log(self.r);
                p.rotateX(p.cos(_rotate)*self.r);
                p.rotateZ(p.sin(_rotate)*self.r);
            }, 
            hookArgs : [rotate, this],
            rotation : 0 
        };
       Sphere.apply(this, [position, rsize, color, extraArgs]);
    };
    World.prototype = new Sphere();
  
    function Leg(xpos, ypos, zpos, rotate, color){
        var _position = new LinkedVertex(xpos, ypos, zpos);
        var _rotate = rotate;
        VerticalPyramid.apply(this, [10, 40, color, _position, {}]);
    };
    Leg.prototype = new VerticalPyramid();
    Leg.prototype.steprad = p.PI/4;
    Leg.prototype.step = function(rad){
            this.rotatePointX(rad);
    };
    Leg.prototype.stepForward = function(){
            this.step(this.steprad);
    }
    Leg.prototype.stepBack = function(){
            this.step(-1*this.steprad);
    };
    Leg.prototype.center = function(){
            this.step(0);
    };

    function Legs(xpos, ypos, zpos, rotate, color){
        var RIGHT_FOOT_FORWARD = 0;
        var LEFT_FOOT_FORWARD = 1;

        var state = RIGHT_FOOT_FORWARD;
        
        var _color = color;
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _rotate = rotate;

        var leftLeg = new Leg(p.cos(-_rotate)*(_xpos + 10), _ypos, p.sin(-_rotate)*(_zpos + 10), _rotate, _color);
        var rightLeg = new Leg(p.cos(-_rotate)*(_xpos + -10), _ypos, p.sin(-_rotate)*(_zpos + -10), _rotate, _color);

        this.shapes = [leftLeg, rightLeg];

        this.walk = function(){
            switch(state){
                case LEFT_FOOT_FORWARD:
                    leftLeg.stepBack();
                    rightLeg.stepForward();
                    state = RIGHT_FOOT_FORWARD;
                    break;
                case RIGHT_FOOT_FORWARD:
                    rightLeg.stepBack();
                    leftLeg.stepForward();
                    state = LEFT_FOOT_FORWARD;
                    break;
                default:
                    leftLeg.stepForward();
                    rightLeg.stepBack();
                    state = LEFT_FOOT_FORWARD;
                    break;
            };
        };
    };

    var XPos = 0.0;
    var YPos = 0.0;
    var ZPos = 0.0;

    var rotation = p.radians(45);

    var backgroundColor = 255;

    var legs = new Legs(0, 220, 0, rotation, 180);
    var body = new Body(0, 260, 0, 40, 40, 20, 80);
    var world = new World(0, 0, 0, 200, 255, rotation);
    var head = new Head(0, 300, 0, 20);
    var pencil = new Pencil();

    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.frameRate(1);
        p.background(backgroundColor);
        XPos = p.width/2;
        YPos = p.height;

        p.background(backgroundColor);
    };

    p.draw = function(){
        pencil.draw(head);
        pencil.draw(body);
        legs.walk();
        pencil.draw(legs);
        pencil.draw(world);
   };

   function Pencil(){

        var setUp = function(color, position, extraArgs){
            p.pushMatrix();
            p.fill(color);
            positionedTranslate(position.xpos, position.ypos, position.zpos);
            if(extraArgs != undefined){
                if(extraArgs.rotation != undefined){
                    p.rotateY(extraArgs.rotation);
                }
                else {
                    p.rotateY(rotation);
                }
                // hooks should be called after rotation
                if(extraArgs.hook){
                    extraArgs.hook.apply(this, extraArgs.hookArgs);
                }
            }
            else {
                p.rotateY(rotation);
            }
        };

        var tearDown = function(){
            p.popMatrix();
        };

        /*
         * This can be an existing function or one created with vertexShape it can also
         * be a collection of shapes which form object
         *
         * In this case it must return an array of shapes 
         */
        this.draw = function(object){
            // If not an instant of shape must be a collection of shapes
            if(object instanceof Shape){
                setUp(object.color, object.position, object.extraArgs);
                object.shapeFunction.apply(this, object.shapeArgs);
                tearDown();
            }
            else {
                object.shapes.forEach(function(shape, index, arr){
                    setUp(shape.color, shape.position, shape.extraArgs);
                    shape.shapeFunction.apply(this, shape.shapeArgs);
                    tearDown();
                });
            }
        };
     };

    function positionedTranslate(x, y, z){
        p.translate(XPos + x, YPos - y, ZPos + z);
    }

    function vertexShape(_vertices){

        // need to make mutable copy so I can remove elements when processed
        var vertices = _vertices.slice(0);

        p.beginShape();
        // draw first point
        vertices[0].draw();
        (function recursiveDraw(vertex){
            var vertexJoins = vertex.joins;
            if(vertexJoins.length > 0){
                // save joins so they can be restored fter cyling through and eliminating
                // processed joins
                var vertexJoinsCopy = vertexJoins.slice(0);
                // cycle through joins of current vertices
                vertexJoins.forEach(function(element, index, arr){
                    // if joined vertex has been processed we don't need to do it again
                    element.draw();
                    // remove the line we are about to draw
                    arr.removeAtIndex(index);
                    // Need to remove vertex from next element so it won't redraw this line
                    element.joins.remove(vertex);
                    recursiveDraw(element);
                });
                // replace with copy of joins as actual joins have all been removed
                // during processing
                vertex.joins = vertexJoinsCopy;
            }
            else{
                vertices.remove(vertex);
                var nextVertex = vertices.pop();
                if(nextVertex != undefined){
                    // draw new vertex so you get
                    nextVertex.draw();
                    recursiveDraw(nextVertex);
                }
            }
        })(vertices[0]);

        p.endShape();
    }

}
