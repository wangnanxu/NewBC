commModule
//搜索项目
.filter('SerchProjectFilter',function(){
	return function(list,str){
		var arr=new Array();
		if(str==null || str==""){
			return list;
		}
		if(list){
			var len=list.length;
			for(var i=0;i<len;i++){
				if(list[i].ProjectName.indexOf(str)!=-1){
					arr.push(list[i]);
				}
			}
		}
		return arr;
	}
})
//搜索现场
.filter('SerchSceneFilter',function(){
	return function(list,str){
		var arr=new Array();
		if(str==null || str==""){
			return list;
		}
		if(list){
			var len=list.length;
			for(var i=0;i<len;i++){
				if(list[i].ProjectName.indexOf(str)!=-1){
					arr.push(list[i]);
				}
			}
		}
		return arr;
	}
})
//搜索资料
.filter('SerchMaterialFilter',function(){
	return function(list,str){
		var arr=new Array();
		if(str==null || str==""){
			return list;
		}
		if(list){
			var len=list.length;
			for(var i=0;i<len;i++){
				if(list[i].Name.indexOf(str)!=-1){
					arr.push(list[i]);
				}
			}
		}
		return arr;
	}
})