//------------------------------------------------------
// Shaders
//------------------------------------------------------
class Shader{
	constructor(gl,vertShader=null,fragShader=null,tfeedback=null){
		this.gl			= gl;
		this.program	= (vertShader != null && fragShader != null)?
							gl.createProgramFromText(vertShader, fragShader, true, tfeedback) : null;

		//this.useModelMatrix = true;
		//this.useNormalMatrix = false;

		this._UniformList = [];		//List of Uniforms that have been loaded in. Key=UNIFORM_NAME {loc,type}
		this._TextureList = [];		//List of texture uniforms, Indexed {loc,tex}

		if(this.program != null) gl.ctx.useProgram(this.program);
	}

	load(vertShader,fragShader){
		this.dispose();
		this.program = this.gl.createProgramFromText(vertShader,fragShader,true);
		if(this.program != null) this.gl.ctx.useProgram(this.program);
		
		return (this.program != null);	
	}

	//---------------------------------------------------
	// Methods For Shader Prep.
	//---------------------------------------------------
	//Takes in unlimited arguments. Its grouped by two so for example (UniformName,UniformType): "uColors","3fv"
	prepareUniforms(uName,uType){
		var ary = (arguments.length == 1)? arguments[0] : arguments,
			loc = 0;

		for(var i=0; i < ary.length; i+=2){
			loc = this.gl.ctx.getUniformLocation(this.program,ary[i]); 
			if(loc != null) this._UniformList[ary[i]] = {loc:loc,type:ary[i+1]};
			else console.log("Uniform not found " + ary[i]);
		}

		return this;
	}

	prepareUniformBlocks(ubo,blockIndex){
		var ind = 0;
		for(var i=0; i < arguments.length; i+=2){
			//ind = this.gl.getUniformBlockIndex(this.program,arguments[i].blockName); //TODO This function does not return block index, need to pass that value in param
			//console.log("Uniform Block Index",ind,ubo.blockName,ubo.blockPoint);

			this.gl.ctx.uniformBlockBinding(this.program, arguments[i+1], arguments[i].blockPoint);
			
			//console.log(this.gl.getActiveUniformBlockParameter(this.program, 0, this.gl.UNIFORM_BLOCK_DATA_SIZE)); //Get Size of Uniform Block
			//console.log(this.gl.getActiveUniformBlockParameter(this.program, 0, this.gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES));
			//console.log(this.gl.getActiveUniformBlockParameter(this.program, 0, this.gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS));
			//console.log(this.gl.getActiveUniformBlockParameter(this.program, 0, this.gl.UNIFORM_BLOCK_BINDING));
		}
		return this;
	}


	//---------------------------------------------------
	// Setters Getters
	//---------------------------------------------------
	//Uses a 2 item group argument array. Uniform_Name, Uniform_Value;
	setUniforms(uName,uValue){
		if(arguments.length % 2 != 0){ console.log("setUniforms needs arguments to be in pairs."); return this; }

		var texCnt	= 0, //TODO Loading textures only works if doing all uniforms in one go, material loads one at a time.
			ctx		= this.gl.ctx,
			name;

		for(var i=0; i < arguments.length; i+=2){
			name = arguments[i];
			if(this._UniformList[name] === undefined){ console.log("uniform not found " + name); return this; }

			switch(this._UniformList[name].type){
				case "float":	ctx.uniform1f(this._UniformList[name].loc, arguments[i+1]); break;
				case "vec2":	ctx.uniform2fv(this._UniformList[name].loc, arguments[i+1]); break;
				case "vec3":	ctx.uniform3fv(this._UniformList[name].loc, arguments[i+1]); break;
				case "vec4":	ctx.uniform4fv(this._UniformList[name].loc, arguments[i+1]); break;
				case "mat4":	ctx.uniformMatrix4fv(this._UniformList[name].loc,false,arguments[i+1]); break;
				case "mat3":	ctx.uniformMatrix3fv(this._UniformList[name].loc,false,arguments[i+1]); break;
				case "mat2x4": 	ctx.uniformMatrix2x4fv(this._UniformList[name].loc,false,arguments[i+1]); break;
				case "sample2D":
					ctx.activeTexture(ctx.TEXTURE0 + texCnt);
					ctx.bindTexture(ctx.TEXTURE_2D,arguments[i+1]);
					ctx.uniform1i(this._UniformList[name].loc,texCnt);
					texCnt++;
					break;
				default: console.log("unknown uniform type for " + name); break;
			}
		}
		return this;
	}


	//---------------------------------------------------
	// Methods
	//---------------------------------------------------
	activate(){ this.gl.ctx.useProgram(this.program); return this; }
	deactivate(){ this.gl.ctx.useProgram(null); return this; }

	//function helps clean up resources when shader is no longer needed.
	dispose(){
		if(this.program == null) return this;

		//unbind the program if its currently active
		if(this.gl.ctx.getParameter(this.gl.ctx.CURRENT_PROGRAM) === this.program) this.gl.ctx.useProgram(null);
		this.gl.ctx.deleteProgram(this.program);
		this.program = null;
		return this;
	}

	/*
	preRender(){
		this.gl.ctx.useProgram(this.program); //Save a function call and just activate this shader program on preRender

		//If passing in arguments, then lets push that to setUniforms for handling. Make less line needed in the main program by having preRender handle Uniforms
		if(arguments.length > 0) this.setUniforms.apply(this,arguments);

		//..........................................
		//Prepare textures that might be loaded up.
		//TODO, After done rendering need to deactivate the texture slots
		if(this._TextureList.length > 0){
			var texSlot;
			for(var i=0; i < this._TextureList.length; i++){
				texSlot = gl.ctx["TEXTURE" + i];
				//gl.ctx.activeTexture(texSlot);
				//gl.ctx.bindTexture(gl.ctx.TEXTURE_2D,this._TextureList[i].tex);
				//gl.ctx.uniform1i(this._TextureList[i].loc,i);
			}
		}

		return this;
	}
	*/
}

export default Shader;