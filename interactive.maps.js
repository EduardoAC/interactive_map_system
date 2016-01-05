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
    this.projection;
    this.mHeight;
    this.mWidth;
    this.mScale;
    this.server_url;
    this.country      = null;
    this.country_code = null;
    this.state        = null;
    this.state_name   = null;
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
        _self.server_url  = (typeof parameters.server_url !== "undefined")?parameters.server_url:null;
        if(_self.server_url === null){
            console.error("It couldn't find any server url element, it won't be able some features.");
        }
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

    _self.projection = d3.geo
        .mercator()
        .scale(150)
        .translate([width / 2, height / 1.41]);

    _self.mapPath = d3.geo
        .path()
        .pointRadius(1)
        .projection(_self.projection);

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
    _self.mapContainer
        .attr("transform", "scale(" + scale + ") translate(" + transX + ", " + transY + ")")
        .selectAll(["#countries", "#states", "#cities",".route",".airports"])
        .style("stroke-width", 1.0 / scale + "px")
        .selectAll(".city")
        .attr("d", _self.mapPath.pointRadius(20.0 / scale));
}


iMap.prototype.loaded = function(error, data){
    var _self = this;
    var countries = data[0];
    _self.initialization();
    
    var country_clicked = function(d){
        return _self.country_clicked(_self,d);
    }
    
    //Remember that interactive_map_system should be replace with the url to the file
    var world_map = _self.mapContainer.append("g")
        .attr("id", "countries")
        .attr("class", "countries")
        .selectAll("path")
        .data(topojson.feature(countries, countries.objects.countries).features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .attr("class", function(d) { return "country"; })
        .attr("d", _self.mapPath);

    if(_self.server_url){
        world_map.on("click", country_clicked);
    }
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
//    _self.mapWrapper.on("mousewheel",function(e){
//        var scale = 0;
//        if(e.originalEvent.wheelDelta /120 > 0){
//            scale = 0.1; 
//        }else{
//            scale = -0.1; 
//        }
//        _self.zooming(scale);
//    });
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

iMap.prototype.country_clicked = function(mapObj,d) {
    var _self = mapObj;
    
    _self.mapContainer.selectAll(["#states", "#cities"]).remove();
    _self.state = null;

    if (_self.country) {
      _self.mapContainer.selectAll("#" + _self.country.id).style('display', null);
    }

    if (d && _self.country !== d) {
      var xyz = _self.get_xyz(d);
      _self.country = d;

      var state_clicked = function(d){
          return _self.state_clicked(_self,d);
      };

      d3.json(_self.server_url + "/maps/countries/" + d.id.toLowerCase() + "/country_divisions.topo.json", function(error, us) {
          if(error === null || error.readyState === 4 && error.status === 200){
              _self.mapContainer.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter()
                .append("path")
                .attr("id", function(d) { return d.id; })
                .attr("class", "active")
                .attr("d", _self.mapPath)
                .on("click", state_clicked);

              _self.iZoom(xyz);
              _self.mapContainer.selectAll("#" + d.id).style('display', 'none');
          }else{
              _self.iZoom(xyz);
          }
      });      
    } else {
      var xyz = [_self.mWidth / 2, _self.mHeight / 1.5, 1];
      _self.country = null;
      _self.iZoom(xyz);
    }
};

iMap.prototype.state_clicked = function(mapObj, d) {
    var _self = mapObj;
    _self.mapContainer.selectAll("#cities").remove();

    if (d && _self.state !== d) {
      var xyz = _self.get_xyz(d);
      _self.state = d;

      _self.country_code = _self.state.id.substring(0, 3).toLowerCase();
      _self.state_name = _self.state.properties.name;

      d3.json(_self.server_url + "/maps/countries/" + _self.country_code + "/country_cities.topo.json", function(error, tCountry) {
        _self.mapContainer.append("g")
          .attr("id", "cities")
          .selectAll("path")
          .data(topojson.feature(tCountry, tCountry.objects.cities).features.filter(function(d) { 
              return _self.state_name == d.properties.state;
          }))
          .enter()
          .append("path")
          .attr("id", function(d) { return d.properties.name; })
          .attr("class", "city")
          .attr("d", _self.mapPath.pointRadius(20 / xyz[2]));

        _self.iZoom(xyz);
      });      
    } else {
      _self.state = null;
      _self.country_clicked(_self,_self.country);
    }
  };
iMap.prototype.iZoom = function(xyz) {
    var _self = this;
    var point = _self.projection([xyz[0],xyz[1]]);
    _self.transform.scale = xyz[2];
    _self.mapContainer.transition()
        .duration(750)
        .attr("transform", "translate(" + _self.projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
        .selectAll(["#countries", "#states", "#cities",".route",".airports"])
        .style("stroke-width", 1.0 / xyz[2] + "px")
        .selectAll(".city")
        .attr("d", _self.mapPath.pointRadius(20.0 / xyz[2]));
};

iMap.prototype.get_xyz = function(d) {
    var _self = this;
    var bounds = _self.mapPath.bounds(d);
    var w_scale = (bounds[1][0] - bounds[0][0]) / _self.mWidth;
    var h_scale = (bounds[1][1] - bounds[0][1]) / _self.mHeight;
    var z = .96 / Math.max(w_scale, h_scale);
    var x = (bounds[1][0] + bounds[0][0]) / 2;
    var y = (bounds[1][1] + bounds[0][1]) / 2 + (_self.mHeight / z / 6);
    return [x, y, z];
}