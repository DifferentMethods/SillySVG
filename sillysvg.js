var values = function (object) {
    var result = [];
    for (var key in object)
        result.push(object[key]);
    return result;
}

var keys = function (object) {
    var result = [];
    for (var key in object)
        result.push(key);
    return result;
}

String.prototype.format = function() {
  	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : '{' + number + '}';
	});
};

String.prototype.capitalize = function() {
	if(this.length > 0) {
		return this[0].toUpperCase() + this.substring(1);
	}
	return "";
}

String.prototype.camelCase = function() {
	var first = true;
	var s = "";
	var tokens = this.split("-");
	for(var i in tokens) {
		if(first) 
			s += tokens[i];
		else
			s += tokens[i].capitalize();
		first = false;
	}
	return s;
}

function defaults(defaults, dvalues) {
	var v = {};
	for(var i in defaults) 
		v[i] = defaults[i];
	for(var i in dvalues) 
		v[i] = dvalues[i];
	return v;
}

var Transform = function(svgobject) {
	this.svgobject = svgobject;
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scale = 1;	
}

Transform.prototype.translate = function(x, y) {
	this.x = x;
	this.y = y;
	this.svgobject.element.setAttribute("transform", this.toString());
	return this.svgobject;
}

Transform.prototype.rotate = function(rotation) {
	this.rotation = rotation;
	this.svgobject.element.setAttribute("transform", this.toString());
	return this.svgobject;
}

Transform.prototype.scale = function(scale) {
	this.scale = scale;
	this.svgobject.element.setAttribute("transform", this.toString());
	return this.svgobject;
}

Transform.prototype.toString = function() {
	return "translate({0} {1}) rotate({2}) scale({3})".format(this.x, this.y, this.rotation, this.scale);
}

var SVGObject = function(type) {
	this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg:"+type);
	this.transform = new Transform(this);
	if(type == "path")
		this.d = new PathData(this);
	if(type == "polyline")
		this.points = new Points(this);
}

SVGObject.prototype.attr = function(attr) {
	for(var i in attr)
		this.element.setAttribute(i, attr[i]);
	return this;
}

SVGObject.prototype.append = function(svgobject) {
	this.element.appendChild(svgobject.element);
	svgobject.parent = this;
	return svgobject
}

SVGObject.prototype.textNode = function(text) {
	var e = this.element.appendChild(document.createTextNode(text));
	return e;
}

var SVG = function(attributes) {
	this.svgobject = new SVGObject("svg")
	this.svgobject.attr(defaults({width:"100%", height:"100%", version:"1.1"}, attributes));
	document.body.appendChild(this.svgobject.element);
	
	document.addEventListener("mousemove", function(evt) {
	});
	
	document.addEventListener("mouseup", function(evt) {
	});
}

SVG.prototype.append = function(svgobject) {
	this.svgobject.append(svgobject);
	svgobject.parent = this;
	return svgobject
}

var PathData = function(svgobject) {
	this.svgobject = svgobject;
	this.type = "S";
	this.points = new Array();
}

PathData.prototype.add = function(x,y) {
	this.points.push([x,y]);
	return this.svgobject;
}

PathData.prototype.update = function() {
	if(this.points.length < 3) return;
	var d = "";
	for(var i in this.points) {
		p = this.points[i];
		d += d==""?"M {0},{1} {2}".format(p[0], p[1],this.type):" {0},{1}".format(p[0], p[1]);
	}
	this.svgobject.attr({d:d});
	return this.svgobject;
}

var Points = function(svgobject) {
	this.svgobject = svgobject;
	this.points = new Array();
}

Points.prototype.add = function(x,y) {
	this.points.push([x,y]);
	return this.svgobject;
}
	
Points.prototype.update = function() {
	if(arguments.length > 0) this.points = arguments;
	var p = values(this.points);
	this.svgobject.attr({points:p.join(" ")});
	return this.svgobject;
}

var initSillySVG = function() {
	var elements = "defs, desc, g, metadata, svg, symbol, title, use, style, a, switch, circle, ellipse, line, path, polygon, polyline, rect, image, altGlyph, altGlyphDef, altGlyphItem, glyphRef, text, textPath, tref, tspan, linearGradient, radialGradient, stop, pattern, clipPath, mask, definition-src, font, font-face, font-face-format, font-face-name, font-face-src, font-face-uri, glyph, hkern, missing-glyph, vkern, script, feBlend, feColorMatrix, feComponentTransfer, feComposite, feFlood, feGaussianBlur, feImage, feMerge, feMergeNode, feOffset, feTile, feFuncR, feFuncG, feFuncB, feFuncA, filter, animate, animateColor, animateMotion, animateTransform, mpath, set".split(", ");

	for(var i in elements) {
		eval("SVGObject.prototype.{0} = SVG.prototype.{0} = function(attr) { var s = new SVGObject('{1}'); s.attr(attr); this.append(s); return s; }".format(elements[i].camelCase(), elements[i]));
	}
}

initSillySVG();
initSillySVG = undefined;


