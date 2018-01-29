//Need to enabled dom.moduleScripts.enabled in firefox about:config

import util from "./Util.js";

class GLCanvas{
	constructor(cID,bgColor="#000000"){
		this.canvas	= (typeof cID == "string")? document.getElementById(cID) : cID;
		this.ctx	= this.canvas.getContext("webgl2");

		if(!this.ctx){ console.error("WebGL context is not available."); return; }

		//........................................
		//Setup some defaults
		this.ctx.cullFace(this.ctx.BACK);		//Back is also default
		this.ctx.frontFace(this.ctx.CCW);		//Dont really need to set it, its ccw by default.
		this.ctx.enable(this.ctx.DEPTH_TEST);	//Shouldn't use this, use something else to add depth detection
		this.ctx.enable(this.ctx.CULL_FACE);	//Cull back face, so only show triangles that are created clockwise
		this.ctx.depthFunc(this.ctx.LEQUAL);	//Near things obscure far things
		this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending
		//this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA);
		//this.ctx.blendFunc(this.ctx.ONE,this.ctx.ONE);

		//........................................

		this.setClearColor(bgColor);
		this.clear();
	}

	//------------------------------------------------------
	//State
	//------------------------------------------------------
	clear(){ this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT); return this; };

	//Set the size of the canvas html element and the rendering view port
	setSize(w,h){

		//set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
		this.ctx.canvas.style.width = w + "px";
		this.ctx.canvas.style.height = h + "px";
		this.ctx.canvas.width = w;
		this.ctx.canvas.height = h;

		//when updating the canvas size, must reset the viewport of the canvas 
		//else the resolution webgl renders at will not change
		this.ctx.viewport(0,0,w,h);
		this.width = w;	//Need to save Width and Height to resize viewport for WebVR
		this.height = h;

		return this;
	}

	setClearColor(hex){
		var a = util.rgbArray(hex);
		this.ctx.clearColor(a[0],a[1],a[2],1.0);
		return this;
	}

	render(vao,shader,drawMode=4){ //this.ctx.TRIANGLES
		if(vao.count == 0) return;

		this.ctx.useProgram(shader.program);
		this.ctx.bindVertexArray(vao.ptr);

		if(vao.isIndexed)	this.ctx.drawElements(drawMode, vao.count, this.ctx.UNSIGNED_SHORT, 0); 
		else				this.ctx.drawArrays(drawMode, 0, vao.count);

		this.ctx.bindVertexArray(null);
		this.ctx.useProgram(null);
	}

	//------------------------------------------------------
	//Buffers
	//------------------------------------------------------
	//Create and fill our Array buffer.
	createArrayBuffer(floatAry,isStatic,isUnbind){
		if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

		var buf = this.ctx.createBuffer();
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buf);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, floatAry, (isStatic)? this.ctx.STATIC_DRAW : this.ctx.DYNAMIC_DRAW);

		if(isUnbind != false) this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER,null);
		return buf;
	}


	//------------------------------------------------------
	//Shaders
	//------------------------------------------------------
	createProgramFromText(vShaderTxt,fShaderTxt,doValidate,transFeedbackVars=null){
		var vShader		= this.createShader(vShaderTxt,this.ctx.VERTEX_SHADER);		if(!vShader)	return null;
		var fShader		= this.createShader(fShaderTxt,this.ctx.FRAGMENT_SHADER);	if(!fShader){	this.ctx.deleteShader(vShader); return null; }			
		return this.createProgram(vShader, fShader, true, transFeedbackVars);
	}

	//Create a shader by passing in its code and what type
	createShader(src,type){
		var shader = this.ctx.createShader(type);
		this.ctx.shaderSource(shader,src);
		this.ctx.compileShader(shader);

		//Get Error data if shader failed compiling
		if(!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)){
			console.error("Error compiling shader : " + src, this.ctx.getShaderInfoLog(shader));
			this.ctx.deleteShader(shader);
			return null;
		}

		return shader;
	}

	//Link two compiled shaders to create a program for rendering.
	createProgram(vShader,fShader,doValidate,transFeedbackVars=null){
		//Link shaders together
		var prog = this.ctx.createProgram();
		this.ctx.attachShader(prog,vShader);
		this.ctx.attachShader(prog,fShader);

		//Force predefined locations for specific attributes. If the attibute isn't used in the shader its location will default to -1
		//ctx.bindAttribLocation(prog,ATTR_POSITION_LOC,ATTR_POSITION_NAME);
		//ctx.bindAttribLocation(prog,ATTR_NORMAL_LOC,ATTR_NORMAL_NAME);
		//ctx.bindAttribLocation(prog,ATTR_UV_LOC,ATTR_UV_NAME);

		//Need to setup Transform Feedback Varying Vars before linking the program.
		if(transFeedbackVars != null) this.ctx.transformFeedbackVaryings(prog, transFeedbackVars, this.ctx.SEPARATE_ATTRIBS); //INTERLEAVED_ATTRIBS

		this.ctx.linkProgram(prog);

		//Check if successful
		if(!this.ctx.getProgramParameter(prog, this.ctx.LINK_STATUS)){
			console.error("Error creating shader program.", this.ctx.getProgramInfoLog(prog));
			this.ctx.deleteProgram(prog); return null;
		}

		//Only do this for additional debugging.
		if(doValidate){
			this.ctx.validateProgram(prog);
			if(!this.ctx.getProgramParameter(prog,this.ctx.VALIDATE_STATUS)){
				console.error("Error validating program", this.ctx.getProgramInfoLog(prog));
				this.ctx.deleteProgram(prog); return null;
			}
		}
		
		//Can delete the shaders since the program has been made.
		this.ctx.detachShader(prog,vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
		this.ctx.detachShader(prog,fShader);
		this.ctx.deleteShader(fShader);
		this.ctx.deleteShader(vShader);

		return prog;
	}

	//------------------------------------------------------
	//Textures
	//------------------------------------------------------
	loadTexture(name,img,doYFlip,useMips){ 
		var tex = mod.res.textures[name] = ctx.createTexture();  
		return updateTexture(name,img,doYFlip,useMips);
	}

	updateTexture(name,img,doYFlip,useMips){ //can be used to pass video frames to gpu texture.
		var tex = mod.res.textures[name];	

		if(doYFlip == true) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);	//Flip the texture by the Y Position, So 0,0 is bottom left corner.

		ctx.bindTexture(ctx.TEXTURE_2D, tex); //bind texture so we can start configuring it.
		ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, img);	//Push image to GPU.
		
		if(useMips == true){
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);					//Setup up scaling
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
			ctx.generateMipmap(ctx.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.
		}else{
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER,	ctx.NEAREST);
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER,	ctx.NEAREST);
			//ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S,		ctx.CLAMP_TO_EDGE);
			//ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T,		ctx.CLAMP_TO_EDGE);
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S,		ctx.REPEAT); //TODO make this configurable on load.
			ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T,		ctx.REPEAT);
		}

		ctx.bindTexture(ctx.TEXTURE_2D,null); //Unbind
		
		if(doYFlip == true) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);	//Stop flipping textures
		return tex;	
	}
}

export default GLCanvas;