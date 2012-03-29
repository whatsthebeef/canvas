WORLD_EDITOR = (function(processingInstance, jQuery){

    jQuery.Event("shapeselected");

    jQuery.Event("vertexselected");

    var currentIDAssignment = 0;

    var $ = jQuery;

    var SELECTION_COLOR = 0xFF0000;

    var p = processingInstance;

        var objectRegistry = (function(){

        var drawnObjects = [];

        var selectedObject = null;

        return {
               objects : function(){
                   return drawnObjects;
               },
               getAssignedID : function(){
                   return currentIDAssignment++;
               },
               add : function(object){
                   object.id = this.getAssignedID();
                   drawnObjects.push(object);
                   var shapes = object.shapes;
                   if(shapes){
                       shapes.forEach(function(element){
                            element.id = this.getAssignedID();
                            this.add(element);
                       }, this);
                   }
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
            p.rotate(degrees);
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
            if(world){
               var shapes = world.shapes();
               Object.keys(shapes).forEach(function(key) {
                   objectRegistry.add(shapes[key]);
               });
            }
        },
        shapes : function(){
            return world.shapes;
        },
        setShape : function(jsonShape){
            world.setShape();
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
                element.vertexSelected = element.args[0];
                $(document).trigger("vertexselected");
             }
         },

         selectVertex : function(index){
             var currentSelection = this.currentSelection();
             if(currentSelection){
                 // bad way of checking it's a vertex shape
                 var vertices = currentSelection.args;
                 if(vertices instanceof Array){
                     currentSelection.selectVertex(index);
                     $(document).trigger("vertexselected");
                     this.draw();
                 }
             }
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
         }
    }
});


