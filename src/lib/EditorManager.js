import Sage from "./sage/Sage.js";
import Svg from "./sage/Svg.js";


import GLCanvas	from "./fungiMini/GLCanvas.js";
import Quad		from "./fungiMini/Quad.js";
import Shader	from "./fungiMini/Shader.js";

//------------------------------------------------------

function init(){
	mod.svg = new Svg("svgcanvas");
	mod.preview = new PreviewGen("MainCanvas");
}

/*
TODO: Must fix order of operations. Problem is certain nodes setup as vars
can be set in the wrong order causing compile error. The fix is to traverse
the node tree and set up a level value for each step. If during the process
a node is found used again deeper in the tree, then the level needs to be updated
for that step so it happens sooner. Then we can use this level value to sort
the proper order of operations.
*/
function processNodes(node,initCode = null){
	var nAry = (Array.isArray(node))? node : [node];
	var iAry;
	var n,onn, conn;
	var nComplete = [];
	var glsl = [];
	var code = "";

	if(initCode != null) glsl.push(initCode);

	while( (n = nAry.pop()) != undefined ){
		//console.log(n.clsName,n.id,":", n.getGLSL());
		
		if( (code = n.getGLSL()) != null) glsl.push(code);

		nComplete.push(n.id);

		for(var i in n.inputs){
			if(!n.inputs[i].isConnected) continue;

			conn = n.inputs[i].conn;
			onn = conn.outputNode;

			if(nComplete.indexOf(onn.id) < 0 && nAry.indexOf(onn) < 0) nAry.push(onn);
		}
	}

	var code = glsl.reverse().join("\n\r");
	console.log("==START FINAL CODE================");
	console.log(code);
	//console.log("==END FINAL CODE==================");
	return glslTemplate(code);
}


function glslTemplate(frag){
	return { v:`#version 300 es
	layout(location=0) in vec3 a_position;
	layout(location=2) in vec2 a_uv;

	out vec2 o_uv;

	void main(void){
		o_uv = a_uv;
		gl_Position	= vec4(a_position,1.0); //matProjection * 
	}`,

	f:`#version 300 es
	precision mediump float;
	in vec2 o_uv;

	float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

	float noise2D(vec2 p){
		vec2 ip = floor(p);
		vec2 u = fract(p);
		u = u*u*(3.0-2.0*u);

		float res = mix(
			mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
			mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
		return res*res;
	}

	out vec4 finalColor;
	void main(void){
		${frag}
		//float n = noise(o_uv * 40.5);
		//n = smoothstep(0.3,0.35,n);
		//outColor = vec4(n,n,n,1.0);
		//outColor = vec4(1.0,0.0,0.0,1.0);
	}`};
}


class PreviewGen{
	constructor(cName){
		this.gl		= new GLCanvas(cName);
		this.shader	= new Shader(this.gl);
		this.quad	= Quad(this.gl);
	}

	run(code){
		if(this.shader.load(code.v,code.f)){
			this.gl.render(this.quad,this.shader);
		}
	}
}


var mod = {
	init:init,
	preview:null,
	processNodes:processNodes,
	svg:null
};

//------------------------------------------------------
export default mod;