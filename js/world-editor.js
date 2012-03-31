WORLD_EDITOR = (function(processingInstance, jQuery){

    jQuery.Event("shapeselected");

    jQuery.Event("vertexselected");

    var currentIDAssignment = 0;

    var $ = jQuery;

    var SELECTION_COLOR = 0xFF0000;

    var p = processingInstance;

    var world = null;

    var objectRegistry = (function(){

        var drawnObjects = [];

        var selectedObject = null;

        var selectedVertex = null;

        return {
           update : function(world){
               if(world){
                   var shapes = world.shapes();
                   Object.keys(shapes).forEach(function(key) {
                       this.add(shapes[key]);

                   }, this);
               }
           },
           objects : function(){
               return drawnObjects;
           },
           getAssignedID : function(){
               return currentIDAssignment++;
           },
           add : function(object){
               if(!object.id){
                   object.id = this.getAssignedID();
               }
               drawnObjects.push(object);
           },
           remove : function(object){
               drawnObjects.remove(object);
           },
           clear : function(){
               drawnObjects = [];
           },
           select : function(objectSelected){
                selectedObject = objectSelected;
           },
           currentSelection : function(){
               return selectedObject;
           },
           selectVertex : function(vertexSelected){
                selectedVertex = vertexSelected;
           },
           vertexSelected : function(vertexSelected){
                return selectedVerted;
           },
           tableStructure : function(){
               var structure = [];
               drawnObjects.forEach(function(element, index, arr){
                    structure[index] = element.arrayify();
                       });
               return structure; 
           }
         }
    })();

    return {
        plane : function(degrees){
            p.plane(degrees);
        },
        xyPlane : function(){
            p.plane(0);
        },
        yzPlane : function(){
            p.plane(90);
        },
        world : function(){
            return world;
        },
        setWorld : function(newWorld){
            world = newWorld;
            objectRegistry.update(world);
        },
        shapes : function(){
            return world.shapes;
        },
        addShapes : function(jsonShape){
            world.addShapes(jsonShape);
            objectRegistry.update(world);
            this.draw();
        },
        setShapes : function(jsonShape){
            world.setShapes(jsonShape);
            objectRegistry.update(world);
            this.draw();
        },
        draw : function(){
            world.draw(p);
        },
        objectRegistry : function(){
            return objectRegistry;
        },
        currentSelection : function(){
            return objectRegistry.currentSelection();
        },
        vertexSelected : function(){
            return objectRegistry.vertexSelected();
        },
        drawnObjects : function(){
            return objectRegistry.objects();
        },
        updateInputValue : function(inputName, newValue){
            this.getElement(inputName).value = newValue;
        },
        setProcessingInstance : function(processingInstance){
            p = processingInstance;
        },
        processingInstance : function(){
            return p;
        },
        colorShape : function(object, color){
            object.color = color;
            if(object.shapes){
                 object.shapes.forEach(function(element){
                      element.color = object.color;
                      this.colorShape(element, color)
                 }, this);
            }
        },
        selectByMouse : function(x, y){
           this.drawnObjects().forEach(function(element, index, arr){
               if(Math.sqrt(Math.pow(element.position.xpos - x, 2)) < 10 &&
                    Math.sqrt(Math.pow(element.position.ypos - y, 2)) < 10) {
                    this.select(element);
                }
            }, this);
         },

         selectByID : function(id){
            this.drawnObjects().forEach(function(element, index, arr){
                if(element.id == id){
                    this.select(element);
                }
            }, this);
         },

         select : function(shape){
            var selectedObject = this.currentSelection();
            if(selectedObject){
                if(selectedObject != shape) {
                     this.colorShape(selectedObject, selectedObject.originalColor);
                     this.objectSelect(shape);
                }
             }
             else {
                this.objectSelect(shape);
             }
         },

         objectSelect : function(element){
             this.objectRegistry().select(element);
             this.colorShape(element, SELECTION_COLOR);
             $(document).trigger("shapeselected");
             if(element.function == "vertexShape"){
                 this.selectVertex(0);
             }
         },

         selectVertex : function(index){
             var currentSelection = this.currentSelection();
             if(currentSelection){
                 // bad way of checking it's a vertex shape
                 var vertices = currentSelection.args[0];
                 if(vertices instanceof Array){
                     var vertex = vertices[index];
                     currentSelection.selectVertex(index);
                     this.objectRegistry().selectVertex(vertex);
                     this.selectionIndicator(vertex);
                     this.draw();
                     $(document).trigger("vertexselected");
                 }
             }
         },
         selectionIndicator : function(vertex){
             var position = {xpos:vertex.xpos,ypos:vertex.ypos,zpos:vertex.zpos};
             // required as child shapes are relative
             (function absolutePosition(shape){
                position = addCoords(shape.position, position);
                if(shape.parent){
                     absolutePosition(world.shapes()[shape.parent]);
                }
             })(this.currentSelection());
             world.addShapes({select : this.sphere(position, 10, 0)});
         },

         nextVertex : function(){
              var vertices = this.currentSelection().args[0];
              var selectedVertexIndex = vertices.indexOf(this.currentSelection().selectedVertex); 
              selectedVertexIndex < vertices.length - 1 ? this.selectVertex(++selectedVertexIndex)
                                             : this.selectVertex(0);
         },

         initMouse: function(){

             var self = this;
             var dragged = false;
             var objectReg = objectRegistry;

             p.mousePressed = function(){
                 self.selectByMouse(p.mouseX, p.mouseY);
             }
             p.mouseDragged = function(){
                 dragged = true;
             }
             p.mouseReleased = function(){
                 if(dragged){
                      self.objectRegistry().currentSelection().position = {xpos:p.mouseX, ypos:p.mouseY, zpos:0};
                      p.draw();
                 }
                 dragged = false;
             }
         },

        shape : function(position, color, drawFunction, args){
           return { color : color, 
                    position : position, 
                    args : args,
                    function : drawFunction
           };
        },

        sphere : function(position, rsize, color, extraArgs){
           var sphere = this.shape(position, color, "sphere", [rsize]);
           sphere.extraArgs = extraArgs; 
           return sphere;
        },

        box : function(position, xsize, ysize, zsize, color, extraArgs){
           var box = this.shape(position, color, "box", [xsize, ysize, zsize]);
           box.extraArgs = extraArgs; 
           return box;
        },

        body : function(xpos, ypos, zpos, xsize, ysize, zsize, color){
            var position = {xpos:xpos, ypos:ypos, zpos:zpos};
            return this.box(position, xsize, ysize, zsize, color, {});
        },

        head : function(xpos, ypos, zpos, rsize, color){
            var position = {xpos:xpos, ypos:ypos, zpos:zpos};
            return this.sphere(position, rsize, color, {});
        },

        spinningSphere : function(xpos, ypos, zpos, rsize, color){
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
            return this.sphere(position, rsize, color, extraArgs);
        },

        verticalPyramid : function(r, l, color, position, extraArgs){

            var point = {xpos:0, ypos:l/2, zpos:0, name:"point"};
            var b1 = {xpos:+r, ypos:-l/2, zpos:-r, name:"b1"};
            var b2 = {xpos:+r, ypos:-l/2, zpos:+r, name:"b2"};
            var b3 = {xpos:-r, ypos:-l/2, zpos:+r, name:"b3"};
            var b4 = {xpos:-r, ypos:-l/2, zpos:-r, name:"b4"};

            var vertices = [point, b1, b2, b3, b4];

            point.joins = [1, 2, 3, 4];
            b1.joins = [0, 4, 2];
            b2.joins = [0, 1, 3];
            b3.joins = [0, 2, 4];
            b4.joins = [0, 3, 1];

            extraArgs.rotationPoint  = {xpos:0, ypos:-l/2, zpos:0, name:"rp"};

            extraArgs.rotatePointX = function(zenithrad){
                this.rotateVertexX(point, zenithrad, this.rotationPoint);
            };

            var pyramid  = this.shape(position, color, "vertexShape", [vertices]);
            pyramid.extraArgs = extraArgs;
            return pyramid;
        },    
      
        leg : function(xpos, ypos, zpos, color){
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
            return this.verticalPyramid(10, 40, color, position, extraArgs);
        },

        legs : function(xpos, ypos, zpos, color){
            var position = {xpos:xpos, ypos:ypos, zpos:zpos};

            // var leftLeg = leg(p.cos(-rotation)*(10), 0, p.sin(-rotation)*(10), color);
            // var rightLeg = leg(p.cos(-rotation)*(-10), 0, p.sin(-rotation)*(-10), color);
            var leftLeg = this.leg(10, 0, 0);
            var rightLeg = this.leg(-10, 0, 0);

            var legs = this.shape(position, color);
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
        }
    };
});

