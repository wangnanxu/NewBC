sceneModule
	.controller('SceneItemCtrl', ['$scope', 'SceneItemServ', '$stateParams', '$ionicModal', '$ionicScrollDelegate',
		function($scope, SceneItemServ, $stateParams, $ionicModal, $ionicScrollDelegate) {
			$scope.GoBack = GoBack;
			$scope.HandleScene = HandleScene;

			$scope.loadMoreMessage = loadMoreMessage;
			$scope.DeleteComment = DeleteComment; //删除评论
			$scope.GotoAddSceneMessage = GotoAddSceneMessage; //整改

			$scope.SceneItemSign = SceneItemSign; //签到签退
			$scope.GotoAddSceneMessage = GotoAddSceneMessage; //添加现场信息
			$scope.GotoMaterialScene = GotoMaterialScene; //手册资料

			$scope.ExamineSceneMessage = ExamineSceneMessage; //审核消息
			$scope.CommentSceneMessage = CommentSceneMessage; //评论消息
			$scope.DeleteSceneMessage = DeleteSceneMessage; //删除消息
			$scope.ArchiveSceneMessage = ArchiveSceneMessage; //归档消息

			$scope.HideModal = HideModal; //隐藏发送信息模板
			$scope.ConfirmAdd = ConfirmAdd; //确认添加
			$scope.SelectPhotoBtn = SelectPhotoBtn; //选择添加照片方式
			$scope.SelectPhoto = SelectPhoto; //从相册选择照片
			$scope.TakePhoto = TakePhoto; //照相
			
			$scope.ShowMap=ShowMap;//地图
			$scope.HideMapModal=HideMapModal;//隐藏地图
			$scope.DoSelectExamine=DoSelectExamine;//全部项、已办项、待办项

			$scope.serverdata = SceneItemServ.GetServerData();
			$scope.$on('$ionicView.enter', function() {
				SceneItemServ.InitData();
			})
			$scope.$on('$ionicView.unloaded',function(){
				if($scope.mapModal){
					$scope.mapModal.remove();
					$scope.mapModal=null;
				}
			})
			function loadMoreMessage() {
				SceneItemServ.LoadMore();
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}

			function GoBack() {
				SceneItemServ.GoBack();
			}
			//操作
			function HandleScene() {
				if ($scope.handleModal == null) {
					$ionicModal.fromTemplateUrl('sources/scene/item/handleModal.html', {
						scope: $scope,
						animation: 'slide-in-right'
					}).then(function(modal) {
						$scope.handleModal = modal;
						$scope.handleModal.show();
					});
				} else {
					$scope.handleModal.show();
				}
			}
			//隐藏
			function HideHandleModal(){
				if($scope.handleModal){
					$scope.handleModal.hide();
				}
			}
			function ShowMap(){
				HideHandleModal();
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
			//切换显示
			function DoSelectExamine(type){
				HideHandleModal();
				SceneItemServ.DoSelectExamine(type)
			}
			function DeleteComment(parentindex, index) {
				SceneItemServ.DeleteComment(parentindex, index);
			}
			/*
			 * 
			 */
			function SceneItemSign(type) {
				SceneItemServ.SceneItemSign(type)
			}

			function GotoAddSceneMessage() {
				if ($scope.serverdata.IsSceneWorker) {
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
				}else{
					SceneItemServ.ShowAlert("提示", "非本现场工作人员无法操作!");
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
				SceneItemServ.GotoMaterialScene();

			}
			/*
			 * 
			 */
			function ExamineSceneMessage(index) {

			}

			function CommentSceneMessage(index) {

			}

			function DeleteSceneMessage(index) {

			}

			function ArchiveSceneMessage(index) {

			}
			/*
			 * 
			 */
			function SelectPhotoBtn() {
				if ($scope.selectPhotoModal == null) {
					$ionicModal.fromTemplateUrl('sources/scene/item/selectPhotoModal.html', {
						scope: $scope,
						animation: 'slide-in-right'
					}).then(function(modal) {
						$scope.selectPhotoModal = modal;
						$scope.selectPhotoModal.show();
					});
				} else {
					$scope.selectPhotoModal.show();
				}
			}

			function SelectPhoto() {

			}

			function TakePhoto() {

			}

		}
	])