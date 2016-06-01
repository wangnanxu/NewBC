loginModule
	.controller('LoginCtrl', ['$scope', 'LoginServ',
		function($scope, LoginServ) {
			$scope.Login = Login;
			$scope.serverdata=LoginServ.GetServerData();
			$scope.$on('$ionicView.enter', function() {
				LoginServ.InitData();
			})

			function Login() {
				var data=$scope.serverdata.account;
				LoginServ.Login(data);
			}
		}
	])