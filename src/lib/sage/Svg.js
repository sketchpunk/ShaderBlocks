
class Svg{
	constructor(elmID){
		this.tag = document.getElementById(elmID);
		this.ns = this.tag.namespaceURI;
	}

	remove(elm){ this.tag.removeChild(elm); return this; }
	append(elm){ this.tag.appendChild(elm); return this; }

	//Creates an Quadratic Curve path in SVG
	createPath(pathColor=null, pathWidth=null, pashDashAry=null){
		var elm = document.createElementNS(this.ns,"path");
		elm.setAttribute("fill", "none");
		
		if(pathColor != null)	elm.setAttribute("stroke", pathColor);
		if(pathWidth != null) 	elm.setAttribute("stroke-width", pathWidth);
		if(pashDashAry != null)	elm.setAttribute("stroke-dasharray", pashDashAry);

		this.tag.appendChild(elm);
		return elm;
	}

	//Set the position of the curve with the control points at an even position on the x pos
	setQCurveScaledXPos(elm,x1,y1,x2,y2,scale){
		var d = Math.abs(x1-x2) / scale,	//Delta X times scale factor 9
		str = "M" + x1	+ "," + y1 + " C" +	//MoveTo
			(x1 + d)	+ "," + y1 + " " +	//First Control Point
			(x2 - d)	+ "," + y2 + " " +	//Second Control Point
			x2			+ "," + y2;			//End Point
		elm.setAttribute('d', str);
	}

	setStroke(elm,color){ elm.setAttribute("stroke",color); }

	/*Unused function at the moment, it creates a straight line*/
	createLine(x1, y1, x2, y2, color, w) {
		var line = document.createElementNS(this.ns,'line');
		line.setAttribute('x1', x1);
		line.setAttribute('y1', y1);
		line.setAttribute('x2', x2);
		line.setAttribute('y2', y2);
		line.setAttribute('stroke', color);
		line.setAttribute('stroke-width', w);
		this.tag.appendChild(line);
		return line;
	}
}

export default Svg;