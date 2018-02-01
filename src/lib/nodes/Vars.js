import { BaseNode, PreviewNode, Util } from "./Base.js";


class FloatNode extends BaseNode{
	constructor(id, x, y, defaultValue = null){
		super(id,x,y,90);
		this.setHeader("Float",true)
			.addOutput("F")
			.addOption("num",Util.uiSingleFloat("Float",defaultValue));

		this._allowVarNaming();
	}

	getOutputResult(oName){
		return (this.varName_Local == null)? this.options.num.input.value : this.varName_Local;
	}

	getGLSL(){
		if(this.varName_Local != null){
			if(this.options.num.input.value == ""){
				console.log("ERROR-Float","missing value");
				return null;
			}
			return `float ${this.varName_Local} = ${this.options.num.input.value};`;
		}
		return null;
	}
}


class Vec4Node extends BaseNode{
	constructor(id, x, y){
		super(id,x,y,80);
		this.setHeader("Vec4",true)
			.addOutput("V")
			.addInput("X")
			.addInput("Y")
			.addInput("Z")
			.addInput("W")
			.addOption("X",Util.uiSingleFloat("X/R","1.0"))
			.addOption("Y",Util.uiSingleFloat("Y/G","0.0"))
			.addOption("Z",Util.uiSingleFloat("Z/B","0.0"))
			.addOption("W",Util.uiSingleFloat("W/A","1.0"));

		this.comList = ["X","Y","Z","W"];
		this._allowVarNaming();
	}

	getCode(){
		var i = this.inputs,
			o = this.options,
			c = "",
			d = [];

		for(var j=0; j < 4; j++){
			c = this.comList[j];

			if(i[c].isConnected)			d[j] = i[c].getOutputResult();
			else if(o[c].input.value != "")	d[j] = o[c].input.value;
			else { console.log("ERROR",this.clsName,"Missing "+c+" Value"); return null; }			
		}

		return `vec4(${d[0]},${d[1]},${d[2]},${d[3]})`;
	}

	getOutputResult(oName){
		return (this.varName_Local == null)? this.getCode() : this.varName_Local;
	}

	getGLSL(){
		if(this.varName_Local != null){
			var code = this.getCode();
			if(code != null) return `vec4 ${this.varName_Local} = ${code};`;
		}
		return null;
	}
}


export { FloatNode, Vec4Node  };