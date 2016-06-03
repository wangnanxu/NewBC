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
//具体现场数据，全部项、已办项、待办项
.filter('SceneMessageFilter',['$rootScope',
function($rootScope){
	return function(list,type){
		var arr=new Array();
		if(list){
			if(type==0){
				return list;
			}
			var len=list.length;
			for(var i=0;i<len;i++){
				var item=JSON.parse(list[i].Examines);
				if(item && item.length>0){
					var length=item.length;
					var has=false;
					for(var j=0;j<length;j++){
						if(item[j].UserID==$rootScope.userInfo.UserID){
							has=true;
							break;
						}
					}
					if(type==1 && has){
						arr.push(list[i]);
					}
					if(type==2 && has==false){
						arr.push(list[i]);
					}
				}else if(type==2){
					arr.push(list[i]);
				}
			}
		}
		return arr;
	}
}])