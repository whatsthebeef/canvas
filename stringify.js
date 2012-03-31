Shape.prototype.stringify = function stringify(){
        var object = this;
        var padding = true;
        var margin = true;
        var o = (typeof object == "object" || typeof object == "function") && object != null ? object : null;
        var p = typeof padding == "boolean" && padding ? true : false;
        var m = typeof margin == "number" && margin>0 && p ? margin : 0;
        if(o != null){
            var s = "";
            var a = function(o){
                return (typeof o === "object" && o ? ((typeof o.length === "number" 
                           &&!(o.propertyIsEnumerable("length")) 
                                && typeof o.splice === "function") ? true : false) : false);
            }; //is array?
            for(var v in o){
                if(v != "parent"){
                s += typeof o[v] === "object" ? (o[v] ? (
                  (typeof o[v].length === "number" 
                    && !(o[v].propertyIsEnumerable("length")) 
                        && typeof o[v].splice === "function") ?
                            (m>0 ? Array(m).join(" "):"") + v + ":" + (p ? " ":"") + "[" + (p ? "\r\n":"") + stringify(o[v],p,(m>0?m:1)+v.length+4) + (p!=true ? "" : "\r\n" + Array((m>0?m:1)+v.length+2).join(" ")) + "]," + (p ? "\r\n":"") :
                            (m>0 ? Array(m).join(" "):"") + v + ":" + (p ? " ":"") + "{" + (p ? "\r\n":"") + stringify(o[v],p,(m>0?m:1)+v.length+4) + (p!=true ? "" : "\r\n" + Array((m>0?m:1)+v.length+2).join(" ")) + "}," + (p ? "\r\n":"")
                            ) : (m>0 ? Array(m).join(" "):"") + v + ":" + (p ? " ":"") + o[v] + "," + (p ? "\r\n":""))
                    : (m>0 ? Array(m).join(" "):"") + v + ":" + (p ? " ":"") + (typeof o[v] == "string" ? "\"" + o[v].replace(/\"/g,"\\\"") + "\"" : o[v]) + "," + (p ? "\r\n":"");
                }
            };
            o = s.length>0 && p!=true ? s.substring(0, s.length-1) : (s.length>2 ? s.substring(0, s.length-3) : s);
            
        }
        else {
            o = object;
        };
        return o;
    }
