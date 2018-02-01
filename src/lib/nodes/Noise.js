import { BaseNode, PreviewNode, Util } from "./Base.js";

class Noise2DNode extends PreviewNode{
	constructor(id, x, y){
		super(id,x,y,80);
		this.setHeader("Noise2D",true)
			.addOutput("O")
			.addInput("XY")
			.addInput("X")
			.addInput("Y");
		this._allowVarNaming();
	}

	runPreview(){
		var vName = `n${this.id}_noise2D`,
			pCode = `float ${vName} = ${this.getCode()};\n\r`;

		super.runPreview(null,`${pCode} finalColor = vec4(${vName},${vName},${vName},1.0);`);
	}

	getOutputResult(oName){	
		if(this.varName_Local != null) return this.varName_Local;
		return this.getCode();
	}

	getCode(){
		var i = this.inputs;

		if(i.XY.isConnected) return `noise2D(${i.XY.getOutputResult()})`;
		else if(i.X.isConnected && i.Y.isConnected){
			return `noise2D(vec2( ${i.X.getOutputResult()}, ${i.Y.getOutputResult()} ))`;
		}

		return null;
	}

	getGLSL(){ 
		if(this.varName_Local != null){
			return `float ${this.varName_Local} = ${this.getCode()};`;
		}

		return null;
	}
}

export { Noise2DNode };