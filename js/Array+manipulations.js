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


