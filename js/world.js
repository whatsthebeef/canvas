function sketchProc(p){
    p.setup = function(){
        p.size(600, 400, p.OPENGL);
        p.noLoop();
    };
    p.draw = function(){
    };
}

WORLD = (function(){

    var DEFAULT_COLOR = 0xFFFFFF;
    var GROUP_NAME = "group";

    var XPos = 0.0;
    var YPos = 0.0;
    var ZPos = 0.0;

    var world = this;

    var backgroundColor = 255;

    var _rotation = 0;

     /*--------- functions which generate objects which can be passed to Shape -----*/
    function Shape(args){
        if(args){
            this.function = args.function || GROUP_NAME; 
            this.args = args.args; 
            this.color = args.color || DEFAULT_COLOR;
            this.originalColor = this.color; 
            this.position = args.position; 
            this.id = args.id; 
            this.parent = args.parent;
            // There shouldn"t be any prototype object so don"t need to check
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
            // Recursively create shapes and sub shapes
            this.setChildShapes(args.shapes);
        }
    }
    Shape.prototype.id = null;
    Shape.prototype.parent = null;
    Shape.prototype.name = null;
    Shape.prototype.args = null; 
    Shape.prototype.function  = null; 
    Shape.prototype.color = null; 
    Shape.prototype.originalColor = 0xFFFFFF; 
    Shape.prototype.position = null;
    Shape.prototype.shapes = null;
    Shape.prototype.extraArgs = null;
    Shape.prototype.setChildShapes = function(jsonShapes){
        // Recursively create shapes and sub shapes
        this.shapes = {};
        if(jsonShapes){
            Object.keys(jsonShapes).forEach(function(key){
                jsonShapes[key].parent = this.name;
                jsonShapes[key].name = key;
                this.shapes[key] = constructShape(jsonShapes[key]);
            }, this);
        }
    }
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
    // turns shape in to a string which can be passed about but removes functions and undefineds
    Shape.prototype.stringify = function stringify(){
        return JSON.stringify(this, null, 4);
    }
    Shape.prototype.arrayify = function(){
        return [this.id, this.name, this.position.xpos, this.position.ypos, this.position.zpos];
    }
    Shape.prototype.resize = function(percentage){
        this.args.forEach(function(element, index, arr){
            if(element instanceof Array){
                element.forEach(function(element){
                    WORLD.exaggerate(element, percentage);
                });
            }
            else{
                arr[index] = element * (percentage/100);
            }
        });
    };
    Shape.prototype.addShapes = function(jsonShapes){
        if(jsonShapes){
            Object.keys(jsonShapes).forEach(function(key){
                jsonShapes[key].parent = this.name;
                jsonShapes[key].name = key;
                this.shapes[key] = constructShape(jsonShapes[key]);
            }, this);
        }
    };
    Shape.prototype.addShape = function(name, shape){
        if(!this.shape){
            this.shapes = {}
        }
        this.shapes[name] = shape;
    };


    VertexShape.prototype = new Shape();
    function VertexShape(args){
        Shape.call(this, args);
        this.selectedVertex = this.args[0][0];
    }
    VertexShape.prototype.selectedVertex = null;
    VertexShape.prototype.selectVertex = function(index){
        this.selectedVertex = this.args[0][index];
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
    /* vertex object or index of vertex in vertices can be passed */
    VertexShape.prototype.rotateVertexX = function(vertex, zenithrad, rotationPoint){
        var rotatingVertex = typeof vertex === "number" ? this.shapeArgs[vertex] : vertex; 
        rotateX(rotatingVertex, rotationPoint, distanceFrom(rotationPoint, rotatingVertex), zenithrad);
    };

    World.prototype = new Shape();
    function World(p, args){
        this.p = p;
        Shape.call(this, args);
    };
    World.prototype.p = null;
    World.prototype.world = null;
    World.prototype.currentIDAssignment = 0;
    World.prototype.draw = function(){
        if(this.shapes){
            p.background(backgroundColor);
            Object.keys(this.shapes).forEach(function(key) {
                pencil.draw(this.shapes[key]);
            }, this);
        }
    };
    World.prototype.rotate = function(){
       this.p.rotate(degrees);
    };

    function Pencil(processingInstance){

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
                p.rotateY(_rotation);
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
                Object.keys(object.shapes).forEach(function(key){
                    this.draw(object.shapes[key]);
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
                     // save joins so they can be restored after cyling through and eliminating
                     // processed joins
                     var vertexJoinsCopy = vertexJoins.slice(0);
                     // cycle through joins of current vertices
                     vertexJoins.forEach(function(element, index, arr){
                         var joinVertex = vertices[element]; 
                         // if joined vertex has been processed we don"t need to do it again
                         draw(joinVertex);
                         // remove the line we are about to draw
                         arr.removeAtIndex(index);
                         // Need to remove vertex from next element so it won't redraw this line
                         joinVertex.joins.remove(vertices.indexOf(vertex));
                         recursiveDraw(joinVertex);
                        });
                    // replace with copy of joins as actual joins have all been removed
                    // during processing
                    vertex.joins = vertexJoinsCopy;
                 }
                 else {
                     // no joins and it's been drawn so can be set to null
                     vertices[vertices.indexOf(vertex)] = -1;
                     // get next vertices
                     var i = 0;
                     var nextVertex = null;
                     do {
                        nextVertex = vertices[i++];
                     }
                     while(nextVertex == -1 && nextVertex != undefined);

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

    var p = null; 

    var pencil = new Pencil();

    var currentIDAssignment = 0;

    var getAssignedID = function(){
       return currentIDAssignment++;
    };

    var world = new World();


    var constructShape = function(args){
        args.id = getAssignedID();
        if(args.function == "vertexShape"){
            return new VertexShape(args); 
        }
        else {
            return new Shape(args);
        }
    };

    var positionedTranslate = function(x, y, z){
        p.translate(XPos + x, YPos + y, ZPos + z);
    }

    /* takes a positioned vertex object and draws to canvas */
    var draw = function(positionedVertex){
        p.vertex(positionedVertex.xpos, positionedVertex.ypos, positionedVertex.zpos); 
    };

    return {
       rotation : function(){
           return _rotation;
       },
       setRotation : function(degrees){
           _rotation = p.radians(degrees);
       },
       setProcessingInstance : function(processingInstance){
           return p = processingInstance;
       },
       shapes : function(){
           return world.shapes;
       },
       setChildShapes : function(jsonShapes){
           world.setChildShapes(jsonShapes);
       },
       addShapes : function(jsonShapes){
           world.addShapes(jsonShapes);
       },
       draw : function(){
           world.draw();
       }, 
       rotate : function(degrees){
           world.rotate(degrees);
       }, 
       getAssignedID : function(){
           return currentIDAssignment++;
       },
       world : function(){
           return world;
       },
       move : function (vertex, dx, dy, dz){
            vertex.xpos += dx;
            vertex.ypos += dy;
            vertex.zpos += dz;
       },
       rotate : function(vertex, xopos, yopos, zopos, radius, zenithrad, azimuthrad){
           // our y direction is treated as z in spherical coords 
           vertex.xpos = xopos + radius*Math.cos(azimuthrad)*Math.sin(zenithrad);
           vertex.ypos = yopos + radius*Math.cos(zenithrad);
           vertex.zpos = zopos + radius*Math.sin(azimuthrad)*Math.sin(zenithrad);
       },
       rotateX : function(vertex, rp, radius, zenithrad){
           this.rotate(vertex, rp.xpos, rp.ypos, rp.zpos, radius, zenithrad, Math.PI/2);
       },
       rotateY : function(vertex, xopos, yopos, zopos, radius, azimuthrad){
           this.rotate(vertex, xopos, yopos, zopos, radius, Math.PI/2, azimuthrad);
       },
       rotateZ : function(vertex, xopos, yopos, zopos, radius, zenithrad){
           this.rotate(vertex, xopos, yopos, zopos, radius, zenithrad, 0);
       },
       distanceFrom : function(vertexA, vertexB){
           return Math.sqrt(Math.pow(vertexA.xpos - vertexB.xpos, 2) + Math.pow(vertexA.ypos - vertexB.ypos, 2)
                  + Math.pow(vertexA.zpos - vertexB.zpos, 2));
       },
       addCoords : function(coordsA, coordsB){
           return {xpos:coordsA.xpos + coordsB.xpos, ypos:coordsA.ypos 
               + coordsB.ypos, zpos:coordsA.zpos + coordsB.zpos};
       },
       exaggerate : function(vertex, percentage){
           vertex.xpos *= (percentage/100);
           vertex.ypos *= (percentage/100);
           vertex.zpos *= (percentage/100);
       }
    }
})();


