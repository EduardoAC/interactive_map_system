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
        height: 438
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


iMap.prototype.loaded = function(error, data){
    var _self = this;
    var countries = data[0];
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
        .attr("class", function(d) { return "country"; })
        .attr("d", _self.mapPath);
//        .on("click", country_clicked);
    _self.eventSystem();
    _self.drawTransformArrows(_self.mapSVG);

};

iMap.prototype.resize = function(_self, event){
    var w = _self.mapWrapper.width();
    _self.mapSVG
            .attr("width", w)
            .attr("height", w * _self.mHeight / _self.mWidth);
};
iMap.prototype.drawTransformArrows = function(wrapper){
    var _self = this;
    var group = wrapper.append("g");
    //Circle around transform arrows
    group.append("circle")
        .attr("cx", "50")
        .attr("cy", "50")
        .attr("r", "42")
        .attr("fill", "white")
        .attr("opacity","0.75");
    //Vertical arrow
    group.append("path")
        .attr("class", "button")
        .attr("d", "M50 10 l12 20 a40,70 0 0,0 -24,0z")
        .on("click",function(){_self.panning(0,50)});
    //Right arrow
    group.append("path")
        .attr("class", "button")
        .attr("d", "M10 50 l20 -12 a70,40 0 0,0 0,24z")
        .on("click",function(){_self.panning(50,0)});
    //Bottom arrow
    group.append("path")
        .attr("class", "button")
        .attr("d", "M50 90 l12 -20 a40,70 0 0,1 -24,0z")
        .on("click",function(){_self.panning(0,-50)});
    //Left arrow
    group.append("path")
        .attr("class", "button")
        .attr("d", "M90 50 l-20 -12 a70,40 0 0,1 0,24z")
        .on("click",function(){_self.panning(-50,0)});
    //Internal circle that contains zoom transforms
    group.append("circle")
        .attr("class", "compass")
        .attr("cx", "50")
        .attr("cy", "50")
        .attr("r", "20");
    //Internal circle that contain zoom out
    group.append("circle")
        .attr("class", "button")
        .attr("cx", "50")
        .attr("cy", "41")
        .attr("r", "8")
        .on("click",function(){_self.zooming(-0.5)});
    //Internal circle that contain zoom in
    group.append("circle")
        .attr("class", "button")
        .attr("cx", "50")
        .attr("cy", "59")
        .attr("r", "8")
        .on("click",function(){_self.zooming(+0.5)});
    //Horizontal arrow in zoom out
    group.append("rect")
        .attr("class", "plus-minus")
        .attr("x", "46")
        .attr("y", "39.5")
        .attr("width", "8")
        .attr("height", "3");
    //Horizontal arrow in zoom in
    group.append("rect")
        .attr("class", "plus-minus")
        .attr("x", "46")
        .attr("y", "57.5")
        .attr("width", "8")
        .attr("height", "3");
    //Vertical arrow in zoom in
    group.append("rect")
        .attr("class", "plus-minus")
        .attr("x", "48.5")
        .attr("y", "55")
        .attr("width", "3")
        .attr("height", "8");
}
iMap.prototype.mouseInteractions = function(){
    var _self = this;
    var scale = 2;
    var invscale = 0.5;
    var oldPX = 1;
    var oldPY = 1;
    _self.mapWrapper.on("mousedown",function(event){
        oldPX = event.pageX;
        oldPY = event.pageY;
        _self.mapWrapper.on("mousemove",function(e){
            _self.panning((e.pageX - oldPX)*invscale,(e.pageY - oldPY)*invscale);
//            _self.mapContainer.attr("transform", "translate(" + incX +","+incY + ")scale(" + scale + ")");
            //.translate(function(){return [incX, incY]});
            oldPX = e.pageX;
            oldPY = e.pageY;
        });
    });
    _self.mapWrapper.on("mouseup",function(){
        _self.mapWrapper.off("mousemove");
    });
    _self.mapWrapper.on("mousewheel",function(e){
        var scale = 0;
        if(e.originalEvent.wheelDelta /120 > 0){
            scale = 0.1; 
        }else{
            scale = -0.1; 
        }
        _self.zooming(scale);
    });
};
iMap.prototype.panning = function(Dx,Dy){
    var _self = this;
    _self.transform.transX += Dx;
    _self.transform.transY += Dy;
    _self.applyTransform();
};
iMap.prototype.zooming = function(scale){
    var _self = this;
    _self.transform.scale += scale;
    _self.transform.scale = (_self.transform.scale < 1)? 1:_self.transform.scale;
    _self.transform.scale = (_self.transform.scale > 6)? 6:_self.transform.scale;
//    _self.transform.transX += (1-scale) * _self.transform.width / 2;
//    _self.transform.transY += (1-scale) * _self.transform.height/ 2;
    _self.applyTransform();
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
