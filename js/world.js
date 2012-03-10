
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

    var XPos = 0.0;
    var YPos = 0.0;
    var ZPos = 0.0;

    var rotation = p.radians(45);

    var backgroundColor = 255;

    var legs = new Legs(0, 220, 0, rotation, 180);
    var body = new Body(0, 260, 0, 40, 40, 20, 80, rotation);
    var world = new World(0, 0, 0, 200, 255, rotation);
    var head = new Head(0, 300, 0, 20);
    var pencil = new Pencil();

    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.frameRate(1);
        p.background(backgroundColor);
        XPos = p.width/2;
        YPos = p.height;
    };

    p.draw = function(){

        p.background(backgroundColor);

        head.draw();

        body.draw();

        legs.walk();

        world.turn();
    };

    function Head(xpos, ypos, zpos, rsize, color){
        var _head = new Sphere(xpos, ypos, zpos, rsize, color);

        this.draw = function(){
            _head.draw();
        };
    };

    function World(xpos, ypos, zpos, rsize, color, rotate){
        var _world = new Sphere(xpos, ypos, zpos, rsize, color, rotate);

        this.turn = function(){
            _world.rotateDraw();
        };
    };
    
    function Sphere(xpos, ypos, zpos, rsize, color, rotate){

        var r = 0.0;
        var _xpos = xpos; 
        var _ypos = ypos; 
        var _zpos = zpos; 
        var _rsize = rsize;
        var _color = color;
        var _rotate = rotate;

        this.draw = function(){
            p.fill(_color);
            p.pushMatrix();
            positionedTranslate(_xpos, _ypos, _zpos);
            p.sphere(_rsize);
            p.popMatrix();
        };

        this.rotateDraw = function(){
            p.fill(_color);
            r += 0.01;
            p.pushMatrix();
            positionedTranslate(_xpos, _ypos, _zpos);
            p.rotateX(p.cos(_rotate)*r);
            p.rotateZ(p.sin(_rotate)*r);
            p.sphere(_rsize);
            p.popMatrix();
        };
    };

    function Body(xpos, ypos, zpos, xsize, ysize, zsize, colour, rotate){

        var _colour = colour;
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _xsize = xsize;
        var _ysize = ysize;
        var _zsize = zsize;
        var _rotate = rotate;

        this.draw = function(){
            p.fill(_colour);
            p.pushMatrix();
            positionedTranslate(_xpos, _ypos, _zpos);
            p.rotateY(_rotate);
            p.box(_xsize, _ysize, _zsize);
            p.popMatrix();
        };
    };

    function Pencil(){

        this.prepare = function(color){
            p.fill(color);
            p.rotateY(rotation);
        };

        this.draw = function(_vertices, color){

            this.prepare(color);

            // need to make mutable copy so I can remove elements when processed
            var vertices = _vertices.slice(0);

            p.beginShape();
            // draw first point
            vertices[0].draw();
            (function recursiveDraw(vertex){
                var vertexJoins = vertex.joins();
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
                        element.joins().remove(vertex);
                        recursiveDraw(element);
                    });
                    // replace with copy of joins as actual joins have all been removed
                    // during processing
                    vertex.setJoins(vertexJoinsCopy);
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

        var leftLeg = new Leg(p.cos(-rotate)*(_xpos + 10), _ypos, p.sin(-rotate)*(_zpos + 10), rotate, color);
        var rightLeg = new Leg(p.cos(-rotate)*(_xpos + -10), _ypos, p.sin(-rotate)*(_zpos + -10), rotate, color);

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

    function Leg(xpos, ypos, zpos, rotate, color){

        var _steprad = p.PI/4;

        var _color = color;
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _rotate = rotate;
        var _vp = new VerticalPyramid(10, 40);

        this.draw = function(){
            p.pushMatrix();
            positionedTranslate(_xpos, _ypos, _zpos);
            pencil.draw(_vp.vertices(), color);
            p.popMatrix();
        };

        this.step = function(rad){
            _vp.rotatePointX(rad);
            this.draw();
        };

        this.stepForward = function(){
            this.step(_steprad);
        };

        this.stepBack = function(){
            this.step(-1*_steprad);
        };

        this.center = function(){
            this.step(0);
        };
    };


    function linkedVertex(xpos, ypos, zpos, vname){
        var _vname = vname || "default";
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _joins = [];

        return {
            name : _vname,
            xpos : function(){
                return _xpos; 
            },
            ypos : function(){
                return _ypos; 
            },
            zpos : function(){
                return _zpos; 
            },
            setXPos : function(xpos){
                _xpos = xpos; 
            },
            setYPos : function(ypos){
                _ypos = ypos; 
            },
            setZPos : function(zpos){
                _zpos = zpos; 
            },
            joins : function(){
                return _joins;
            },
            setJoins : function(joinsArray){
                _joins = joinsArray;
            }, 
            draw : function(){
                // console.log(_vname);
                p.vertex(this.xpos(), this.ypos(), this.zpos()); 
            },
            move : function(dx, dy, dz){
                _xpos = xpos + dx;
                _ypos = ypos + dy;
                _zpos = zpos + dz;
            },
            rotate : function(xopos, yopos, zopos, radius, zenithrad, azimuthrad){
                // our y direction is treated as z in spherical coords 
                this.setXPos(xopos + radius*p.cos(azimuthrad)*p.sin(zenithrad));
                this.setYPos(yopos + radius*p.cos(zenithrad));
                this.setZPos(zopos + radius*p.sin(azimuthrad)*p.sin(zenithrad));
            },
            rotateX : function(rp, radius, zenithrad){
                this.rotate(rp.xpos(), rp.ypos(), rp.zpos(), radius, zenithrad, p.PI/2);
            },
            rotateY : function(xopos, yopos, zopos, radius, azimuthrad){
                this.rotate(xopos, yopos, zopos, radius, p.PI/2, azimuthrad);
            },
            rotateZ : function(xopos, yopos, zopos, radius, zenithrad){
                this.rotate(xopos, yopos, zopos, radius, zenithrad, 0);
            },
            distanceFrom : function(vertex){
                return Math.sqrt(Math.pow(vertex.xpos() - this.xpos(), 2) + Math.pow(vertex.ypos() - this.ypos(), 2)
                            + Math.pow(vertex.zpos() - this.zpos(), 2));
            }
        };
    };

    function positionedTranslate(x, y, z){
        p.translate(XPos + x, YPos - y, ZPos + z);
    }

    function Shape(vertices, rotationPoint){

        var _vertices = vertices; 

        var _rp  = rotationPoint; 

        this.vertices = function(){
            return _vertices;
        }

        this.moveVertex = function(vertexIndex, dx, dy, dz){
            _vertices[vertexIndex].move(dx, dy, dz);
        }

        /* vertex object or index of vertex in vertices can be passed */
        this.rotateVertexX = function(vertex, zenithrad, rotationPoint){
            var rotatingVertex = typeof vertex === "number" ? _vertices[vertex] : vertex; 
            rotatingVertex.rotateX(rotationPoint || _rp, _rp.distanceFrom(vertex), zenithrad);
        }
    }

    function VerticalPyramid(r, l){

        var point = linkedVertex(0, l/2, 0, "point");
        var b1 = linkedVertex(+r, -l/2, -r, "b1");
        var b2 = linkedVertex(+r, -l/2, +r, "b2");
        var b3 = linkedVertex(-r, -l/2, +r, "b3");
        var b4 = linkedVertex(-r, -l/2, -r, "b4");
        var rotationPoint  = linkedVertex(0, -l/2, 0, "rp");
        var shape = new Shape([point, b1, b2, b3, b4], rotationPoint);

        point.setJoins([b1, b2, b3, b4]);
        b1.setJoins([point, b4, b2]);
        b2.setJoins([point, b1, b3]);
        b3.setJoins([point, b2, b4]);
        b4.setJoins([point, b3, b1])

        this.vertices = function(){
            return shape.vertices();
        };

        this.rotatePointX = function(zenithrad){
            shape.rotateVertexX(point, zenithrad);
        };
    };    
}
