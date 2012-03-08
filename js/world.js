
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
    var r = 0.0;
    var v1 = 0;
    var d1 = 1;
    var v2 = 0;
    var d2 = 1;
    var zpoint = 0;

    var rotation = p.radians(45);

    var rightLeg = new Leg(10, 220, 10, rotation, 180);
    var leftLeg = new Leg(-10, 220, -10, rotation, 100);
    var body = new Body(0, 260, 0, 40, 40, 20, 80, rotation);

    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.frameRate(1);
        XPos = p.width/2;
        YPos = p.height;
    };

    p.draw = function(){

        p.background(255);

        head(0, 300, 0, 20);

        body.draw();

        rightLeg.draw();
        leftLeg.draw();

        world(0, 0, 0, 200, 255, rotation);
    }


    var head = function(xpos, ypos, zpos, rsize){
        p.pushMatrix();
        positionedTranslate(xpos, ypos, zpos);
        p.sphere(rsize);
        p.popMatrix();
    }

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
        }
    }

    function Leg(xpos, ypos, zpos, rotate, colour){
        var _colour = colour;
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _rotate = rotate;
        var vp = new VerticalPyramid(10, 40);

        this.draw = function(){
            p.fill(_colour);
            p.pushMatrix();
            positionedTranslate(p.cos(-rotate)*_xpos, _ypos, p.sin(-rotate)*_zpos);
            p.rotateY(_rotate);
            vp.draw();
            p.popMatrix();
        }

    }

    var world = function(xpos, ypos, zpos, rsize, color, rotate){
        p.fill(color);
        r += 0.01;
        p.pushMatrix();
        positionedTranslate(xpos, ypos, zpos);
        p.rotateX(p.cos(rotate)*r);
        p.rotateZ(p.sin(rotate)*r);
        p.sphere(rsize);
        p.popMatrix();
    }

    var positionedVertex = function(x, y, z){
        p.vertex(x, y, z); 
    }

    function linkedVertex(xpos, ypos, zpos, vname){
        var vname = vname || "default";
        var _xpos = xpos;
        var _ypos = ypos;
        var _zpos = zpos;
        var _joins = [];
        return {
            name : vname,
                 joins : function(){
                     return _joins;
                 },
                 setJoins : function(joinsArray){
                                _joins = joinsArray;
                            }, 
                 draw : function(){
                            // console.log(element.name);
                            p.vertex(_xpos, _ypos, _zpos); 
                        },
                 move : function(dx, dy, dz){
                            _x = xpos + dx;
                            _y = ypos + dy;
                            _z = zpos + dz;
                        },
                 rotate : function(xopos, yopos, zopos, radius, zenithrad, azimuthrad){
                              _x = xopos + radius*p.cos(azimuthrad)*p.sin(zenithrad);
                              _y = yopos + radius*p.sin(azimuthrad)*p.sin(zenithrad);
                              _z = zopos + radius*p.cos(zenithrad);
                          },
                 rotateX : function(degrees, radius){
                           },
                 rotateY : function(){
                           },
                 rotateZ : function(){
                           }
        };
    };

    function positionedTranslate(x, y, z){
        p.translate(XPos + x, YPos - y, 0 + z);
    }

    function Shape(vertices){

        var _vertices = vertices; 

        this.draw = function(){

            // need to make mutable copy so I can remove elements when processed
            var vertices = _vertices.slice(0);

            p.beginShape();
            // draw first point
            vertices[0].draw();
            (function recursiveDraw(vertex){
                var vertexJoins = vertex.joins();
                if(vertexJoins.length > 0){
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

        function moveVertex(vertexIndex, dx, dy, dz){
            _vertices[vertexIndex].move(dx, dy, dz);
        }
    }

    function VerticalPyramid(r, l){

        var point = linkedVertex(0, l/2, 0, "point");
        var b1 = linkedVertex(+r, -l/2, -r, "b1");
        var b2 = linkedVertex(+r, -l/2, +r, "b2");
        var b3 = linkedVertex(-r, -l/2, +r, "b3");
        var b4 = linkedVertex(-r, -l/2, -r, "b4");
        var shape = new Shape([point, b1, b2, b3, b4]);

        point.setJoins([b1, b2, b3, b4]);
        b1.setJoins([point, b4, b2]);
        b2.setJoins([point, b1, b3]);
        b3.setJoins([point, b2, b4]);
        b4.setJoins([point, b3, b1]);

        this.draw = function(){
            shape.draw();
        }

        this.rotatePointX = function(){
            point.rotate(0, -l/2, 0, l, 90, 90);  
            shape.draw();
        }
    }    
}

