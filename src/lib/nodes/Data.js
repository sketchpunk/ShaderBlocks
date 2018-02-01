import { BaseNode, PreviewNode, Util } from "./Base.js";

class FinalNode extends PreviewNode{
	constructor(id, x, y){
		super(id,x,y,200);
		this.setHeader("Final Output",true)
			.addInput("VEC")
			.addInput("R","red")
			.addInput("G","green")
			.addInput("B","blue")
			.addInput("A","alpha");
	}

	runPreview(){
		super.runPreview(this);
	}

	getGLSL(){
		var v = this.inputs;
		if( v.VEC.isConnected ){ //TODO - Check Type and create different output based on what 
			var vec = v.VEC.getOutputResult(); 			
			return `finalColor = ${vec};`;

		}else if( v.R.isConnected && v.G.isConnected && v.B.isConnected && v.A.isConnected ){
			var r = v.R.getOutputResult(),
				g = v.G.getOutputResult(),
				b = v.B.getOutputResult(),
				a = v.A.getOutputResult();
			return `finalColor = vec4(${r},${g},${b},${a});`;
		}
		return null;
	}
}

class UVNode extends PreviewNode{
	constructor(id, x, y){
		super(id,x,y,80);
		this.setHeader("UV",true)
			.addOutput("V2")
			.addOutput("U")
			.addOutput("V");
	}

	runPreview(){
		super.runPreview(null,"finalColor = vec4(o_uv,0.0,1.0);");
	}

	getOutputResult(oName){
		switch(oName){
			case "V2" : return "o_uv";
			case "U" : return "o_uv.s";
			case "V" : return "o_uv.t";
			default:
				console.log(this.clsName,oName,"Unknown Output Name");
				return null;
		}
	}

	getGLSL(){ return null; }
}

export { FinalNode, UVNode  };