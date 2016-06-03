messageModule
	.controller('MessageCtrl', ['$scope', 'MessageServ', '$ionicModal','$ionicScrollDelegate','$timeout',
		function($scope, MessageServ, $ionicModal,$ionicScrollDelegate,$timeout) {
			$scope.SelectMessage = SelectMessage; //下拉刷新
			$scope.ClickNotice = ClickNotice; //点击公告
			$scope.ShowSendMessage = ShowSendMessage; //点击发送按钮
			$scope.GoBack = GoBack; //隐藏sendmessagemodal
			$scope.SendMessageFun = SendMessageFun;
			$scope.serverdata = MessageServ.GetServerdata();
			$scope.$on('$ionicView.loaded', function() {
				MessageServ.InitData();
			})
			$scope.$on('$ionicView.enter',function(){
				$ionicScrollDelegate.$getByHandle('messageScroll').scrollBottom();
			})
			$scope.$on('$ionicView.unloaded',function(){
				Destory();
			})
			//下拉刷新
			function SelectMessage() {
				MessageServ.SelectMessage(false);
				$scope.$broadcast('scroll.refreshComplete');
			}
			//点击公告关闭
			function ClickNotice(id) {
				MessageServ.ClickNotice(id);
			}
			//点击发送按钮
			function ShowSendMessage() {
				if ($scope.sendMessageModal == null) {
					$ionicModal.fromTemplateUrl('sources/message/sendMessageModal.html', {
						scope: $scope,
						animation: 'slide-in-right'
					}).then(function(modal) {
						$scope.sendMessageModal = modal;
						$scope.sendMessageModal.show();
						MessageServ.InitSendMessage();
					});
				} else {
					$scope.sendMessageModal.show();
					MessageServ.InitSendMessage();
				}
			}
			function GoBack() {
				if ($scope.sendMessageModal) {
					$scope.sendMessageModal.hide();
				}
			}
			function SendMessageFun() {
				var message=$scope.serverdata.content;
				MessageServ.SendMessageFun(message);
				GoBack();
				$timeout(function(){
					 $ionicScrollDelegate.$getByHandle('messageScroll').scrollBottom();
				},200)
			}
			function Destory(){
				if($scope.sendMessageModal){
					$scope.sendMessageModal.remove();
					$scope.sendMessageModal=null;
				}
				MessageServ.Destory();
			}
		}
	])