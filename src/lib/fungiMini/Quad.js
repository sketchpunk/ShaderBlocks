import Vao	from "./Vao.js";

//Define quad with a Min Bound and Max Bound X,Y
function Quad(gl,bx0=-1,by0=-1,bx1=1,by1=1){
	var d 	= Quad.vertData(bx0,by0,bx1,by1),
		vao = Vao.standardRenderable(gl,3,d.vertices,null,d.uv,d.index);
	return vao;
}

Quad.vertData = function(bx0=-1,by0=-1,bx1=1,by1=1){
	return {
		vertices	:[ bx0,by0,0.0,   bx1,by0,0.0,   bx1,by1,0.0,   bx0,by1,0.0 ],
		uv			:[ 0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0 ],
		index 		:[ 0,1,2, 2,3,0 ]
	};
}

export default Quad;