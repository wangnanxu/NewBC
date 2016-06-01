commModule
	.factory('CommFun', ['$timeout', '$q', '$ionicPopup', '$rootScope', '$cordovaDatePicker',
		function($timeout, $q, $ionicPopup, $rootScope, $cordovaDatePicker) {
			var refreshtime;
			
			var server = {
				InitData: InitData, //初始化全局数据
				RefreshData: RefreshData, //刷新数据到界面
				ShowConfirm: ShowConfirm, //确认框
				CheckPlatform: CheckPlatform, //检查平台信息
				CheckItem: CheckItem, //检查数组中是否包含某个元素
				format: format,
				secondFormat: secondFormat, //设置时间格式
				NewGuid: NewGuid, //guid
				GetPosition: GetPosition,
				GetBaiduAddress: GetBaiduAddress, //解析地址坐标
				ShowDatePicker: ShowDatePicker,
				Start: Start
			}
			return server;

			function InitData() {
				//当前用户个人信息
				$rootScope.userInfo = {
					UserID: '', //用户ID
					UserName: '', //用户姓名
					NickName: '', //昵称
					RoleIDs: '', //用户权限ID(还不清楚具体权限存放在哪一个表)
					HeadPictureName: '', //用户头像地址
					HeadPictureURI: '../img/head.png', //用户头像地址
					EnterpriseID: '', //企业ID
					EnterpriseName: '', //企业名
					DepartmentID: '', //用户所在部门ID
					FunctionIDs: '',
					Token: '', //唯一编码
					Sign: '1',
					CheckSceneData: false, //
					ArchiveSceneData: false, //归档现场数据
					VerifySceneData: false, //审核现场数据
					DeleteSceneData: false, //删除现场数据
					AddSceneData: false, //添加现场数据
					AchieveScene: false, //完工现场数据
					AddScene: false, //添加现场
					EditScene: false, //编辑现场
					InspectScene: false, //临检现场数据
					SceneBuilding: false //发布现场数据
				};
				$rootScope.IsHasNewMessage = false; //是否有新的消息
				$rootScope.FlagNewSceneItem = false; //是否显示新的项目现场
				$rootScope.const_state = ["", "未开始", "进行中", "已完工"]; //项目现场状态
			}

			function RefreshData(data) {
				if (refreshtime) {
					$timeout.cancel(refreshtime);
					refreshtime = null;
				}
				refreshtime = $timeout(function() {
					data = data;
				}, 0)
			}
			//  confirm 对话框
			function ShowConfirm(title, content) {
				var q = $q.defer();
				var confirmPopup = $ionicPopup.confirm({
					title: title,
					template: content
				});
				confirmPopup.then(function(res) {
					q.resolve(res)
					confirmPopup.hide();
				});
				return q.promise;
			};

			function CheckPlatform() {
				//平台、设备和操作系统
				var system = {
					win: false,
					mac: false,
					xll: false
				};
				//检测平台
				var p = navigator.platform;
				system.win = p.indexOf("Win") == 0;
				system.mac = p.indexOf("Mac") == 0;
				system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
				//跳转语句
				if (system.win || system.mac) { //转向后台登陆页面
					return true;
				} else if (system.x11) {
					return false;
				}
			}
			//
			function CheckItem(arr, item) {
				if (arr && arr.length > 0) {
					var len = arr.length;
					for (var i = 0; i < len; i++) {
						if (arr[i] == item) {
							return true;
						}
					}
				}
				return false;
			}

			//时间格式化
			function format(_date, format) {
				var o = {
					"M+": _date.getMonth() + 1, //month 
					"d+": _date.getDate(), //day 
					"h+": _date.getHours(), //hour 
					"m+": _date.getMinutes(), //minute 
					"s+": _date.getSeconds(), //second 
					"q+": Math.floor((_date.getMonth() + 3) / 3), //quarter 
					"S": _date.getMilliseconds() //millisecond 
				}

				if (/(y+)/.test(format)) {
					format = format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
				}

				for (var k in o) {
					if (new RegExp("(" + k + ")").test(format)) {
						format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
					}
				}
				format = format.substring(0, format.length - 3);
				return format;
			};
			//时间格式化
			function secondFormat(_date, format) {
				var o = {
					"M+": _date.getMonth() + 1, //month 
					"d+": _date.getDate(), //day 
					"h+": _date.getHours(), //hour 
					"m+": _date.getMinutes(), //minute 
					"s+": _date.getSeconds(), //second 
					"q+": Math.floor((_date.getMonth() + 3) / 3), //quarter 
					"S": _date.getMilliseconds() //millisecond 
				}

				if (/(y+)/.test(format)) {
					format = format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
				}

				for (var k in o) {
					if (new RegExp("(" + k + ")").test(format)) {
						format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
					}
				}
				//format = format.substring(0,format.length-3);
				return format;
			};
			//获取sguid

			function NewGuid() {
				var guid = "";
				for (var i = 1; i <= 32; i++) {
					var n = Math.floor(Math.random() * 16.0).toString(16);
					guid += n;
					if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
						guid += "-";
				}
				return guid;
			};
			//获取GPS地址,IOS使用Google地图，Android使用百度地图
			function GetPosition(PositionCallBack) {
				if (typeof(PositionCallBack) != "function") {
					return;
				}
				if (CheckPlatform()) {
					/********百度web**********/
					var geolocation = new BMap.Geolocation();
					geolocation.getCurrentPosition(function(data) {
							var Position = {
								"longitude": data.longitude,
								"latitude": data.latitude
							};
							PositionCallBack(Position);
						}, function(error) {
							alert("未找到GPS");
							PositionCallBack(null);
						})
						/********百度web**********/
				} else {
					if (device.platform == "iOS") {
						navigator.geolocation.getCurrentPosition(function(position) {
							var Position = {
								"longitude": position.coords.longitude,
								"latitude": position.coords.latitude
							};
							PositionCallBack(Position);
						}, function(error) {
							//NotificationAlert("未找到GPS" + error, "错误提示");
							PositionCallBack(null);
						});

					} else if (device.platform == "Android") {
						var noop = function() {};

						/********百度SDK**********/

						window.locationService.getCurrentPosition(function(pos) {
							var Position = {
								"longitude": pos.coords.longitude,
								"latitude": pos.coords.latitude
							};
							PositionCallBack(Position);
							window.locationService.stop(noop, noop);
						}, function(e) {
							NotificationAlert("未找到GPS", "错误提示");
							PositionCallBack(null);
							window.locationService.stop(noop, noop)
						});
						/********百度SDK**********/
					}
				}
			};
			//获取百度地址
			function GetBaiduAddress(Point, callbackFun) {
				//创建地理编码实例
				var myGeo = new BMap.Geocoder();
				//根据坐标得到地址描述
				myGeo.getLocation(new BMap.Point(Point.longitude, Point.latitude), function(result) {
					if (result) {
						callbackFun(result.address);
					}
				})
			};
			//显示时间
			function ShowDatePicker(options) {
				var q = $q.defer();
				$cordovaDatePicker.show(options).then(function(date) {
					q.resolve(date);
				});
				return q.promise;
			}

			function BBNetwork(callback) {
					this.navigator=window.navigator;
					this.callback=callback;
					this._init=function() {
						var that = this;
						window.addEventListener("online", function() {
							that._fnNetworkHandler();
						}, true);
						window.addEventListener("offline", function() {
							that._fnNetworkHandler();
						}, true)
					};
					this._fnNetworkHandler=function() {
						this.callback && this.callback(this.navigator.onLine ? "online" : "offline");
					};
					this.isOnline=function() {
						return this.navigator.onLine;
					}
				window.BBNetwork = BBNetwork;
			};

			function Start() {
				var bbNetwork = new BBNetwork(function(status) {
					var tipMsg = "";
					if ("online" != status) {
						setTimeout(function() {
							onLine = false;
						}, 6000)

						//alert("目前处于离线状态~~~~(>_<)~~~~ ");
					} else {

						setTimeout(function() {
							onLine = true;
							//检查时间是否过期
							/*ConfirmLoginTime();
							//连网自动发送现场数据
							OfflineScentItem();
							//连网自动发送消息
							AutoSendMessage();
							//连网自动发送现场
							AutoSendScene();*/
							//				alert("网络已连接");
						}, 6000)

					}
				});
				if (!bbNetwork.isOnline()) {
					setTimeout(function() {
							onLine = false;
						}, 6000)
						//alert("目前处于离线状态~~~~(>_<)~~~~ ");
				}
			}
		}
	])