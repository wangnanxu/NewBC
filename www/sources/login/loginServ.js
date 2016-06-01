loginModule
	.factory('LoginServ', ['$state', 'DataServ', '$rootScope', 'CommFun', '$ionicLoading','WorkerServ',
		function($state, DataServ, $rootScope, CommFun, $ionicLoading,WorkerServ) {
			var AppVersionPlatform = "apk";
			var enterpriseids; //企业列表
			var userlist;
			var currentUser;
			var logindata = {
				UserName: '', //用户名
				Password: '', //用户密码
				DeviceId: '', //设备ID
				LastTime: ""
			}
			$rootScope.appVersion= "1.2.7",
			$rootScope.newVersion={
				version: "",
					url: "",
					isNew: false
			}
			var serverdata = {
				
				account: {
					name: '',
					pwd: ''
				}
			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData,
				Login: Login
			}
			return server;

			function GetServerData() {
				return serverdata;
			}
			//启动app初始化数据
			function InitData() {
				CheckAccount();
				CheckVersion();
				if ($rootScope.userInfo) {
					serverdata.account.name = $rootScope.userInfo.UserID;
					serverdata.account.pwd = $rootScope.userInfo.Pwd;
				}
				CommFun.RefreshData();
			}
			//检查账号
			function CheckAccount() {
				CommFun.InitData();
				DataServ.InitDataBase();
				DataServ.GetAccount().then(function(data) {
					if (data && data.length > 0) {
						userlist = data;
						$ionicLoading.show({
							template: '登录中'
						})
						SetCurrentUser(data[0]);
						DataServ.PostConfirmDays(data[0]).then(function(data) {
							if (data.Success) {
								HandleConfirmDays(data);
							}
							$ionicLoading.hide();
						})
					}
				})
			}
			//检查app版本
			function CheckVersion() {
				if (!$rootScope.newVersion.isNew) {
					DataServ.PostGetAppVersion('apk').then(function(data) {
						$rootScope.newVersion.version = data.Version;
						$rootScope.newVersion.url = data.Url;
						$rootScope.newVersion.isNew = true;
						if ($rootScope.appVersion >= $rootScope.newVersion.version) {
							$rootScope.newVersion.version = $rootScope.appVersion;
						}
					})
				}
				CommFun.RefreshData();
			}
			//处理确认时间
			function HandleConfirmDays(adata) {
				if (adata && adata.Value.Overdue) {
					$.mobile.loading("hide");
					AlertOverDue(adata);
				} else {
					LoginSuccess();
					/*if (CheckPlatform()) {
						_obj["HeadPictureURI"] = "../img/head.jpg";
						$.mobile.loading("hide");
						SetCurrentUser(_obj, LoginSuccess);
					} else {
						DownLoad_New(_obj.HeadImage, 1, "", function(URI) {
							if (URI == null) {
								URI = "../img/head.jpg";
							}
							_obj["HeadPictureURI"] = URI;
							SetCurrentUser(_obj, LoginSuccess);
						})
					}*/
				}
			}
			//设置用户信息
			function SetCurrentUser(obj, pwd) {
				if (obj) {
					var _data = obj;
					$rootScope.userInfo.HeadImage = _data.HeadImage;
					$rootScope.userInfo.HeadPictureURI = _data.HeadPictureURI;
					$rootScope.userInfo.UserID = _data.UserID;
					$rootScope.userInfo.UserName = _data.UserName;
					$rootScope.userInfo.NickName = "";
					$rootScope.userInfo.RoleIDs = _data.RoleIDs; //测试数据
					$rootScope.userInfo.EnterpriseID = _data.EnterpriseID;
					$rootScope.userInfo.EnterpriseName = _data.EnterpriseName;
					$rootScope.userInfo.DepartmentID = _data.DepartmentID;
					var _FunctionIDs = _data.FunctionIDs;
					if (typeof(_data.FunctionIDs) == "string") {
						_FunctionIDs = JSON.parse(_data.FunctionIDs);
					}
					$rootScope.userInfo.FunctionIDs = _FunctionIDs;
					var _length = $rootScope.userInfo.FunctionIDs.length;
					var _isMa = false;
					var _isEdit = false;
					for (var i = 0; i < _length; i++) {
						var _str = $rootScope.userInfo.FunctionIDs[i].split('.');
						var _permission = _str[_str.length - 1];
						if ($rootScope.userInfo[_permission] != undefined) {
							$rootScope.userInfo[_permission] = true;
						}
					}
					$rootScope.userInfo.Token = _data.Token;
					if (_data.Sign) {
						$rootScope.userInfo.Sign = _data.Sign;
					} else {
						$rootScope.userInfo.Sign = "1";
					}
					$rootScope.userInfo.Pwd = pwd;
				}
			};
			//
			function ShowConfirm() {
				CommFun.ShowConfirm('提示', '该用户超过3天未登陆，请重新登陆').then(function(res) {
					if (res) {
						DataServ.DeleteAllTable();
					}
				})

			};
			//点击登陆
			function Login(account) {
				$ionicLoading.show({
					template: '登录中'
				})
				var _deviceid = CommFun.CheckPlatform() == true ? "351BBHJ9RRVB11" : device.uuid;
				logindata.UserName = account.name;
				logindata.Password = account.pwd;
				logindata.DeviceId = _deviceid;
				DataServ.GetEnterpriselist().then(function(adata) {
					if (adata) {
						var _len = adata.length;
						for (var i = 0; i < _len; i++) {
							enterpriseids[i] = adata[i].EnterpriseID;
						}
					}
					DataServ.GetUser(logindata.UserName).then(function(data) {
						if (data && data.length > 0) {
							currentUser = data[0];
							logindata.LastTime = data[0].LastTime;
						}
						DataServ.PostLoginData(logindata).then(function(res) {
							CheckFirstUser(res)
							$ionicLoading.hide();
						}); //1.0.7
					})
				})
			}
			//
			function CheckFirstUser(obj) {
				if (userlist == null || userlist.length <= 0) {
					DataServ.PostLoginClearCache(obj.Token).then(function() {
						HandleLoginData(obj, logindata.Password);
					});
				} else {
					HandleLoginData(obj, logindata.Password);
				}
			}

			function HandleLoginData(obj, pwd) {
				if (obj) {
					var _data = obj;
					var _isfirst = true;
					var _FunctionIDs = JSON.stringify(_data.FunctionIDs);
					if (currentUser && currentUser.length > 0) {
						_isfirst = false;
					}
					DataServ.SaveUserInfo(_data).then(function(adata) {
						if (CommFun.CheckPlatform()) {
							_data["HeadPictureURI"] = "../img/head.jpg";
							if (adata) {
								SetCurrentUser(_data, pwd);
								if (_data.Overdue) {
									DataServ.DeleteAllTable(_data.UserID); //清除除登录用户已外的所有数据
									$timeout(function() {
										FirstLoginSuccess("0")
									}, 2000)
								} else {
									if (_isfirst) {
										if (CommFun.CheckItem(_data.EnterpriseID, enterpriseids)) {
											FirstLoginSuccess("1"); //已有同企业账号登陆
										} else {
											FirstLoginSuccess("0"); //企业账号第一次登陆
										}
									} else {
										LoginSuccess(); //账号有登陆记录
									}
								}
							}
						} else {
							/*DownLoad_New(_data.HeadImage, 1, "", LoginCallback);
							
							function LoginCallback(URI) {
								if (URI == null) {*/
									URI = "sources/comm/img/head.jpg";
								//}
								_data["HeadPictureURI"] = URI;
								if (adata) {
									SetCurrentUser(_data, pwd);
									if (_data.Overdue) {
										DataServ.DeleteAllTable(_data.UserID); //清除除登录用户意外的所有数据
										setTimeout(FirstLoginSuccess("0"), 2000);
									} else {
										if (_isfirst) {
											if (CommFun.CheckItem(_data.EnterpriseID, enterpriseids)) {
												FirstLoginSuccess("1");
											} else {
												FirstLoginSuccess("0");
											}
										} else {
											LoginSuccess();
										}
									}
								} else {
									$.mobile.loading("hide");
								}
							//}
						}
					})
				}
			}
			//进入同步页面
			function FirstLoginSuccess(type) {
				$ionicLoading.hide();
					//初始化worker
				WorkerServ.AddWorker();
				$state.go('sync', {
					isSame: type
				})
			}
			//多次登陆跳转到信息页面
			function LoginSuccess() {
				$ionicLoading.hide();
				//初始化worker
				WorkerServ.AddWorker();
				$state.go('tab.message')
			}
		}
	])