sceneModule
	.controller('SceneCtrl', ['$scope', 'SceneServ', '$stateParams', '$ionicModal',
		function($scope, SceneServ, $stateParams, $ionicModal) {
			$scope.serverdata = SceneServ.GetServerData();
			$scope.GoBack = GoBack; //返回
			$scope.GotoScene = GotoScene; //进入现场子列表
			$scope.ShowAddScene = ShowAddScene; //显示添加现场模块
			$scope.HideAddSceneModal = HideAddSceneModal; //隐藏添加现场模块
			$scope.ShowSceneTypeModal=ShowSceneTypeModal;//显示现场类型模块
			$scope.HideSceneTypeModal=HideSceneTypeModal;
			$scope.ChangeShow=ChangeShow;//切换分配人员
			$scope.ConfirmAddScene=ConfirmAddScene;//确认添加
			$scope.SelectTime=SelectTime;//选择时间
			$scope.ShowUpdateModal=ShowUpdateModal;//设置按钮
			$scope.ShowMap=ShowMap;
			$scope.HideMapModal=HideMapModal;
			$scope.$on("$ionicView.enter", function() {
				SceneServ.InitData($stateParams.projectID, $stateParams.manager, $stateParams.sceneID);
			})
			function GoBack() {
				SceneServ.GoBack();
			}

			function GotoScene(index) {
				SceneServ.GotoScene(index);
			}

			function ShowAddScene(type) {
				if (SceneServ.CheckPermission('AddScene')) {
					if ($scope.addSceneModal == null) {
						$ionicModal.fromTemplateUrl('sources/scene/addSceneModal.html', {
							scope: $scope,
							animation: 'slide-in-right'
						}).then(function(modal) {
							$scope.addSceneModal = modal;
							$scope.addSceneModal.show();
							SceneServ.InitAddScene(type);
							if(type==1){
								HideUpdateModal();
							}
						});
					} else {
						if(type==1){
							HideUpdateModal();
						}
						$scope.addSceneModal.show();
						SceneServ.InitAddScene(type);
					}
				}
			}
			function HideAddSceneModal() {
				if ($scope.addSceneModal) {
					SceneServ.ReInitAddSceneData();
					$scope.addSceneModal.hide();
				}
			}
			function ChangeShow(){
				SceneServ.ChangeShow();
			}
			function ShowSceneTypeModal(type,index){
					if ($scope.sceneTypeModal == null) {
						$ionicModal.fromTemplateUrl('sources/scene/sceneTypeModal.html', {
							scope: $scope,
							animation: 'slide-in-right'
						}).then(function(modal) {
							$scope.sceneTypeModal = modal;
							$scope.sceneTypeModal.show();
							SceneServ.InitSceneTypeModal(type,index);
						});
					} else {
						$scope.sceneTypeModal.show();
						SceneServ.InitSceneTypeModal(type,index);
					}
			}
			function HideSceneTypeModal(){
				if($scope.sceneTypeModal){
					SceneServ.ConfirmSelectType();
					$scope.sceneTypeModal.hide();
				}
			}
			function ConfirmAddScene(){
				var name=$scope.serverdata.addSceneName;
				SceneServ.ConfirmAddScene(name,function(){
					HideAddSceneModal();
				});
				
			}
			function SelectTime(id){
				SceneServ.SelectTime(id);
			}
			function ShowUpdateModal(index){
				if($scope.btnModal==null){
					$ionicModal.fromTemplateUrl('sources/scene/btnModal.html', {
							scope: $scope,
							animation: 'slide-in-right'
						}).then(function(modal) {
							$scope.btnModal = modal;
							$scope.btnModal.show();
							SceneServ.InitUpdateModal(index)
						});
				}else{
					$scope.btnModal.show();
					SceneServ.InitUpdateModal(index)
				}
			}
			function HideUpdateModal(){
				if($scope.btnModal){
					$scope.btnModal.hide();
				}
			}
			function ShowMap(){
				HideUpdateModal();
				if($scope.mapModal==null){
					$ionicModal.fromTemplateUrl('sources/scene/mapModal/mapModal.html', {
							scope: $scope,
							animation: 'slide-in-right'
						}).then(function(modal) {
							$scope.mapModal = modal;
							$scope.mapModal.show();
						});
				}else{
					$scope.mapModal.show();
				}
			}
			function HideMapModal(){
				if($scope.mapModal){
					$scope.mapModal.hide();
				}
			}
		}
	])