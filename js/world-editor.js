WORLD_EDITOR = (function(processingInstance, jQuery){

    var $ = jQuery;

    var SELECTION_COLOR = 0xFF0000;

    var p = processingInstance;

    var event;

    var shapes = {}; 

    var objectRegistry = (function(){

       var drawnObjects = [];
       var selectedObject = null;
       var objectSelect = function(object){
           selectedObject = object;
           selectedObject.color = SELECTION_COLOR;
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
                   if(Math.sqrt(Math.pow(element.position.xpos - x, 2)) < 10 &&
                       Math.sqrt(Math.pow(element.position.ypos - y, 2)) < 10) {
                       if(selectedObject){
                           if(selectedObject != element) {
                               selectedObject.color = selectedObject.originalColor;
                               objectSelect(element);
                               $(document).trigger("shapeselected");
                           }
                       }
                       else {
                           objectSelect(element);
                           $(document).trigger("shapeselected");
                       }
                   }
               });
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

    var monitorMouse = (function(){

        var dragged = false;

        var objectReg = objectRegistry;

        p.mousePressed = function(){
            objectReg.select(p.mouseX, p.mouseY);
        }

        p.mouseDragged = function(){
            dragged = true;
        }

        p.mouseReleased = function(){
            if(dragged){
                 objectReg.currentSelection().position = {xpos:p.mouseX, ypos:p.mouseY, zpos:0};
                 p.draw();
            }
            dragged = false;
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
        }
    }
});


