commModule
	.factory('WorkerServ', ['DataServ', '$rootScope', 'MessageServ', 'ProjectServ', 'SceneServ', 'SceneItemServ',

		function(DataServ, $rootScope, MessageServ, ProjectServ, SceneServ, SceneItemServ) {
			var workerPost;
			var ACTION = {
					SyncOrganization: 1,
					SyncSceneAndProject: 2,
					SyncSceneData: 4,
					SyncMessage: 8
				}
				//分流Worker返回数据
			var changeTime = 0; //定时更改时间，每一分钟更改一次
			var firstlogoin = true;
			$rootScope.IsHasNewMessage = false;
			var server = {
				AddWorker: AddWorker
			}
			return server;
			//初始化worker
			function AddWorker() {
				if (workerPost == null) {
					if (typeof("Worker") != null) {
						workerPost = new Worker("sources/comm/js/worker.js");
						var url = DataServ.GetBaseURL();
						var _workerdata = {
							Token: $rootScope.userInfo.Token,
							baseUrl: url
						}
						workerPost.postMessage(_workerdata); //启动worker
						workerPost.onmessage = function(evt) {
							//worker返回数据处理
							HandleWorkerBackData(evt.data);
						}
					} else {
						//NotificationAlert("设备不支持数据同步(worker)", "错误提示");
					}
				}
			}

			function HandleWorkerBackData(data) {
				if (data) {
					try {
						var _jsondata = JSON.parse(data);
						if (_jsondata.Success) {
							changeTime += 1;
							if (firstlogoin) {
								ChangeWorkerTime(_jsondata.Value.Time); //记录第一次进入
								firstlogoin = false;
							} else if (_jsondata.Value.Time && changeTime >= 20) { //3*20,每一分钟更改一次
								ChangeWorkerTime(_jsondata.Value.Time);
								changeTime = 0;
							}
							if (_jsondata.Value.Data != null && _jsondata.Value.Data != "") {
								var _data = _jsondata.Value.Data;
								var _len = _data.length;
								for (var i = 0; i < _len; i++) {
									if (_data[i].DeletedEntities) {
										WorkerDeleteData(_data[i].DeletedEntities); //处理删除数据
									} else {
										WorkerActiveData(_data[i]); //处理动作
									}
								}
							}
						} else {
							if (_jsondata.LoginFailed && _jsondata.LoginFailed == true) {
								ExitToLoading("0");
							}
							NotificationAlert(_jsondata.Message, "提示");
						}
					} catch (e) {

					}
				}
			}
			//处理删除数据
			function WorkerDeleteData(data) {
				if (data) {
					//删除数据库数据
					DataServ.WorkerDeleteData(data);
					//更改界面数据
					var _len = data.length;
					for (var i = 0; i < _len; i++) {
						switch (data[i].EntityName) {
							case "SceneItem": //删除现场信息
								//WorkerDeleteSceneItem(data[i].EntityID);
								break;
							default:
								break;
						}
					}
				}
			};
			//处理动作
			function WorkerActiveData(data) {
				if (data) {
					switch (data.Action) {
						case ACTION.SyncOrganization:
							DataServ.PostSyncOrganization().then(function(jsondata) {
								DataServ.ConfirmSync(jsondata); //确认完成
								SaveSyncOrganization(jsondata.Value);
							})
							break;
						case ACTION.SyncSceneAndProject:
							DataServ.PostSyncSceneAndProject().then(function(jsondata) {
								DataServ.ConfirmSync(jsondata); //确认完成
								SaveSyncSceneAndProject(jsondata);
							})
							break;
						case ACTION.SyncSceneData:
							DataServ.PostSceneData().then(function(jsondata) {
								DataServ.ConfirmSync(jsondata); //确认完成
								SaveSyncSceneData(jsondata);
							})
							break;
						case ACTION.SyncMessage:
							//写入数据库
							data.Data.Time = data.Time;
							DataServ.SaveSyncMessage(data.Data);
							//显示数据
							MessageServ.ShowAddMessage(data.Data);
							break;
						default:
							//alert("worker同步错误");
							break;
					}
				}
			};
			//worker时间更新
			function ChangeWorkerTime(time) {
				DataServ.SaveWorkerTime(time);
			};

			function SaveSyncOrganization(jsondata) {
				if (jsondata) {
					var _departments = jsondata.Departments; //部门数据
					var _users = jsondata.FrontUsers; //人员数据
					var _roles = jsondata.UserRoles; //角色数据
					var _lenu = _users.length; //获取人员数据长度
					var _lenr = _roles.length; //获取人员数据长度
					//存储数据库
					DataServ.SaveSyncDeparmats(_departments)
					DataServ.SaveWorkerUser(_users)
					DataServ.SaveSyncUserRoles(_roles)
					for (var j = 0; j < _lenu; j++) {
						if (_users[j].UserID == $rootScope.userInfo.UserID) {
							$rootScope.userInfo.DepartmentID = _users[j].DepartmentID;
							$rootScope.userInfo.UserName = _users[j].Name;
							$rootScope.userInfo.EnterpriseID = _users[j].EnterpriseID;
						}
					}
					var _arr = new Array();
					for (var k = 0; k < _lenr; k++) {
						if ($rootScope.userInfo.UserID == _roles[k].UserID) {
							_arr.push(_roles[k].RoleID);
						}
					}
					$rootScope.userInfo.RoleIDs = _arr.join(",");
				}
			}

			function SaveSyncSceneAndProject() {
				if (jsondata) {
					var _projectdata = jsondata.Projects; //获取项目数据
					var _scenedata = jsondata.Scenes; //获取现场数据
					var _scenetype = jsondata.SceneTypes; //获取现场类型
					var _lenproject = _projectdata.length; //获取项目数据长度
					var _lenscene = _scenedata.length; //获取现场数据长度
					//存储数据库
					DataServ.SaveSyncProject(_projectdata);
					DataServ.SaveSyncSceneType(_scenetype);
					DataServ.SaveSyncScene(_scenedata);
					//修改界面
					for (var j = 0; j < _lenscene; j++) {
						if (_scenedata[j].Deleted) {
							DeleteCurrentScene(_scenedata[j].SceneID);
						} else {
							//存储现场数据
							CompleteCurrentScene(_scenedata[j].SceneID, _scenedata[j].SceneState);
						}
					}
				}
			}
			function SaveSyncSceneData(jsondata){
				if(jsondata){
					//存储数据库
					DataServ.SaveSyncSceneData(jsondata);
					//修改界面SceneItemServ
					
				}
			}
			//当前现场被删除
			function DeleteCurrentScene(sceneid) {
				//SceneItemServ.DeleteCurrentScene(sceneid);
				/*if (sceneid == GetUrlParam("sceneid") && $.mobile.activePage.attr("id") == "Page_SceneItem") {
					ChangePage('project.html');
				}*/
			};
			//当前现场完工
			function CompleteCurrentScene(sceneid, state) {
					//SceneItemServ.CompleteCurrentScene(sceneid);
				/*if (sceneid == GetUrlParam("sceneid") && $.mobile.activePage.attr("id") == "Page_SceneItem" && GetUrlParam("state") != 3 && state == 3) {
					NotificationAlert("现场已完工!", "提示");
					ChangePage('project.html');
				}*/
			};


		}
	])