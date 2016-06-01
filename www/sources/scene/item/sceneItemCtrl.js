sceneModule
	.controller('SceneItemCtrl', ['$scope', 'SceneItemServ', '$stateParams', '$ionicModal','$ionicPopover',
		function($scope, SceneItemServ, $stateParams, $ionicModal,$ionicPopover) {
			$scope.GoBack = GoBack;
			$scope.HandleScene=HandleScene;
			$scope.serverdata = SceneItemServ.GetServerData();
			$scope.LoadMore = LoadMore();
			$scope.DeleteComment = DeleteComment(); //删除评论
			$scope.SceneItemSign = SceneItemSign; //签到签退
			$scope.GotoAddSceneMessage = GotoAddSceneMessage; //添加现场信息
			$scope.GotoMaterialScene = GotoMaterialScene; //手册资料
			$scope.HideModal = HideModal; //隐藏发送信息模板
			$scope.ConfirmAdd = ConfirmAdd; //确认添加
			$scope.$on('$ionicView.enter', function() {
				SceneItemServ.InitData();
			})

			function LoadMore() {

			}

			function GoBack() {
				SceneItemServ.GoBack();
			}
			function HandleScene(){
				
			}

			function DeleteComment(parentindex, index) {

			}

			function SceneItemSign(type) {
					

			}
			function GotoAddSceneMessage() {
				if ($scope.addMessageModal == null) {
					$ionicModal.fromTemplateUrl('sources/scene/item/addSceneMessageModal.html', {
						scope: $scope,
						animation: 'slide-in-right'
					}).then(function(modal) {
						$scope.addMessageModal = modal;
						$scope.addMessageModal.show();
					});
				} else {
					$scope.addMessageModal.show();
				}
			}

			function HideModal() {
				if ($scope.addMessageModal) {
					$scope.addMessageModal.hide();
				}
			}

			function ConfirmAdd() {

			}

			function GotoMaterialScene() {

			}

		}
	])