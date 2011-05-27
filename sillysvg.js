
String.prototype.format = function() {
  	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : '{' + number + '}';
	});
};

var SVGElement = function(type, attributes) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", "svg:"+type);
	if(attributes != null) {
		for(var i in attributes) {
			element.setAttribute(i, attributes[i]);
		}
	}
	return element;
}

var Shape = function(type, attributes) {
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scale = 1;
	this.element = SVGElement(type, attributes);
	this.animate = new Animate(this);
}

var Surface = function() {
	this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg:svg");
	this.element.id = "svg"
	this.element.setAttribute("style","width:100%; height:100%; position:absolute; top:0; left:0; z-index:-1;");
	this.element.setAttribute("version", "1.1")
	document.body.appendChild(this.element);
	this._drag = null;
	
	document.addEventListener("mousemove", function(evt) {
		if(Surface.dragging) {
			var e = Surface.dragging;
			e.x = evt.clientX - Surface.dragX;
			e.y = evt.clientY - Surface.dragY;
			e.update();
		}
	}, false)
	document.addEventListener("mouseup", function(evt) {
		if(Surface.dragging) {
			Surface.drop(Surface.dragging, evt);
		}
	}, false);
}

Surface.dragging = null;
Surface.dragX = 0;
Surface.dragY = 0;
Surface.drag = function(element, evt) {
	if(Surface.dragging) Surface.drop(Surface.dragging, evt)
	Surface.dragging = element;
	if(element.ondrag) element.ondrag();
	Surface.dragX = evt.clientX - element.x;
	Surface.dragY = evt.clientY - element.y;
}
Surface.drop = function(element, evt) {
	if(element == Surface.dragging) {
		if(element.ondrop) element.ondrop();
		Surface.dragging = null;
	}
}



var Path = function(attributes) {
	this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg:path");
	this.type = "S";
	this.points = new Array();
	this.set({fill:"none", stroke:"black"})
	if(attributes != null) {
		this.set(attributes);
	}
}

Path.prototype.add = function(x,y) {
	this.points.push([x,y]);
}

Path.prototype.update = function() {
	if(this.points.length < 3) return;
	var d = "";
	for(var i in this.points) {
		p = this.points[i];
		d += d==""?"M {0},{1} {2}".format(p[0], p[1],this.type):" {0},{1}".format(p[0], p[1]);
	}
	this.set({d:d});
}

Path.prototype.set = Surface.prototype.set = Shape.prototype.set = function(attributes) {
	for(var i in attributes) {
		this.element.setAttribute(i, attributes[i]);
	}
}

Surface.prototype.add = Shape.prototype.add = function(shape) {
	shape.surface = this;
	this.element.appendChild(shape.element);
}

Shape.prototype.transform = function(x, y, angle, scale) {
	this.x = x;
	this.y = y;
	this.rotation = angle;
	this.scale = scale;
	this.update();
	return this;
}

Shape.prototype.update = function() {
	this.set({transform:"translate({0} {1}) rotate({2}) scale({3})".format(this.x, this.y, this.rotation, this.scale)});
}

Shape.prototype.points = function() {
	points = "";
	for(var i in arguments) {
		points += arguments[i] + " ";
	}
	this.set({points:points});	
}

Shape.prototype.text = function(text) {
	this.element.appendChild(document.createTextNode(text));
}

Shape.prototype.drag = function() {
	var e = this;
	this.element.addEventListener("mousedown", function(evt) {
		Surface.drag(e, evt);
	}, false);
}

var Animate = function(shape) {
	this.shape = shape;
}

Animate.prototype.transform = function(attributes) {
	var a = SVGElement("animateTransform");
	attributes["attributeName"] = "transform";
	attributes["attributeType"] = "XML";
	attributes["fill"] = "freeze";
	for(var i in attributes) 
		a.setAttribute(i, attributes[i]);
	this.shape.element.appendChild(a);
	return a;
}

Animate.prototype.attribute = function(attributeName, from, to, dur, attributes) {
	var a = SVGElement("animate");
	if(!attributes) attributes = {};
	attributes["attributeName"] = attributeName;
	attributes["from"] = from;
	attributes["to"] = to;
	attributes["dur"] = dur;
	for(var i in attributes) 
		a.setAttribute(i, attributes[i]);
	this.shape.element.appendChild(a);
	return a;
}

Animate.prototype.set = function(attributeName, from, to, begin, attributes) {
	var a = SVGElement("animate");
	if(!attributes) attributes = {};
	attributes["attributeName"] = attributeName;
	attributes["from"] = from;
	attributes["to"] = to;
	attributes["begin"] = begin;
	for(var i in attributes) 
		a.setAttribute(i, attributes[i]);
	this.shape.element.appendChild(a);
	return a;
}

var initSillySvg = function() {
	var elements = ["circle","ellipse","g","text","image","line","polygon","polyline","rect"];
	for(var i in elements) {
		eval("Surface.prototype.{0} = function(attributes) { var s = new Shape('{0}', attributes); this.add(s); return s; }".format(elements[i]));
	}
}

initSillySvg();


