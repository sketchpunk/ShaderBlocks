const ATTR_POSITION_LOC = 0;
const ATTR_NORM_LOC		= 1;
const ATTR_UV_LOC		= 2;

class Vao{
	constructor(gl){
		this.gl		= gl;
		this.ctx	= gl.ctx;
		this.vao	= null;
	}


	//----------------------------------------------------------
	create(){
		this.vao = { ptr:this.ctx.createVertexArray(), count:0, isIndexed:false };
		this.ctx.bindVertexArray(this.vao.ptr);
		return this;
	}

	finalize(){
		if(this.vao.count == 0 && this.vao.bVertices !== undefined) this.vao.count = this.vao.bVertices.count;

		this.ctx.bindVertexArray(null);
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER,null);
		this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER,null);

		return this.vao;
	}

	updateAryBufSubData(bufPtr,offset,data){
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, bufPtr);
		this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, offset, data, 0, null);
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
	}


	//----------------------------------------------------------
	//Float Array Buffers
	floatArrayBuffer(name,aryData,attrLoc,compLen,stride,offset,isStatic,isInstance){
		var rtn = {
			ptr : this.ctx.createBuffer(),
			compLen : compLen,
			stride : stride,
			offset : offset,
			count : aryData.length / compLen
		};

		var ary = (aryData instanceof Float32Array)? aryData : new Float32Array(aryData);

		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, rtn.ptr);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, ary, (isStatic != false)? this.ctx.STATIC_DRAW : this.ctx.DYNAMIC_DRAW );
		this.ctx.enableVertexAttribArray(attrLoc);
		this.ctx.vertexAttribPointer(attrLoc,compLen,this.ctx.FLOAT,false,stride || 0,offset || 0);

		if(isInstance == true) this.ctx.vertexAttribDivisor(attrLoc, 1);

		this.vao[name] = rtn;
		return this;
	}

	partitionFloatBuffer(attrLoc,compLen,stride,offset,isInstance){
		this.ctx.enableVertexAttribArray(attrLoc);
		this.ctx.vertexAttribPointer(attrLoc,compLen,this.ctx.FLOAT,false,stride,offset);

		if(isInstance == true) this.ctx.vertexAttribDivisor(attrLoc, 1);
		
		return this;		
	}

	emptyFloatArrayBuffer(name,byteCount,attrLoc,compLen,stride,offset,isStatic,isInstance){
		var rtn = {
			ptr : this.ctx.createBuffer(),
			compLen : compLen,
			stride : stride,
			offset : offset,
			count : 0
		};

		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, rtn.ptr);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER,byteCount,(isStatic != false)? this.ctx.STATIC_DRAW :this.ctx.DYNAMIC_DRAW);		//Allocate Space needed
		this.ctx.enableVertexAttribArray(attrLoc);
		this.ctx.vertexAttribPointer(attrLoc,compLen,this.ctx.FLOAT,false,stride || 0,offset || 0);

		if(isInstance == true) this.ctx.vertexAttribDivisor(attrLoc, 1);
		
		this.vao[name] = rtn;
		return this;
	}


	//----------------------------------------------------------
	//Matrix 4 Array Buffer
	mat4ArrayBuffer(name,aryData,attrLoc,isStatic,isInstance){
		var rtn = {
			ptr : this.ctx.createBuffer(),
			compLen : 4,
			stride : 64,
			offset : 0,
			count : aryFloat.length / 16
		};

		var ary = (aryData instanceof Float32Array)? aryData : new Float32Array(aryData);

		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, rtn.ptr);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, ary, (isStatic != false)? this.ctx.STATIC_DRAW : this.ctx.DYNAMIC_DRAW );
		
		//Matrix is treated like an array of vec4, So there is actually 4 attributes to setup that
		//actually makes up a single mat4.
		this.ctx.enableVertexAttribArray(attrLoc);
		this.ctx.vertexAttribPointer(attrLoc,4,this.ctx.FLOAT,false,64,0);

		this.ctx.enableVertexAttribArray(attrLoc+1);
		this.ctx.vertexAttribPointer(attrLoc+1,4,this.ctx.FLOAT,false,64,16);
		
		this.ctx.enableVertexAttribArray(attrLoc+2);
		this.ctx.vertexAttribPointer(attrLoc+2,4,this.ctx.FLOAT,false,64,32);
		
		this.ctx.enableVertexAttribArray(attrLoc+3);
		this.ctx.vertexAttribPointer(attrLoc+3,4,this.ctx.FLOAT,false,64,48);
		
		if(isInstance == true){
			this.ctx.vertexAttribDivisor(attrLoc, 1);
			this.ctx.vertexAttribDivisor(attrLoc+1, 1);
			this.ctx.vertexAttribDivisor(attrLoc+2, 1);
			this.ctx.vertexAttribDivisor(attrLoc+3, 1);
		}

		this.vao[name] = rtn;
		return this;
	}


	//----------------------------------------------------------
	//Indexes
	indexBuffer(name,aryData,isStatic){
		var rtn = { ptr : this.ctx.createBuffer(), count : aryData.length },
			ary = ( aryData instanceof Uint16Array )? aryData : new Uint16Array(aryData);

		this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, rtn.ptr );  
		this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, ary, (isStatic != false)? this.ctx.STATIC_DRAW : this.ctx.DYNAMIC_DRAW );

		this.vao[name] = rtn;
		this.vao.isIndexed	= true;
		this.vao.count		= aryData.length;

		return this;
	}

	emptyIndexBuffer(name,aryCount,isStatic){
		var rtn = { ptr : this.ctx.createBuffer(), count : 0 };

		this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, rtn.ptr );  
		this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, aryCount, (isStatic != false)? this.ctx.STATIC_DRAW : this.ctx.DYNAMIC_DRAW );

		this.vao[name] = rtn;
		this.isIndexed = true;

		return this;
	}


	//----------------------------------------------------------
	//Templates
	static standardRenderable(gl,vertCompLen,aryVert,aryNorm,aryUV,aryInd){
		var v = new Vao(gl).create().
				floatArrayBuffer("bVertices", aryVert, ATTR_POSITION_LOC, vertCompLen, 0, 0, true );

		if(aryNorm)	v.floatArrayBuffer("bNormal",	aryNorm,	ATTR_NORM_LOC,	3,0,0,true);
		if(aryUV)	v.floatArrayBuffer("bUV",		aryUV,		ATTR_UV_LOC,	2,0,0,true);
		if(aryInd)	v.indexBuffer("bIndex",	aryInd, true);

		return v.finalize();
	}
}

export default Vao;