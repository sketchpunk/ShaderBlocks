import { BaseNode, PreviewNode, Util } from "./Base.js";


class MultiplyNode extends BaseNode{
	constructor(id, x, y, defaultValue = null){
		super(id,x,y,90);
		this.setHeader("Multiple",true)
			.addOutput("O")
			.addInput("A")
			.addInput("B")
			.addOption("num",Util.uiSingleFloat("B",defaultValue));

		this._allowVarNaming();
	}

	getCode(){
		var i = this.inputs;

		//..............................
		if(!i.A.isConnected){
			console.log(this.clsName,"A is not connected");
			return null;
		}
		//..............................
		var b = (i.B.isConnected)? i.B.getOutputResult() : this.options.num.input.value;
		if(!b){
			console.log(this.clsName,"Missing a B value");
			return null;
		}

		//..............................
		var a = i.A.getOutputResult();
		return `${a} * ${b}`;
	}

	getOutputResult(oName){ return (this.varName_Local == null)? this.getCode() : this.varName_Local; }

	getGLSL(){
		if(this.varName_Local != null){
			return `float ${this.varName_Local} = ${this.getCode()};`;
		}
		return null;
	}
}


class SmoothStepNode extends PreviewNode{
	constructor(id, x, y){
		super(id,x,y,80);
		this.setHeader("SmoothStep",true)
			.addOutput("O")
			.addInput("T")
			.addOption("A",Util.uiSingleFloat("A","0.45"))
			.addOption("B",Util.uiSingleFloat("B","0.50"));
		this._allowVarNaming();
	}

	runPreview(){
		var v = `n${this.id}_sstep_final`;
		var code = `float ${v} = ${this.getCode()};`;

		super.runPreview(null,`${code}\nfinalColor = vec4(${v},${v},${v},1.0);`);
	}

	getCode(){
		var i = this.inputs,
			o = this.options;

		//....................................
		if(!i.T.isConnected){
			console.log(this.clsName,"T is has no connection");
			return null;
		}

		//....................................
		if(o.A.input.value == "" || o.B.input.value == ""){
			console.log(this.clsName,"A and B must be filled out.");
			return null;
		}

		//....................................
		var t = i.T.getOutputResult(),
			a = o.A.input.value,
			b = o.B.input.value;

		return `smoothstep(${a}, ${b}, ${t})`;
	}

	getOutputResult(oName){
		return (this.varName_Local == null)? this.getCode() : this.varName_Local;
	}

	getGLSL(){ 
		if(this.varName_Local != null){
			var code = this.getCode();
			if(code != null) return `float ${this.varName_Local} = ${code};`;
		}

		return null;
	}
}


export { MultiplyNode,SmoothStepNode  };