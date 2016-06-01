materialModule
	.controller('MaterialCtrl', ['$scope', 'MaterialServ', '$ionicModal',
		function($scope, MaterialServ, $ionicModal) {
			$scope.SyncMetrial = SyncMetrial; //同步资料
			$scope.ChangeSelect = ChangeSelect; //切换已下载和资料库
			$scope.GoDownload = GoDownload; //资料库点击
			$scope.DownloadMaterial=DownloadMaterial;//点击下载资料
			$scope.OpenApp=OpenApp;//打开文件
			$scope.GoBack=GoBack;//隐藏下载页面
			
			$scope.serverdata = MaterialServ.GetServerData();
			$scope.$on('$ionicView.loaded', function() {
				MaterialServ.InitData();
			})
			$scope.$on('$ionicView.unloaded',function(){
				MaterialServ.Destory();
			})
			function SyncMetrial() {
				MaterialServ.SyncMetrial();
			}
			function ChangeSelect(index) {
				MaterialServ.ChangeSelect(index)
			}

			function GoDownload(index) {
				MaterialServ.GoDownload(index)
				if ($scope.downModal == null) {
					$ionicModal.fromTemplateUrl('sources/material/downModal.html', {
						scope: $scope,
						animation: 'slide-in-right'
					}).then(function(modal) {
						$scope.downModal = modal;
						$scope.downModal.show();
					});
				} else {
					$scope.downModal.show();
				}
			}
			function DownloadMaterial(){
				MaterialServ.DownloadMaterial();
			}
			function OpenApp(){
				
			}
			function GoBack(){
				if($scope.downModal){
					$scope.downModal.hide();
					MaterialServ.GoBack();
				}
			}
			
		
		}
	])