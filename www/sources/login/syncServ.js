loginModule
	.factory('SyncServ', ['$rootScope', 'DataServ','CommFun','$state',
		function($rootScope, DataServ,CommFun,$state) {
			var PSO = false; //记录组织数据是否同步完成
			var PSSAP = false; //记录现场项目数据是否同步完成
			var PSMA = false; //记录信息数据是否同步完成
			var server = {
				InitData: InitData
			}
			return server;

			function InitData(isSame) {
				if (isSame == '0') {
					DataServ.PostSyncOrganization().then(function(res) {
						PSOCallback(res.Value)
					}); //请求同步组织
					DataServ.PostSyncSceneAndProject().then(function(res) {
						PSSAPCallback(res.Value)
					}); //请求同步现场项目
				} else {
					DataServ.PostInitSyncState().then(function(res) {
						InitSyncState(res)
					});; //同企业账号登陆，服务器更改同步账号状态
					DataServ.PSO = true;
				}
				var _date = CommFun.secondFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
				var _data = {
					Token: $rootScope.userInfo.Token,
					QueryTime: _date,
					PageSize: 20
				}
				DataServ.PostHistoryMessage(_data).then(function(res) {
					PSMACallback(res.Value.Data)
				}); //请求同步信息
			}
			//组织(包括部门、人员)同步数据回调函数
			function PSOCallback(jsondata) {
				if (jsondata) {
					var _departments = jsondata.Departments; //部门数据
					var _users = jsondata.FrontUsers; //人员数据
					var _roles = jsondata.UserRoles; //角色数据
					var _lend = _departments.length; //获取部门数据长度
					var _lenu = _users.length; //获取人员数据长度
					var _lenr = _roles.length; //获取人员数据长度
					var _successlend = 0; //部门存储成功数据条数
					var _successlenu = 0; //人员存储成功数据条数
					var _successlenr = 0; //角色存储成功数据条数
					if (_lend == 0 && _lenu == 0 && _lenr == 0) {
						PSO = true;
						SyncAllSuccess();
					}
					DataServ.SaveSyncDeparmats(_departments,function(res) {
						if (res) {
							_successlend += 1; //每储存一条数据记录一次
							if (_lend == _successlend && (_lenu == 0 || _lenu == _successlenu) && (_lenr == 0 || _lenr == _successlenr)) {
								PSO = true;
							}
							SyncAllSuccess();
						}
					})
					DataServ.SaveSyncUsers(_users,function(res) {
						if (res) {
							_successlenu += 1; //每储存一条数据记录一次
							if ((_lend == 0 || _lend == _successlend) && _lenu == _successlenu && (_lenr == 0 || _lenr == _successlenr)) {
								PSO = true;
							}
							SyncAllSuccess();
						}
					})
					DataServ.SaveSyncUserRoles(_roles,function(res) {
							if (res) {
								_successlenr += 1; //每储存一条数据记录一次
								if ((_lend == 0 || _lend == _successlend) && (_lenu == 0 || _lenu == _successlenu) && _lenr == _successlenr) {
									PSO = true;
								}
								SyncAllSuccess();
							}
						})
						//数据条数与存储成功数相同则组织数据同步完成
				} else {
					PSO = true;
					SyncAllSuccess();
				}
			};
			//现场和项目同步数据回调函数
			function PSSAPCallback(jsondata) {
				if (jsondata) {
					var _projectdata = jsondata.Projects; //获取项目数据
					var _scenedata = jsondata.Scenes; //获取现场数据
					var _scenetype = jsondata.SceneTypes; //现场类型
					var _lenproject = _projectdata.length; //获取项目数据长度
					var _lenscene = _scenedata.length; //获取现场数据长度
					var _lentype = _scenetype.length; //获取现场类型长度
					var _successlenproject = 0; //项目数据存储成功数据条数
					var _successlenscene = 0; //现场数据存储成功数据条数
					var _successlentype = 0; //现场类型存储成功数据条数
					if (_lenproject == 0 && _lenscene == 0 && _lentype == 0) {
						PSSAP = true;
						SyncAllSuccess();
					}
					DataServ.SaveSyncProject(_projectdata,function(res) {
						if (res) {
							_successlenproject += 1; //每储存一条数据记录一次
						}
						//数据条数与存储成功数相同则数据同步完成
						if (_lenproject == _successlenproject && (_lenscene == 0 || _lenscene == _successlenscene) && (_lentype == 0 || _lentype == _successlentype)) {
							PSSAP = true;
						}
						SyncAllSuccess();
					})
					DataServ.SaveSyncSceneType(_scenetype,function(res) {
						if (res) {
							_successlentype += 1;; //每储存一条数据记录一次
						}
						//数据条数与存储成功数相同则数据同步完成
						if ((_lenproject == 0 || _lenproject == _successlenproject) && (_lenscene == 0 || _lenscene == _successlenscene) && _lentype == _successlentype) {
							PSSAP = true;
						}
						SyncAllSuccess();
					})
					DataServ.SaveSyncScene(_scenedata,function(res) {
						if (res) {
							_successlenscene += 1;
						}
						//数据条数与存储成功数相同则数据同步完成
						if ((_lenproject == 0 || _lenproject == _successlenproject) && _lenscene == _successlenscene && (_lentype == 0 || _lentype == _successlentype)) {
							PSSAP = true;
						}
						SyncAllSuccess();
					})

				} else {
					PSSAP = true;
					SyncAllSuccess();
				}
			};
			//消息同步数据回调函数
			function PSMACallback(jsondata) {
				if (jsondata) {
					var _len = jsondata.length; //获取要同步的消息总条数
					var _successlen = 0; //消息数据存储成功条数
					if (_len == 0) {
						PSMA = true;
						SyncAllSuccess();
					}
					DataServ.SaveSyncMessage(jsondata,function(res) {
						if (res) {
									_successlen += 1;
								}
								if (_len == _successlen) {
									PSMA = true;
								}
								SyncAllSuccess();
					})
				} else {
					PSMA = true;
					SyncAllSuccess();
				}
			};
			function InitSyncState(success) {
				if (success) {
					PSSAP = true;
				} else {
					CommFun.ShowConfirm("错误提示","初始化数据失败,请重新登陆!").then(function(){
						$state.go('login');
					})
					/*NotificationConfirm("初始化数据失败,请重新登陆!", "错误提示", "确定", Confirm);
					function Confirm(button) {
						ExitToLoading("0") //从同步界面退回到登陆页面
					}*/
				}
				SyncAllSuccess();
			}

			function SyncAllSuccess() {
				//所有数据同步完成，跳转信息页面
				if (PSO && PSSAP && PSMA ) {
					//ChangePage("showMessage.html?IsPost=0");
					$state.go('tab.message',{
						IsPost:0
					})
				}
			}
		}
	])