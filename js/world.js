var DEFAULT_COLOR = 0xFFFFFF;
var GROUP_NAME = "group";

WORLD = (function(){

   var shapes = {}; 

   var rotate = 0;

   return {
       shapes : function(){
           return shapes;
       },
       setShapes : function(jsonShapes){
           shapes = {};
           // Visit non-inherited enumerable keys
           this.addShapes(jsonShapes);
       },
       addShapes : function(jsonShapes){
           Object.keys(jsonShapes).forEach(function(key) {
               this.shapes()[key] = constructShape(jsonShapes[key]);
               this.shapes()[key].name = key;
           }, this);
       },
       draw : function(p){
           p.draw(this.shapes());
       }, 
       rotate : function(degrees){
           p.rotate(degrees);
       } 
   }
});

function sketchProc(p){

    var XPos = 0.0;
    var YPos = 0.0;
    var ZPos = 0.0;

    var rotation = p.radians(0);

    var backgroundColor = 255;

    var pencil = new Pencil();

    p.plane= function(degrees){
        rotation = p.radians(degrees);
    };

    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.noLoop();
        XPos = 0;
        YPos = 0;
        ZPos = 0;
    };

    p.draw = function(shapes){
        if(shapes){
            p.background(backgroundColor);
            Object.keys(shapes).forEach(function(key) {
                pencil.draw(shapes[key]);
            });
        }
   };

   function Pencil(){

        var setUp = function(object){
            p.pushMatrix();
            if(object.color){
                p.fill(object.color);
            }
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
         * Takes a Shape object and draws it
         */
        this.draw = function(object){
            setUp(object);
            if(object.function && object.function != GROUP_NAME){
                this[object.function].apply(object, object.args);
            }
            // shape may have sub shapes which is needs to draw as well
            if(object.shapes){
                object.shapes.forEach(function(shape, index, arr){
                    this.draw(shape);
                }, this);
            }
            tearDown(object);
        }

        this.sphere = function(radius){
            p.sphere(radius);
        }

        this.box = function(x, y, z){
            p.box(x, y, z);
        }

        this.vertexShape = function(vertices){
            vertexShape(vertices);
        }

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
   };

   function positionedTranslate(x, y, z){
       p.translate(XPos + x, YPos + y, ZPos + z);
   }

   /* takes a positioned vertex object and draws to canvas */
   function draw(positionedVertex){
        p.vertex(positionedVertex.xpos, positionedVertex.ypos, positionedVertex.zpos); 
    };

}

    /*--------- functions which generate objects which can be passed to Shape -----*/

    function Shape(args){
        if(args){
            // Recursively create shapes and sub shapes
            if(args.shapes){
                this.shapes = [];
                args.shapes.forEach(function(element, index, arr){
                        element.parent = this;
                        this.shapes.push(constructShape(element));
                        }, this);
            }
            var parent = args.parent;
            this.function = args.function || GROUP_NAME; 
            this.args = args.args; 
            this.color = args.color || (function(){if(parent){return parent.color}})() || DEFAULT_COLOR;
            this.originalColor = this.color; 
            this.position = args.position; 
            // There shouldn't be any prototype object so don't need to check
            // copy all extras to object so the functions defined can be used directly on the 
            // objects
            if(args.extraArgs){
                var extraArgs = args.extraArgs;
                for (var key in extraArgs) {
                    this[key] = extraArgs[key];
                }
            }
            if(args.name){
                this.name = args.name;
            }
            else {
                this.name = this.function + " " + this.color;
            }
        }
    }
    Shape.prototype.id = null;
    Shape.prototype.name = null;
    Shape.prototype.args = null; 
    Shape.prototype.function  = null; 
    Shape.prototype.color = null; 
    Shape.prototype.originalColor = 0xFFFFFF; 
    Shape.prototype.position = null;
    Shape.prototype.shapes = null;
    Shape.prototype.extraArgs = null;
    Shape.prototype.moveVertex = function(vertexIndex, dx, dy, dz){
        this.shapeArgs[vertexIndex].move(dx, dy, dz);
    }
    Shape.prototype.setXPosition = function(xpos){
        this.position  = {xpos:xpos, ypos:this.position.ypos, zpos:this.position.zpos};
    }
    Shape.prototype.setYPosition = function(ypos){
        this.position  = {xpos:this.position.xpos, ypos:ypos, zpos:this.position.zpos};
    }
    Shape.prototype.setZPosition = function(zpos){
        this.position  = {xpos:this.position.xpos, ypos:this.position.ypos, zpos:zpos};
    }
    /* vertex object or index of vertex in vertices can be passed */
    Shape.prototype.rotateVertexX = function(vertex, zenithrad, rotationPoint){
        var rotatingVertex = typeof vertex === "number" ? this.shapeArgs[vertex] : vertex; 
        rotateX(rotatingVertex, rotationPoint, distanceFrom(rotationPoint, rotatingVertex), zenithrad);
    }
    // turns shape in to a string which can be passed about but removes functions and undefineds
    Shape.prototype.stringify = function(){
        var str = "";
        (function innerStringify(object, str){
            str += "{";
            for (var p in object) {
                if (object.hasOwnProperty(p)) {
                    if(typeof object[p] != "function") {
                        if(typeof object[p] == "object") {
                            str += p + ":" + innerStringify(object[p], str) + ",";
                        }
                        else {
                            str += p + ":" + object[p] + ",";
                        }
                    }
                }
            }
            str += "}";
        })(this, str);
        return str;
    }
    Shape.prototype.arrayify = function(){
        return [this.id, this.name, this.originalColor];
    }
    Shape.prototype.resize = function(percentage){
        this.args.forEach(function(element, index, arr){
            if(element instanceof Array){
                element.forEach(function(element){
                    exaggerate(element, percentage);
                });
            }
            else{
                arr[index] = element * (percentage/100);
            }
        });
    }

    VertexShape.prototype = new Shape();
    function VertexShape(args){
        Shape.call(this, args);
        this.selectedVertex = this.args[0][0];
    }
    VertexShape.prototype.selectedVertex = null;
    VertexShape.prototype.selectVertex = function(index){
        this.selectedVertex = this.args[index]
    };
    VertexShape.prototype.setSelectedVertexXPos = function(xpos){
        this.selectedVertex.xpos = xpos;
    };
    VertexShape.prototype.setSelectedVertexYPos = function(ypos){
        this.selectedVertex.ypos = ypos;
    };
    VertexShape.prototype.setSelectedVertexZPos = function(zpos){
        this.selectedVertex.zpos = zpos;
    };

    function constructShape(args){
        if(args.function == "vertexShape"){
            return new VertexShape(args); 
        }
        else {
            return new Shape(args);
        }
    }

    function shape(position, color, drawFunction, args){
       return { color : color, 
                position : position, 
                args : args,
                function : drawFunction
       };
    };

    function sphere(position, rsize, color, extraArgs){
       var sphere = shape(position, color, "sphere", [rsize]);
       sphere.extraArgs = extraArgs; 
       return sphere;
    };

    function box(position, xsize, ysize, zsize, color, extraArgs){
       var box = shape(position, color, "box", [xsize, ysize, zsize]);
       box.extraArgs = extraArgs; 
       return box;
    };

    function body(xpos, ypos, zpos, xsize, ysize, zsize, color){
        var position = {xpos:xpos, ypos:ypos, zpos:zpos};
        return box(position, xsize, ysize, zsize, color, {});
    };

    function head(xpos, ypos, zpos, rsize, color){
        var position = {xpos:xpos, ypos:ypos, zpos:zpos};
        return sphere(position, rsize, color, {});
    };

    function spinningSphere(xpos, ypos, zpos, rsize, color){
        var extraArgs = {
            /*
            hook : function(){
                this.r += 0.01;
                p.rotateX(p.cos(rotation)*this.r);
                p.rotateZ(p.sin(rotation)*this.r);
            }, 
            hookArgs : [],
            rotation : 0,
            r : 0.0
            */
        };
        var position = {xpos:xpos, ypos:ypos, zpos:zpos};
        return sphere(position, rsize, color, extraArgs);
    };

    function verticalPyramid(r, l, color, position, extraArgs){

        var point = {xpos:0, ypos:l/2, zpos:0, name:"point"};
        var b1 = {xpos:+r, ypos:-l/2, zpos:-r, name:"b1"};
        var b2 = {xpos:+r, ypos:-l/2, zpos:+r, name:"b2"};
        var b3 = {xpos:-r, ypos:-l/2, zpos:+r, name:"b3"};
        var b4 = {xpos:-r, ypos:-l/2, zpos:-r, name:"b4"};

        point.joins = [b1, b2, b3, b4];
        b1.joins = [point, b4, b2];
        b2.joins = [point, b1, b3];
        b3.joins = [point, b2, b4];
        b4.joins = [point, b3, b1];

        extraArgs.rotationPoint  = {xpos:0, ypos:-l/2, zpos:0, name:"rp"};

        extraArgs.rotatePointX = function(zenithrad){
            this.rotateVertexX(point, zenithrad, this.rotationPoint);
        };

        var pyramid  = shape(position, color, "vertexShape", [[point, b1, b2, b3, b4]]);
        pyramid.extraArgs = extraArgs;
        return pyramid;
    };    
  
    function leg(xpos, ypos, zpos, color){
        var position = {xpos:xpos, ypos:ypos, zpos:zpos};
        extraArgs = {
            steprad : Math.PI/4,
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
        return verticalPyramid(10, 40, color, position, extraArgs);
    };

    function legs(xpos, ypos, zpos, color){
        var position = {xpos:xpos, ypos:ypos, zpos:zpos};

        // var leftLeg = leg(p.cos(-rotation)*(10), 0, p.sin(-rotation)*(10), color);
        // var rightLeg = leg(p.cos(-rotation)*(-10), 0, p.sin(-rotation)*(-10), color);
        var leftLeg = leg(10, 0, 0);
        var rightLeg = leg(-10, 0, 0);

        var legs = shape(position, color);
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

    function move(vertex, dx, dy, dz){
        vertex.xpos += dx;
        vertex.ypos += dy;
        vertex.zpos += dz;
    };

    function rotate(vertex, xopos, yopos, zopos, radius, zenithrad, azimuthrad){
        // our y direction is treated as z in spherical coords 
        vertex.xpos = xopos + radius*Math.cos(azimuthrad)*Math.sin(zenithrad);
        vertex.ypos = yopos + radius*Math.cos(zenithrad);
        vertex.zpos = zopos + radius*Math.sin(azimuthrad)*Math.sin(zenithrad);
    };

    function rotateX(vertex, rp, radius, zenithrad){
        rotate(vertex, rp.xpos, rp.ypos, rp.zpos, radius, zenithrad, Math.PI/2);
    };

    function rotateY(vertex, xopos, yopos, zopos, radius, azimuthrad){
        rotate(vertex, xopos, yopos, zopos, radius, Math.PI/2, azimuthrad);
    };

    function rotateZ(vertex, xopos, yopos, zopos, radius, zenithrad){
        rotate(vertex, xopos, yopos, zopos, radius, zenithrad, 0);
    };

    function distanceFrom(vertexA, vertexB){
        return Math.sqrt(Math.pow(vertexA.xpos - vertexB.xpos, 2) + Math.pow(vertexA.ypos - vertexB.ypos, 2)
                + Math.pow(vertexA.zpos - vertexB.zpos, 2));
    };

    function exaggerate(vertex, percentage){
        vertex.xpos *= (percentage/100);
        vertex.ypos *= (percentage/100);
        vertex.zpos *= (percentage/100);
    }
