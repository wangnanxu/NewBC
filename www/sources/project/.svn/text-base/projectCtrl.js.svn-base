projectModule
	.controller('ProjectCtrl', ['$scope', 'ProjectServ','$ionicScrollDelegate','$timeout',
		function($scope, ProjectServ,$ionicScrollDelegate,$timeout) {
			$scope.loadMore=loadMore;//上拉加载更多
			$scope.GotoScene=GotoScene;//跳转到现场页面
			$scope.serverdata = ProjectServ.GetServerData();
		
			$scope.$on("$ionicView.enter",function() {
				ProjectServ.InitData();
			})
			$scope.$on("$ionicView.unload",function(){
				ProjectServ.Destory();
			})
			function loadMore(){
				ProjectServ.ShowProject();
				$scope.$broadcast('scroll.infiniteScrollComplete');
				
			}
			function GotoScene(projectid,manager){
				ProjectServ.GotoScene(projectid,manager);
			}
		}
	])