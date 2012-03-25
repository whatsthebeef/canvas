WORLD_EDITOR = (function(processingInstance, jQuery){

    jQuery.Event("shapeselected");

    jQuery.Event("vertexselected");

    var currentIDAssignment = 0;

    var $ = jQuery;

    var SELECTION_COLOR = 0xFF0000;

    var p = processingInstance;

    var event;

    var shapes = {}; 

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
        shapes : function(){
            return shapes;
        },
        setShapes : function(jsonShapes){
            shapes = {};
            // Visit non-inherited enumerable keys
            Object.keys(jsonShapes).forEach(function(key) {
                shapes[key] = new Shape(jsonShapes[key]);
            });
        },
        draw : function(){
            shapes.legs.walk();
            p.draw();
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
        getElement : function(id){
            return document.getElementById(id);
        }, 
        addEventListener : function(event, func){
            document.addEventListener(event, func, false);
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
        select : function(x, y){
           this.drawnObjects().forEach(function(element, index, arr){
               if(Math.sqrt(Math.pow(element.position.xpos - x, 2)) < 10 &&
                    Math.sqrt(Math.pow(element.position.ypos - y, 2)) < 10) {
                    var selectedObject = this.currentSelection();
                    if(selectedObject){
                        if(selectedObject != element) {
                            this.colorShape(selectedObject, selectedObject.originalColor);
                            this.objectSelect(element);
                        }
                    }
                    else {
                        this.objectSelect(element);
                    }
                }
            }, this);
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

         selectVertex : function(){
             var currentSelection = this.currentSelection();
             if(currentSelection){
                 // bad way of checking it's a vertex shape
                 var vertices = currentSelection.args;
                 if(vertices instanceof Array){
                     console.log(vertices[0]);
                 }
             }
         },

         initMouse: function(){

             var self = this;
             var dragged = false;
             var objectReg = objectRegistry;

             p.mousePressed = function(){
                 self.select(p.mouseX, p.mouseY);
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


