import gl,{ VAO }	from "./gl.js";

//Define quad with a Min Bound and Max Bound X,Y
function Quad(bx0=-1,by0=-1,bx1=1,by1=1,name="Quad"){ //TODO Add a Is standing or floor type of quad.
	var d = Quad.vertData(bx0,by0,bx1,by1);
	var vao = VAO.standardRenderable(name,3,d.vertices,null,d.uv,d.index);
	return vao;
}

Quad.vertData = function(bx0,by0,bx1,by1){
	return {
		vertices	:[ bx0,by0,0.0,   bx1,by0,0.0,   bx1,by1,0.0,   bx0,by1,0.0 ],
		uv			:[ 0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0 ],
		index 		:[ 0,1,2, 2,3,0 ]
	};
}

export default Quad;