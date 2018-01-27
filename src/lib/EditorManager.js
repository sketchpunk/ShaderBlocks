import Sage from "./sage/Sage.js";
import Svg from "./sage/Svg.js";

function init(){
	mod.svg = new Svg("svgcanvas");
}

var mod = {
	init:init,
	svg:null
};

export default mod;