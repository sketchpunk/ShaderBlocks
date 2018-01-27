import gl, { FBO }	from "./gl.js";
import Mat4	from "./maths/Mat4.js";
import Shader from "./util/Shader.js";
import Quad from "./Quad.js";

export default{
	scene			:[],		//Array that holds the heirarchy of transforms / renderables.
	deltaTime		:0,
	sinceStart		:0,

	//Begin the GL Context
	init:function(){
		//..................................
		//Setup GL
		gl.set("FungiCanvas").setSize(256,256).clear();

		//..................................
		//Setup Projection Matrix
		/*
		var proMatrix = new Float32Array(16);
		var ratio = gl.ctx.canvas.width / gl.ctx.canvas.height;
		Mat4.perspective(proMatrix, 45, ratio, 0.1, 100.0);

		gl.UBOTransform.update("matProjection",proMatrix); //Initialize The Transform UBO.
		

		//..................................
		var vaoQuad = Quad();

		//..................................
		var shader = new Shader.Builder(`#version 300 es
	layout(location=0) in vec3 a_position;
	layout(location=2) in vec2 a_uv;

	uniform UBOTransform{
		mat4 matProjection;
		mat4 matCameraView;
		vec3 posCamera;
		float fTime;
	};

	out vec2 o_uv;

	void main(void){
		o_uv = a_uv;
		gl_Position	= vec4(a_position,1.0); //matProjection * 
	}
		`,`#version 300 es
	precision mediump float;
	in vec2 o_uv;

	float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

	float noise(vec2 p){
		vec2 ip = floor(p);
		vec2 u = fract(p);
		u = u*u*(3.0-2.0*u);

		float res = mix(
			mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
			mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
		return res*res;
	}

	out vec4 outColor;
	void main(void){ 
		float n = noise(o_uv * 40.5);
		//n = smoothstep(0.3,0.35,n);
		outColor = vec4(n,n,n,1.0);
		//outColor = vec4(1.0,0.0,0.0,1.0);
	}
		`);
		//shader.prepareUniformBlocks(gl.UBOTransform,0);

		//..................................
		shader.activate();
		gl.ctx.bindVertexArray(vaoQuad.ptr);

		if(vaoQuad.isIndexed)	gl.ctx.drawElements(gl.ctx.TRIANGLES, vaoQuad.count, gl.ctx.UNSIGNED_SHORT, 0); 
		else					gl.ctx.drawArrays(gl.ctx.TRIANGLES, 0, vaoQuad.count);
*/
		//..................................
		return this;
	},

	//Get a frame ready to be rendered.
	update:function(){
		//this.mainCamera.update();

		/*
		gl.UBOTransform.update(
			"matCameraView",this.mainCamera.invertedLocalMatrix,
			"posCamera",this.mainCamera.getWorldPosition(),  //Because of Orbit, Position isn't true worldspace position, need to rotate , //this.mainCamera.position
			"fTime",new Float32Array( [this.sinceStart] )
		);
		*/

		gl.clear();
		return this;
	}
}