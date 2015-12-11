/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function iMap(mapId,parameters){
    this.mapId = mapId;
    this.map;
    this.mapWrapper;
    this.mapPath;
    this.mapSVG;
    this.mapBackground;
    this.mapContainer;
    this.mHeight;
    this.mWidth;
    this.mScale;
    this.transform = {
        scale: 2,
        transX: 0,
        transY: 0,
        width: 938,
        height: 500
    };
    this.initParameters = function(parameters){
        var _self = this;
        _self.mWidth  = (typeof parameters.width  !== "undefined")?parameters.width:938;
        _self.mHeight = (typeof parameters.height !== "undefined")?parameters.height:500;
        _self.mScale  = (typeof parameters.scale !== "undefined")?parameters.scale:2;
        _self.transform.width  = _self.mWidth;
        _self.transform.height = _self.mHeight;

    };
    this.initParameters(parameters);
}
iMap.prototype.initialization = function(){
    var _self = this;

    _self.mapWrapper = $("#"+_self.mapId);

    if(_self.mapWrapper.length === 0){
       console.error("It couldn't find any dom element with id = '"+ _self.mapId +"'");
       return;
    } else if(_self.mapWrapper.length > 1){
       console.error("There are multiples instance of the same id = '"+ _self.mapId +"'"); 
       return;
    }    

    var m_width = _self.mapWrapper.width(),
        width   = _self.mWidth,
        height  = _self.mHeight;

    var projection = d3.geo
        .mercator()
        .scale(150)
        .translate([width / 2, height / 1.41]);

    _self.mapPath = d3.geo
        .path()
        .pointRadius(1)
        .projection(projection);

    _self.mapSVG = d3.select("#"+_self.mapId).append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("width", m_width)
        .attr("height", m_width * height / width);

    _self.mapBackground = _self.mapSVG.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    _self.mapContainer = _self.mapSVG.append("g");
};
iMap.prototype.applyTransform = function(){
    var _self = this;
    var maxTransX, maxTransY, minTransX, minTransY;
    _self.mWidth * _self.transform.scale <= _self.transform.width ? (maxTransX = (_self.transform.width - _self.mWidth * _self.transform.scale) / (2 * _self.transform.scale),
    minTransX = (_self.transform.width - _self.mWidth * _self.transform.scale) / (2 * _self.transform.scale)) : (maxTransX = 0,
    minTransX = (_self.transform.width - _self.mWidth * _self.transform.scale) / _self.transform.scale),
    _self.mHeight * _self.transform.scale <= _self.transform.height ? (maxTransY = (_self.transform.height - _self.mHeight * _self.transform.scale) / (2 * _self.transform.scale),
    minTransY = (_self.transform.height - _self.mHeight * _self.transform.scale) / (2 * _self.transform.scale)) : (maxTransY = 0,
    minTransY = (_self.transform.height - _self.mHeight * _self.transform.scale) / _self.transform.scale),
    _self.transform.transY > maxTransY ? _self.transform.transY = maxTransY : _self.transform.transY < minTransY && (_self.transform.transY = minTransY),
    _self.transform.transX > maxTransX ? _self.transform.transX = maxTransX : _self.transform.transX < minTransX && (_self.transform.transX = minTransX),
    _self.applyTransformParams(_self.transform.scale, _self.transform.transX, _self.transform.transY);
};
iMap.prototype.applyTransformParams = function(scale, transX, transY) {
    var _self = this;
    _self.mapContainer.attr("transform", "scale(" + scale + ") translate(" + transX + ", " + transY + ")")
}


iMap.prototype.loaded = function(error, countries){
    var _self = this;
    
    _self.initialization();
    
    //Remember that interactive_map_system should be replace with the url to the file
    _self.mapContainer.append("g")
        .attr("id", "countries")
        .attr("class", "countries")
        .selectAll("path")
        .data(topojson.feature(countries, countries.objects.countries).features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .attr("d", _self.mapPath);
//        .on("click", country_clicked);
    _self.eventSystem();
};

iMap.prototype.resize = function(_self, event){
    var w = _self.mapWrapper.width();
    _self.mapSvg
            .attr("width", w)
            .attr("height", w * _self.mHeight / _self.mWidth);
};
iMap.prototype.mouseInteractions = function(){
    var _self = this;
    var scale = 2;
    var invscale = 0.5;
    var oldPX = 1;
    var oldPY = 1;
    _self.mapWrapper.on("mousedown",function(event){
        console.log("click mouse");
        oldPX = event.pageX;
        oldPY = event.pageY;
        _self.mapWrapper.on("mousemove",function(e){
            console.log("mover mouse 1");
            _self.transform.transX += (e.pageX - oldPX)*invscale;
            _self.transform.transY += (e.pageY - oldPY)*invscale;
            _self.applyTransform();
//            _self.mapContainer.attr("transform", "translate(" + incX +","+incY + ")scale(" + scale + ")");
            //.translate(function(){return [incX, incY]});
            oldPX = e.pageX;
            oldPY = e.pageY;
        });
    });
    _self.mapWrapper.on("mouseup",function(){
        console.log("unclick mouse");
        _self.mapWrapper.off("mousemove");
    });
    _self.mapWrapper.on("mousewheel",function(e){
        console.log("unclick mouse");
        if(e.originalEvent.wheelDelta /120 > 0){
            _self.transform.scale += 0.25; 
        }else{
            _self.transform.scale -= 0.25; 
        }
       
        _self.transform.scale = (_self.transform.scale < 1)? 1:_self.transform.scale;
        _self.applyTransform();
    });
};
iMap.prototype.eventSystem = function(){
    var _self = this;
    
    //Resize system
    var resize = function(event){
      return _self.resize(_self,event);  
    };
    $(window).resize(resize);
    
    //Mouse events
    _self.mouseInteractions();
    
};
