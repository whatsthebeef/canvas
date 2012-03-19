
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
        this.xpos = xpos;
        this.ypos = ypos;
        this.zpos = zpos;
        this.joins = [];
        this.vname = vname || "default";
    };

    function Shape(args){
        if(args.shapes){
            this.shapes = [];
            args.shapes.forEach(function(element, index, arr){
                    this.shapes.push(new Shape(element));
                    }, this);
        }
        this.function = args.function; 
        this.args = args.args; 
        this.color = args.color; 
        this.originalColor = args.color; 
        this.position = args.position; 
        // There shouldn't be any prototype object so don't need to check
        if(args.extraArgs){
            var extraArgs = args.extraArgs;
            for (var key in extraArgs) {
                this[key] = extraArgs[key];
            }
        }
    }
    Shape.prototype.args = null; 
    Shape.prototype.function  = null; 
    Shape.prototype.color = null; 
    Shape.prototype.originalColor = null; 
    Shape.prototype.position = null;
    Shape.prototype.shapes = null;
    Shape.prototype.extraArgs = null;
    Shape.prototype.moveVertex = function(vertexIndex, dx, dy, dz){
        this.shapeArgs[vertexIndex].move(dx, dy, dz);
    }
    /* vertex object or index of vertex in vertices can be passed */
    Shape.prototype.rotateVertexX = function(vertex, zenithrad, rotationPoint){
        var rotatingVertex = typeof vertex === "number" ? this.shapeArgs[vertex] : vertex; 
        rotateX(rotatingVertex, rotationPoint, distanceFrom(rotationPoint, rotatingVertex), zenithrad);
    }

    function common(position, color, drawFunction, args){
       return { color : color, 
                position : position, 
                args : args,
                function : drawFunction
       };
    };

    function sphere(position, rsize, color, extraArgs){
       var sphere = common(position, color, function(radius){p.sphere(radius);}, [rsize]);
       sphere.extraArgs = extraArgs; 
       return sphere;
    };

    function box(position, xsize, ysize, zsize, color, extraArgs){
       var box = common(position, color, function(x,y,z){p.box(x,y,z);}, [xsize, ysize, zsize]);
       box.extraArgs = extraArgs; 
       return box;
    };

    function body(xpos, ypos, zpos, xsize, ysize, zsize, color){
        var position = new LinkedVertex(xpos, ypos, zpos);
        return box(position, xsize, ysize, zsize, color, {});
    };

    function head(xpos, ypos, zpos, rsize, color){
        var position = new LinkedVertex(xpos, ypos, zpos);
        return sphere(position, rsize, color, {});
    };

    function world(xpos, ypos, zpos, rsize, color){
        var extraArgs = {
            hook : function(){
                this.r += 0.01;
                p.rotateX(p.cos(rotation)*this.r);
                p.rotateZ(p.sin(rotation)*this.r);
            }, 
            hookArgs : [],
            rotation : 0,
            r : 0.0, 
        };
        var position = new LinkedVertex(xpos, ypos, zpos);
        return sphere(position, rsize, color, extraArgs);
    };

    function verticalPyramid(r, l, color, position, extraArgs){

        var point = new LinkedVertex(0, l/2, 0, "point");
        var b1 = new LinkedVertex(+r, -l/2, -r, "b1");
        var b2 = new LinkedVertex(+r, -l/2, +r, "b2");
        var b3 = new LinkedVertex(-r, -l/2, +r, "b3");
        var b4 = new LinkedVertex(-r, -l/2, -r, "b4");

        extraArgs.rotationPoint  = new LinkedVertex(0, -l/2, 0, "rp");

        point.joins = [b1, b2, b3, b4];
        b1.joins = [point, b4, b2];
        b2.joins = [point, b1, b3];
        b3.joins = [point, b2, b4];
        b4.joins = [point, b3, b1];

        extraArgs.rotatePointX = function(zenithrad){
                this.rotateVertexX(point, zenithrad, this.rotationPoint);
        };

        var pyramid  = common(position, color, vertexShape, [[point, b1, b2, b3, b4]]);
        pyramid.extraArgs = extraArgs;
        return pyramid;
    };    
  
    function leg(xpos, ypos, zpos, color){
        var _position = new LinkedVertex(xpos, ypos, zpos);
        extraArgs = {
            steprad : p.PI/4,
            step : function(rad){
                this.rotatePointX(rad);
            },
            stepForward : function(){
                this.step(this.steprad);
            },
            stepBack : function(){
                this.step(-1*this.steprad);
            },
            center : function(){
                this.step(0);
            },
            rotation : 0
        }
        return verticalPyramid(10, 40, color, _position, extraArgs);
    };

    function legs(xpos, ypos, zpos, color){
        var position = new LinkedVertex(xpos, ypos, zpos);

        // var leftLeg = leg(p.cos(-rotation)*(10), 0, p.sin(-rotation)*(10), color);
        // var rightLeg = leg(p.cos(-rotation)*(-10), 0, p.sin(-rotation)*(-10), color);
        var leftLeg = leg(10, 0, 0, color);
        var rightLeg = leg(-10, 0, 0, color);

        var legs = common(position, color);
        legs.shapes = [leftLeg, rightLeg];

        legs.extraArgs = {
            RIGHT_FOOT_FORWARD : 0,
            LEFT_FOOT_FORWARD : 1,
            state : 0,
            walk : function() {
                var leftLeg = this.shapes[0];
                var rightLeg = this.shapes[1];
                switch(this.state) {
                    case this.LEFT_FOOT_FORWARD:
                        leftLeg.stepBack();
                        rightLeg.stepForward();
                        this.state = this.RIGHT_FOOT_FORWARD;
                        break;
                    case this.RIGHT_FOOT_FORWARD:
                        rightLeg.stepBack();
                        leftLeg.stepForward();
                        this.state = this.LEFT_FOOT_FORWARD;
                        break;
                    default:
                        leftLeg.stepForward();
                        rightLeg.stepBack();
                        this.state = this.LEFT_FOOT_FORWARD;
                        break;
                }
            }
        };
        return legs;
    };

    var SELECTION_COLOR = 0xFF0000;

    var XPos = 0.0;
    var YPos = 0.0;
    var ZPos = 0.0;

    var rotation = p.radians(0);

    var backgroundColor = 255;

    var head = new Shape(head(300, 100, 0, 20));
    var body = new Shape(body(300, 140, 0, 40, 40, 20, 80));
    var legs = new Shape(legs(300, 180, 0, 255));
    var world = new Shape(world(300, 400, 0, 200, 255));
    var pencil = new Pencil();

    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.frameRate(1);
        // p.noLoop();
        XPos = 0;
        YPos = 0;
    };

    p.draw = function(){
        p.background(backgroundColor);
        pencil.draw(head);
        pencil.draw(body);
        legs.walk();
        pencil.draw(legs);
        pencil.draw(world);
   };

    var objectRegister = (function(){
        var drawnObjects = [];
        var selectedObject = null;
        var objectSelect = function(object){
            selectedObject = object;
            selectedObject.color = SELECTION_COLOR;
            p.draw();
        };
        return {
            add : function(object){
                drawnObjects.push(object);
            },
            remove : function(object){
                drawnObjects.remove(object);
            },
            clear : function(){
                drawnObjects = [];
            },
            select : function(x, y){
                drawnObjects.forEach(function(element, index, arr){
                    if(Math.sqrt(Math.pow(element.position.xpos - (x - XPos), 2)) < 10 &&
                        Math.sqrt(Math.pow(element.position.ypos - y, 2)) < 10) {
                        if(selectedObject){
                            if(selectedObject != element) {
                                selectedObject.color = selectedObject.originalColor;
                                objectSelect(element);
                            }
                        }
                        else {
                            objectSelect(element);
                        }
                    }
                });
            },
            currentSelection : function(){
                return selectedObject;
            }
        }
    })();

    var monitorMouse = (function(p, objectReg){

        var dragged = false;

        var objectReg = objectReg;

        p.mousePressed = function(){
            objectReg.select(p.mouseX, p.mouseY);
        }

        p.mouseDragged = function(){
            dragged = true;
        }

        p.mouseReleased = function(){
            if(dragged){
                objectReg.currentSelection().position = new LinkedVertex(p.mouseX, p.mouseY, 0);
                p.draw();
            }
            dragged = false;
        }

    })(p, objectRegister);

   function Pencil(){

        var setUp = function(object){
            p.pushMatrix();
            p.fill(object.color);
            var position = object.position;
            if(position){
                positionedTranslate(position.xpos, position.ypos, position.zpos);
            }
            if(object.rotation != undefined){
                p.rotateY(object.rotation);
            }
            else {
                p.rotateY(rotation);
            }
            // hooks should be called after rotation
            if(object.hook){
                 object.hook.apply(object, extraArgs.hookArgs);
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
            setUp(object);
            if(object.function){
                object.function.apply(object, object.args);
            }
            if(object.shapes){
                object.shapes.forEach(function(shape, index, arr){
                    this.draw(shape);
                }, this);
            }
            tearDown(object);
            objectRegister.add(object);
        };
     };

    function positionedTranslate(x, y, z){
        p.translate(XPos + x, YPos + y, ZPos + z);
    }

    /* takes a positioned vertex object and draws to canvas */
    function draw(positionedVertex){
        p.vertex(positionedVertex.xpos, positionedVertex.ypos, positionedVertex.zpos); 
    };

    function move(vertex, dx, dy, dz){
        vertex.xpos += dx;
        vertex.ypos += dy;
        vertex.zpos += dz;
    };

    function rotate(vertex, xopos, yopos, zopos, radius, zenithrad, azimuthrad){
        // our y direction is treated as z in spherical coords 
        vertex.xpos = xopos + radius*p.cos(azimuthrad)*p.sin(zenithrad);
        vertex.ypos = yopos + radius*p.cos(zenithrad);
        vertex.zpos = zopos + radius*p.sin(azimuthrad)*p.sin(zenithrad);
    };

    function rotateX(vertex, rp, radius, zenithrad){
        rotate(vertex, rp.xpos, rp.ypos, rp.zpos, radius, zenithrad, p.PI/2);
    };

    function rotateY(vertex, xopos, yopos, zopos, radius, azimuthrad){
        rotate(vertex, xopos, yopos, zopos, radius, p.PI/2, azimuthrad);
    };

    function rotateZ(vertex, xopos, yopos, zopos, radius, zenithrad){
        rotate(vertex, xopos, yopos, zopos, radius, zenithrad, 0);
    };

    function distanceFrom(vertexA, vertexB){
        return Math.sqrt(Math.pow(vertexA.xpos - vertexB.xpos, 2) + Math.pow(vertexA.ypos - vertexB.ypos, 2)
                + Math.pow(vertexA.zpos - vertexB.zpos, 2));
    };

    function vertexShape(_vertices){

        // need to make mutable copy so I can remove elements when processed
        var vertices = _vertices.slice(0);

        p.beginShape();
        // draw first point
        draw(vertices[0]);
        (function recursiveDraw(vertex){
            var vertexJoins = vertex.joins;
            if(vertexJoins.length > 0){
                // save joins so they can be restored fter cyling through and eliminating
                // processed joins
                var vertexJoinsCopy = vertexJoins.slice(0);
                // cycle through joins of current vertices
                vertexJoins.forEach(function(element, index, arr){
                    // if joined vertex has been processed we don't need to do it again
                    draw(element);
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
                    draw(nextVertex);
                    recursiveDraw(nextVertex);
                }
            }
        })(vertices[0]);

        p.endShape();
    }

}
