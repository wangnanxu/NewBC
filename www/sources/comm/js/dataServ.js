commModule
	.factory('DataServ', ['SqliteServ', '$q', '$http', '$rootScope',
		function(SqliteServ, $q, $http, $rootScope) {
			//var baseurl = "http://61.128.186.141:80"; //发布
			//var baseurl = "http://115.29.110.41:8082"; //测试
			//var baseurl = "http://192.168.0.122:7081"; //本地1
			var baseurl = "http://192.168.0.133:9002"; //本地2
			var dbBase = null;
			$rootScope.onLine = true;
			var server = {
				InitDataBase: InitDataBase,
				GetBaseURL: GetBaseURL,

				PostConfirmDays: PostConfirmDays, //服务器确认是否超过3天
				PostGetAppVersion: PostGetAppVersion, //服务器获取app版本信息
				PostLoginData: PostLoginData, //登陆
				PostLoginClearCache: PostLoginClearCache, //清除登陆状态
				PostSyncOrganization: PostSyncOrganization, //同步组织数据
				PostSyncSceneAndProject: PostSyncSceneAndProject, //同步项目现场数据
				PostInitSyncState: PostInitSyncState, //同步状态
				PostHistoryMessage: PostHistoryMessage, //同步消息
				PostSceneData: PostSceneData, //同步现场消息数据
				PostConfirmSync: PostConfirmSync, //确认同步时间
				PostNoticeRead: PostNoticeRead, //修改公告已读
				PostSendMessage: PostSendMessage, //发送消息
				PostGetMaterial: PostGetMaterial,
				PostAddScene: PostAddScene,
				PostHistoryData: PostHistoryData, //请求具体现场历史数据
				PostAddSceneItem:PostAddSceneItem,
				PostDeleteComment:PostDeleteComment,//删除评论

				GetAccount: GetAccount,
				GetEnterpriselist: GetEnterpriselist,
				GetUser: GetUser,
				GetDownloadMaterial: GetDownloadMaterial,
				GetRoles: GetRoles,
				GetFrontUser: GetFrontUser,
				GetSceneType: GetSceneType,
				BaseSelect: BaseSelect,

				SaveUserInfo: SaveUserInfo,
				SaveSyncDeparmats: SaveSyncDeparmats,
				SaveSyncUsers: SaveSyncUsers,
				SaveSyncUserRoles: SaveSyncUserRoles,
				SaveSyncProject: SaveSyncProject,
				SaveSyncSceneType: SaveSyncSceneType,
				SaveSyncScene: SaveSyncScene,
				SaveSyncMessage: SaveSyncMessage,
				SaveWorkerTime: SaveWorkerTime, //worker同步时间更改
				SaveWorkerUser: SaveWorkerUser,
				SaveSceneMessageData: SaveSceneMessageData, //存储具体现场数据
				AddSendMessage: AddSendMessage, //发送消息
				UpdateSendMessage: UpdateSendMessage, //修改发送消息状态
				UpdateNoticeStatus: UpdateNoticeStatus, //更改公告状态
				UpdateProjectSceneStatus: UpdateProjectSceneStatus, //修改项目现场已读状态
				ChangeState: ChangeState,
				BaseUpdate: BaseUpdate,
				BaseSaveUpdate: BaseSaveUpdate,

				DeleteAllTable: DeleteAllTable,
				WorkerDeleteData: WorkerDeleteData,
				DeleteSendMessage: DeleteSendMessage, //删除发送消息
				BaseDelete: BaseDelete

			}
			return server;

			function InitDataBase() {
				if (dbBase == null || dbBase == undefined) {
					dbBase = new DataBase();
				}
				if (dbBase.db == null) {
					//初始化数据库
					dbBase.OpenTransaction(function(tx) {
						dbBase.InitDB(tx);
					});
				}
			}

			function GetBaseURL() {
				return baseurl;
			}
			/*
			 * 数据请求
			 */
			//login
			//检测app版本
			function PostGetAppVersion(appPlatform) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var _data = {
						suffix: appPlatform
					}
					BasePost(_data, '/APIS/Account/GetAppVersion').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata.Value);
						} else {
							//"获取最新版本信息失败", "错误提示"
						}

					})
				} else {

				}
				return q.promise;
			}
			//检测是否超过3天
			function PostConfirmDays(data) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var _data = {
						Token: data.Token,
						LastTime: data.LastTime
					}
					BasePost(_data, '/APIS/Account/ChekLoginTime').then(function(adata) {
						q.resolve(adata);
					})
				} else {

				}
				return q.promise;
			}
			//登陆请求数据
			function PostLoginData(parma) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					BasePost(parma, '/APIS/Account/Login').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata.Value);
						} else {
							q.resolve("")
								//"服务器登陆错误：" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//请求清除服务器登陆状态
			function PostLoginClearCache(token) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: token
					}

					BasePost(parma, '/APIS/SyncData/ClearCacheForLogin').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata.Value);
						} else {
							//"服务器登陆错误：" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//同步
			//同步组织数据
			function PostSyncOrganization() {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: $rootScope.userInfo.Token
					}

					BasePost(parma, '/APIS/SyncData/SyncOrganization').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata);
						} else {
							//"同步组织信息错误" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//同步现场项目数据
			function PostSyncSceneAndProject() {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: $rootScope.userInfo.Token
					}
					BasePost(parma, '/APIS/SyncData/SyncProjectAndScene').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata);
						} else {
							//"服务器登陆错误：" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//确认同步状态
			function PostInitSyncState() {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: $rootScope.userInfo.Token
					}

					BasePost(parma, '/APIS/SyncData/InitSyncState').then(function(adata) {
						q.resolve(adata.Success);
					})
				} else {

				}
				return q.promise;
			}
			//同步消息
			function PostHistoryMessage(parma) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					BasePost(parma, '/APIS/ChatMessage/GetChatMessage').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata);
						} else {
							//"服务器请求历史消息错误：" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//同步现场消息数据
			function PostSceneData() {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: $rootScope.userInfo.Token
					}
					BasePost(parma, '/APIS/SyncData/SyncSceneData').then(function(adata) {
						if (adata.Success) {
							q.resolve(adata);
						} else {
							//"服务器同步错误：" + adata.Message, "错误提示"
						}
					})
				} else {

				}
				return q.promise;
			}
			//确认同步
			function PostConfirmSync(data) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						syncTime: data.Time,
						Token: $rootScope.userInfo.Token,
						syncAction: data.Action
					}
					BasePost(parma, '/APIS/SyncData/SyncConfirm').then(function(adata) {

					})
				} else {

				}
				return q.promise;

			}
			//修改公告已读
			function PostNoticeRead(id) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						MessageID: id
					}
					BasePost(parma, '/APIS/ChatMessage/SystemMessageIsRead').then(function(adata) {

					})
				} else {

				}
				return q.promise;
			}
			//发送消息
			function PostSendMessage(parma) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					BasePost(parma, '/APIS/ChatMessage/Send').then(function(adata) {
						q.resolve(adata)
					})
				} else {

				}
				return q.promise;
			}
			//获取所有资料信息
			function PostGetMaterial() {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var parma = {
						Token: $rootScope.userInfo.Token
					}
					BasePost(parma, '/APIS/KnowlegeBase/GetKnowlegeList').then(function(adata) {
						q.resolve(adata)
					})
				} else {

				}
				return q.promise;
			}
			//添加现场
			function PostAddScene(postdata) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					BasePost(postdata, '/APIS/Scene/AddScene').then(function(adata) {
						q.resolve(adata)
					})
				} else {

				}
				return q.promise;
			}
			//请求具体现场历史数据
			function PostHistoryData(sceneid, time) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var postdata = {
						SceneID: sceneid,
						Token: $rootScope.userInfo.Token,
						Time: time,
						PageSize: 10,
						Status: 4
					}
					BasePost(postdata, '/APIS/SceneData/GetSceneData').then(function(adata) {

						q.resolve(adata)
					})
				} else {

				}
				return q.promise;
			}

			function PostAddSceneItem(postdata, status) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					BasePost(postdata, '/APIS/SceneData/AddSceneData').then(function(adata) {
						q.resolve(adata)
					})
				} else {
					
				}
				return q.promise;
			}
			//删除评论
			function PostDeleteComment(messageid, commentguid, time) {
				var q = $q.defer();
				if ($rootScope.onLine) {
					var postdata = {
						Token: $rootScope.userInfo.Token,
						MessageID: messageid,
						CommentGuid: commentguid,
						Time: time
					}
					BasePost(postdata, '/APIS/SceneData/DeleteSceneComment').then(function(adata) {
						q.resolve(adata)
					})
				} else {

				}
				return q.promise;
			}

			function BasePost(parma, url) {
				var q = $q.defer();
				$http({
					method: 'POST',
					url: baseurl + url,
					params: parma,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded:charset=utf-8'
					}
				}).success(function(data, status, headers, config) {
					data.status=status;
					q.resolve(data);
				}).error(function(data, status, headers, config){
					data.status=status;
					q.resolve(data)
				});
				return q.promise;
			}
			/*
			 * 从数据库中获取
			 */
			//login页面
			//获取账号信息
			function GetAccount() {
				var q = $q.defer();
				SqliteServ.select('tb_CurrentUsers', 'Token!=?', [""]).then(function(data) {
					q.resolve(data);
				})
				return q.promise;
			}
			//获取
			function GetEnterpriselist() {
				var q = $q.defer();
				SqliteServ.selectfree('tb_CurrentUsers', 'order by EnterpriseID', []).then(function(data) {
					q.resolve(data);
				})
				return q.promise;
			}
			//
			function GetUser(name) {
				var q = $q.defer();
				SqliteServ.select('tb_CurrentUsers', 'UserID=?', [name]).then(function(data) {
					q.resolve(data);
				})
				return q.promise;
			}

			function GetDownloadMaterial() {
				var q = $q.defer();
				SqliteServ.select('tb_Materials', 'EnterpriseID=?', [$rootScope.userInfo.EnterpriseID]).then(function(data) {
					q.resolve(data);
				})
				return q.promise;
			}

			function GetRoles(_roles, callback) {
				var _len = _roles.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < _len; i++) {
						dbBase.SelectTable(tx, "select * from tb_UserRoles where RoleID=?", [_roles[i]], function(data) {
							callback(data);
						});
					}
				})
			}

			function GetFrontUser(adata, str, callback) {
				var _length = adata.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < _length; i++) {
						dbBase.SelectTable(tx, "select * from tb_FrontUsers where UserID = ? And DepartmentID in " + str, [adata[i].UserID], function(newadata, RoleID) {
							callback(newadata, RoleID);
						}, adata[0].RoleID);
					}
				})
			}

			function GetSceneType(adata, callback) {
				var _length = adata.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < _length; i++) {
						dbBase.SelectTable(tx, "select * from tb_SceneTypes where SceneTypeID = ?", [adata[i]], function(data) {
							callback(data);
						});
					}
				})
			}
			//获取消息数据
			function BaseSelect(sql, parma) {
				var q = $q.defer();
				SqliteServ.selectsql(sql, parma).then(function(data) {
					q.resolve(data);
				})
				return q.promise;
			}
			/*
			 * 存储数据库
			 */
			//保存用户数据
			function SaveUserInfo(_data) {
				var q = $q.defer();
				var _FunctionIDs = JSON.stringify(_data.FunctionIDs);
				SqliteServ.saveOrupadte("tb_CurrentUsers", ['UserID', 'UserName', 'NickName', 'RoleIDs', 'EnterpriseID', 'EnterpriseName', 'DepartmentID', 'HeadImage', 'Token', 'FunctionIDs'], [_data.UserID, _data.UserName, '', _data.RoleIDs, _data.EnterpriseID, _data.EnterpriseName, _data.DepartmentID, _data.HeadImage, _data.Token, _FunctionIDs], 'UserID=?', [_data.UserID]).then(function(res) {
					q.resolve(res);
				});
				return q.promise;
			}
			//保存部门数据
			function SaveSyncDeparmats(_departments, callback) {
				var len = _departments.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < len; i++) {
						if (_departments[i].Deleted) {
							DeleteDepartment(_departments[i]);
						} else {
							dbBase.SaveOrUpdateTable(tx, "tb_Departments", ['DepartmentID', 'DepartmentName', 'ParentID', 'EnterpriseID'], [_departments[i].DepartmentID, _departments[i].Name, _departments[i].ParentID, _departments[i].EnterpriseID], "DepartmentID", _departments[i].DepartmentID, function(bool) {
								callback(bool);
							})
						};
					}
				})
			}
			//保存人员数据
			function SaveSyncUsers(_users, callback) {
				var len = _users.length;
				dbBase.OpenTransaction(function(tx) {
					for (var j = 0; j < len; j++) {
						//存储人员数据
						dbBase.SaveOrUpdateTable(tx, "tb_FrontUsers", ['UserID', 'UserName', 'DepartmentID', 'EnterpriseID'], [_users[j].UserID, _users[j].Name, _users[j].DepartmentID, _users[j].EnterpriseID], "UserID", _users[j].UserID, function(bool) {
							callback(bool);
						});
					}
				})
			}
			//保存人员角色数据
			function SaveSyncUserRoles(_roles, callback) {
				var len = _roles.length;
				dbBase.OpenTransaction(function(tx) {
					for (var k = 0; k < len; k++) {
						dbBase.SaveOrUpdateUerRoleTable(tx, "tb_UserRoles", ['UserID', 'RoleID', 'RoleName', 'EnterpriseID'], [_roles[k].UserID, _roles[k].RoleID, _roles[k].RoleName, _roles[k].EnterpriseID], "UserID=? And RoleID=?", [_roles[k].UserID, _roles[k].RoleID], function(bool) {
							callback(bool);
						});
					}
				})
			}
			//保存项目数据
			function SaveSyncProject(_projectdata, callback) {
				var len = _projectdata.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < len; i++) {
						if (_projectdata[i].Deleted) {
							DeleteProject(_projectdata[i]);
						} else {
							dbBase.SaveOrUpdateTable(tx, "tb_Projects", ['ProjectID', 'ProjectName', 'Departments', 'HaveScene', 'ProjectRoles', 'ProjectState', 'Manager', 'EnterpriseID', 'Creator'], [_projectdata[i].ProjectID, _projectdata[i].ProjectName, _projectdata[i].Departments, _projectdata[i].HaveScene, _projectdata[i].ProjectRoles, _projectdata[i].ProjectState, _projectdata[i].Manager, _projectdata[i].EnterpriseID, _projectdata[i].Creator], "ProjectID", _projectdata[i].ProjectID, function(bool) {
								callback(bool);
							})
						};
					}
				})
			}
			//保存现场类型数据
			function SaveSyncSceneType(_scenetype, callback) {
				var len = _scenetype.length;
				dbBase.OpenTransaction(function(tx) {
					for (var k = 0; k < len; k++) {
						//存储现场类型
						dbBase.SaveOrUpdateTable(tx, "tb_SceneTypes", ['SceneTypeID', 'SceneTypeName', 'ParentID', 'Available', 'EnterpriseID'], [_scenetype[k].SceneTypeID, _scenetype[k].SceneTypeName, _scenetype[k].ParentID, _scenetype[k].Available, _scenetype[k].EnterpriseID], "SceneTypeID", _scenetype[k].SceneTypeID, function(bool) {
							callback(bool);
						});
					}
				})
			}
			//保存现场数据
			function SaveSyncScene(_scenedata, callback) {
				var len = _scenedata.length;
				dbBase.OpenTransaction(function(tx) {
					for (var j = 0; j < len; j++) {
						if (_scenedata[j].Deleted) {
							DeleteScene(_scenedata[j]);
						} else {
							//存储现场数据
							dbBase.SaveOrUpdateTable(tx, "tb_Scenes", ['SceneID', 'ParentID', 'SceneName', 'ProjectID', 'SceneWorker', 'SceneState', 'SceneType', 'Address', 'BeginDate', 'EndDate', 'HasData', 'SendStatus', 'AllWorkers'], [_scenedata[j].SceneID, _scenedata[j].ParentID, _scenedata[j].SceneName, _scenedata[j].ProjectID, JSON.stringify(_scenedata[j].SceneWorker), _scenedata[j].SceneState, _scenedata[j].SceneType, _scenedata[j].Address, _scenedata[j].BeginDate, _scenedata[j].EndDate, _scenedata[j].HasData, '1', JSON.stringify(_scenedata[j].AllWorkers)], "SceneID", _scenedata[j].SceneID, function(bool) {
								callback(bool);
							})
						};
					}
				})
			}
			//保存消息数据
			function SaveSyncMessage(jsondata, callback) {
				var len = jsondata.length;
				if (len) {
					dbBase.OpenTransaction(function(tx) {
						for (var i = 0; i < len; i++) {
							//存储消息数据
							dbBase.SaveOrUpdateTable(tx, "tb_UserMessage", ['MessageID', 'SendUserID', 'Message', 'SendTime', 'Recipients', 'SendUserName', 'SendUserPicture', 'HeadPictureURI', 'MsgType', 'EnterpriseID', 'Time', 'Status', 'IsRead'], [jsondata[i].MessageID, jsondata[i].SendUserID, jsondata[i].Message, jsondata[i].SendTime, jsondata[i].Recipients, jsondata[i].SendUserName, jsondata[i].SendUserPicture, "", jsondata[i].MsgType, jsondata[i].EnterpriseID, jsondata[i].Time, '1', jsondata[i].IsRead], "MessageID", [jsondata[i].MessageID], function(bool) {
								callback(bool);
							});
						}

					})
				} else {
					dbBase.OpenTransaction(function(tx) {
						dbBase.SaveOrUpdateTable(tx, "tb_UserMessage", ['MessageID', 'SendUserID', 'Message', 'SendTime', 'Recipients', 'SendUserName', 'SendUserPicture', 'HeadPictureURI', 'MsgType', 'EnterpriseID', 'Time', 'Status', 'IsRead'], [jsondata.MessageID, jsondata.SendUserID, jsondata.Message, jsondata.SendTime, jsondata.Recipients, jsondata.SendUserName, jsondata.SendUserPicture, "", jsondata.MsgType, jsondata.EnterpriseID, jsondata.Time, '1', jsondata.IsRead], "MessageID", jsondata.MessageID);
					})
				}
			}
			//worker
			//变更同步时间
			function SaveWorkerTime(time) {
				var q = $q.defer();
				SqliteServ.saveOrupadte("tb_CurrentUsers", ['LastTime'], [time], "UserID=?", [userInfo.UserID]).then(function(res) {
					q.resolve(res);
				});
				return q.promise;
			}
			//
			function SaveWorkerUser(_users) {
				var len = _users.length;
				dbBase.OpenTransaction(function(tx) {
					for (var j = 0; j < len; j++) {
						//存储人员数据
						dbBase.SaveOrUpdateTable(tx, "tb_FrontUsers", ['UserID', 'UserName', 'DepartmentID', 'EnterpriseID'], [_users[j].UserID, _users[j].Name, _users[j].DepartmentID, _users[j].EnterpriseID], "UserID", _users[j].UserID);
						dbBase.SaveOrUpdateTable(tx, "tb_SceneMessageComments", ['UserID', 'UserName'], [_users[j].UserID, _users[j].Name], "UserID", _users[j].UserID);
						dbBase.SaveOrUpdateTable(tx, "tb_UserMessage", ['SendUserID', 'SendUserName'], [_users[j].UserID, _users[j].Name], "SendUserID", _users[j].UserID);
					}
				})
			}

			function SaveSyncSceneData(jsondata) {
				var _len = jsondata.length;
				dbBase.OpenTransaction(function(tx) {
					for (var i = 0; i < _len; i++) {
						SaveNewToSceneItem(tx, jsondata[i]);
						if (jsondata[i].UserID != $rootScope.userInfo.UserID) {
							ChangeStatus(tx, jsondata[i].SceneID);
						}
					}
				})
			}
			//具体现场：增加一条新的消息(历史，发送，worker)
			function SaveNewToSceneItem(tx, jsondata, callback) {
				if (jsondata) {
					var _strcomments = ""
					if (jsondata.Comments != null)
						_strcomments = JSON.stringify(jsondata.Comments);
					var _strimages = "";
					if (jsondata.Images != null)
						_strimages = JSON.stringify(jsondata.Images);
					_Examines = jsondata.Examines == null ? "[]" : JSON.stringify(jsondata.Examines);
					var _Files = "[]";
					if (jsondata.Files != null) {
						_Files = JSON.stringify(jsondata.Files);
					}
					dbBase.SaveOrUpdateTable(tx, "tb_SceneMessageComments", ["MessageID", "SceneID", "UserID", "UserPicture", "UserPictureURI", "UserName", "Address", "CreateTime", "Description", "Images", "Comments", "Status", "Type", "State", "PictureGuid", "Relation", "IsExamine", "Examines", "Files"], [jsondata.Id, jsondata.SceneID, jsondata.UserID, jsondata.UserPicture, "", jsondata.UserName, jsondata.Address + "," + jsondata.GPS, jsondata.CreateTime, jsondata.Description, _strimages, _strcomments, jsondata.Status, jsondata.Type, 1, jsondata.PictureGuid, jsondata.Relation, jsondata.IsExamine, _Examines, _Files], "MessageID", jsondata.Id);
				}
			};
			//具体现场：增加新的消息(历史，发送，worker)
			function SaveSceneMessageData(jsondata) {
				if (jsondata) {
					var _len = jsondata.length;
					dbBase.OpenTransaction(function(tx) {
						for (var i = 0; i < _len; i++) {
							PushNewToSceneItem(tx, jsondata[i]);
						}
					})
				}
			};
			//具体现场：增加一条新的消息(历史，发送，worker)

			function PushNewToSceneItem(tx, jsondata) {
				if (jsondata) {
					var _strcomments = ""
					if (jsondata.Comments != null)
						_strcomments = JSON.stringify(jsondata.Comments);
					var _strimages = "";
					if (jsondata.Images != null)
						_strimages = JSON.stringify(jsondata.Images);
					_Examines = jsondata.Examines == null ? "[]" : JSON.stringify(jsondata.Examines);
					var _Files = "[]";
					if (jsondata.Files != null) {
						_Files = JSON.stringify(jsondata.Files);
					}
					dbBase.SaveOrUpdateTable(tx, "tb_SceneMessageComments", ["MessageID", "SceneID", "UserID", "UserPicture", "UserPictureURI", "UserName", "Address", "CreateTime", "Description", "Images", "Comments", "Status", "Type", "State", "PictureGuid", "Relation", "IsExamine", "Examines", "Files"], [jsondata.Id, jsondata.SceneID, jsondata.UserID, jsondata.UserPicture, "", jsondata.UserName, jsondata.Address + "," + jsondata.GPS, jsondata.CreateTime, jsondata.Description, _strimages, _strcomments, jsondata.Status, jsondata.Type, 1, jsondata.PictureGuid, jsondata.Relation, jsondata.IsExamine, _Examines, _Files], "MessageID", jsondata.Id);
				}
			};

			//
			function ChangeStatus(tx, sceneid) {
				dbBase.SaveOrUpdateTable(tx, "tb_Scenes", ['Status'], [true], "SceneID", sceneid, function(data) {
					if (data) {
						dbBase.SelectTable(tx, "select * from tb_Scenes where SceneID ==?", [sceneid], function(adata) {
							if (adata && adata.item(0).ParentID != -1) {
								ChangeStatus(tx, adata.item(0).ParentID);
							} else if (adata && adata.item(0).ParentID == -1) {
								dbBase.SaveOrUpdateTable(tx, "tb_Projects", ['Status'], [true], "ProjectID", adata.item(0).ProjectID, function(data) {});
							}
						});
					}
				});
			}
			//写入发送消息
			function AddSendMessage(jsondata) {
				var q = $q.defer();
				if (jsondata) {
					SqliteServ.saveOrupadte("tb_UserMessage", ['MessageID', 'SendUserID', 'Message', 'SendTime', 'Recipients', 'SendUserName', 'SendUserPicture', 'HeadPictureURI', 'MsgType', 'EnterpriseID', 'Time', 'Status', 'IsRead'], [jsondata.MessageID, jsondata.SendUserID, jsondata.Message, jsondata.SendTime, jsondata.Recipients, jsondata.SendUserName, jsondata.SendUserPicture, "", 1, jsondata.EnterpriseID, jsondata.Time, jsondata.Status, 2], 'MessageID=?', [jsondata.MessageID]).then(function(data) {
						q.resolve(data)
					});
				}
				return q.promise;
			};
			//修改发送消息
			function UpdateSendMessage(jsondata) {
				var q = $q.defer();
				if (jsondata) {
					SqliteServ.saveOrupadte("tb_UserMessage", ['Status'], ['1'], "MessageID=?", [jsondata.MessageID]).then(function(data) {
						q.resolve(data)
					})
				}
				return q.promise;
			};
			//更改公告状态
			function UpdateNoticeStatus(id) {
				var q = $q.defer();
				SqliteServ.update("tb_UserMessage", ['IsRead'], [1], "MessageID=?", [id]).then(function(res) {
					q.resolve(res);
				});
				return q.promise;
			}
			//修改项目状态
			function UpdateProjectSceneStatus(type, id) {
				var q = $q.defer();
				if (type == "project") {
					BaseUpdate("tb_Projects", ['Status'], [false], "ProjectID=?", [id]).then(function(res) {
						q.resolve(res);
					});
				} else {
					BaseUpdate("tb_Scenes", ['Status'], [false], "SceneID=?", [id]).then(function(res) {
						q.resolve(res);
					});
				}
				return q.promise;
			}
			/*改变状态*/
			function ChangeState(jsondata, state) {
				dbBase.OpenTransaction(function(tx) {
					var _length = jsondata.length;
					for (var i = 0; i < _length; i++) {
						dbBase.UpdateTable(tx, "tb_SceneMessageComments", ['State'], [state], "MessageID=?", jsondata[i].MessageID, function(istrue) {
							//				alert(istrue);
						})
					}
				});
			};

			function BaseUpdate(tablename, field, param, condition, cparam) {
				var q = $q.defer();
				SqliteServ.update(tablename, field, param, condition, cparam).then(function(res) {
					q.resolve(res);
				})
				return q.promise;
			}

			function BaseSaveUpdate(tablename, field, param, condition, cparam) {
				
				var q = $q.defer();
				SqliteServ.saveOrupadte(tablename, field, param, condition, cparam).then(function(res) {
					q.resolve(res);
				})
				return q.promise;
			}
			/*
			 * 删除数据库
			 */
			//
			function DeleteAllTable(userid) {
				SqliteServ.transaction(function(tx) {
					if (userid) {
						SqliteServ.deletetable(tx, "tb_CurrentUsers", 'UserID !=?', [userid]);
					} else {
						SqliteServ.deletetable(tx, "tb_CurrentUsers");
					}
					SqliteServ.deletetable(tx, "tb_UserMessage");
					SqliteServ.deletetable(tx, "tb_Departments");
					SqliteServ.deletetable(tx, "tb_Projects");
					SqliteServ.deletetable(tx, "tb_Scenes");
					SqliteServ.deletetable(tx, "tb_SceneMessage");
					SqliteServ.deletetable(tx, "tb_SceneMessageComments");
					SqliteServ.deletetable(tx, "tb_Materials");
					SqliteServ.deletetable(tx, "tb_UserRoles");
					SqliteServ.deletetable(tx, "tb_Comment");
					SqliteServ.deletetable(tx, "tb_FrontUsers");
					SqliteServ.deletetable(tx, "tb_SceneTypes");
				})
			}
			//处理删除数据
			function WorkerDeleteData(data) {
				if (data) {
					var _len = data.length;
					dbBase.OpenTransaction(function(tx) {
							for (var i = 0; i < _len; i++) {
								switch (data[i].EntityName) {
									case "SceneItem": //删除现场信息
										DeleteSceneItem(tx, data[i].EntityID);
										break;
									case "UserRole": //删除用户角色关系
										DeleteUserRole(data[i].EntityID);
										break;
									case "FrontUser": //删除人员
										DeleteFrontUser(data[i].EntityID);
										break;
									case "Role":
										break;
									case "SceneType": //删除现场类型
										DeleteSceneType(data[i].EntityID);
										break;
									default:
										break;
								}
							}
						})
						//处理删除数据
				}
			};
			//删除聊天消息
			function DeleteMessage(jsondata) {
				if (jsondata) {
					var _len = jsondata.length;
					dbBase.OpenTransaction(function(tx) {
						dbBase.DeleteTable(tx, "tb_UserMessage", "MessageID=?", [jsondata[i].MessageID]); //删除消息
					})
				}
			};
			//项目:删除项目(worker)
			function DeleteProject(jsondata) {
				if (jsondata) {
					dbBase.OpenTransaction(function(tx) {
						dbBase.DeleteTable(tx, "tb_Projects", "ProjectID=?", [jsondata.ProjectID]); //删除项目
						dbBase.SelectTable(tx, "select SceneID from tb_Scenes where ProjectID=?", [jsondata.ProjectID], function(adata) {
							if (adata) {
								var _length = adata.length;
								for (var i = 0; i < _length; i++) {
									dbBase.DeleteTable(tx, "tb_SceneMessageComments", "SceneID=?", [adata.item(0).SceneID]); //删除与项目有关的具体现场数据
								}
							}
						});
						dbBase.DeleteTable(tx, "tb_Scenes", "ProjectID=?", [jsondata.ProjectID]); //删除项目相关现场
					})
				}
			};
			//现场:删除现场(worker)
			function DeleteScene(jsondata) {
				if (jsondata) {
					dbBase.OpenTransaction(function(tx) {
						var _bool = false;
						dbBase.DeleteTable(tx, "tb_Scenes", "SceneID=?", [jsondata.SceneID]); //删除现场
						dbBase.DeleteTable(tx, "tb_SceneMessageComments", "SceneID=?", [jsondata.SceneID]); //删除与现场有关的具体现场信息
					})
				}
			};
			//具体现场：删除一条消息
			function DeleteSceneItem(tx, messageid) {
				if (messageid) {
					dbBase.DeleteTable(tx, "tb_SceneMessageComments", "MessageID=?", [messageid]); //删除现场消息
				}
			};
			//现场类型：删除现场类型（没有被引用的现场类型才能被删除）
			function DeleteSceneType(typeID) {
				if (typeID) {
					dbBase.OpenTransaction(function(tx) {
						dbBase.DeleteTable(tx, "tb_SceneTypes", "SceneTypeID=?", [typeID]);
					})
				}
			};
			//部门信息:删除部门信息
			function DeleteDepartment(jsondata) {
				if (jsondata) {
					dbBase.OpenTransaction(function(tx) {
						//删除整条数据
						dbBase.ExecSql(tx, "delete from tb_Departments where DepartmentID=?", [jsondata.DepartmentID]);
						dbBase.SaveOrUpdateTable(tx, "tb_FrontUsers", "DepartmentID", [], "DepartmentID=?", [jsondata.DepartmentID]); //删除部门人员
						//dbBase.DeleteTable(tx, "tb_Projects ", "Departments=?", [jsondata.DepartmentID]); //删除部门下项目
						dbBase.SelectTable(tx, "select ProjectID,Departments form tb_Projects where Departments like '%" + jsondata.DepartmentID + "%'", [], function(adata) {
							if (adata) {
								var _len = adata.length;
								for (var i = 0; i < _len; i++) {
									var _str = adata.item(i).Deparments;
									_str = _str.replace(jsondata.DepartmentID, "");
									dbBase.UpdateTable(tx, "tb_Projects", ['Departments'], [_str], "ProjectID", adata.item(i).ProjectID);
								}
							}
						}); //修改与部门有关的项目
					})
				}
			};
			//人员信息:删除人员信息
			function DeleteFrontUser(userid) {
				if (userid) {
					dbBase.OpenTransaction(function(tx) {
						dbBase.DeleteTable(tx, "tb_FrontUsers", "UserID=?", [userid]);
						dbBase.DeleteTable(tx, "tb_UserRoles", "UserID=?", [userid]);
						dbBase.DeleteTable(tx, "tb_UserMessage", "SendUserID=?", [userid]);
						dbBase.DeleteTable(tx, "tb_SceneMessageComments", "UserID=?", [userid]);
					})
				}
			};
			//角色信息:删除角色信息
			function DeleteRoles(jsondata) {
				if (jsondata) {
					var _len = jsondata.length;
					dbBase.OpenTransaction(function(tx) {
						for (var i = 0; i < _len; i++) {
							dbBase.DeleteTable(tx, "tb_UserRoles", "RoleID=?", [jsondata[i].RoleID]);
						}
					})
				}
			};
			//关系信息:删除人员角色关系
			function DeleteUserRole(adata) {
				if (adata) {
					dbBase.OpenTransaction(function(tx) {
						var _jsondata = {
								UserID: adata.substring(0, 6),
								RoleID: adata.substring(7, adata.length)
							}
							//删除整条数据
						dbBase.ExecSql(tx, "delete from tb_UserRoles where UserID=? AND RoleID=?", [_jsondata.UserID, _jsondata.RoleID]);
					});
				}
			}
			//删除发送消息
			function DeleteSendMessage(jsondata) {
				var q = $q.defer()
				SqliteServ.deletehis("tb_UserMessage", 'MessageID=?', [jsondata.MessageID]).then(function(res) {
					q.resolve(res);
				})
				return q.promise;
			}
			//
			function BaseDelete(tablename, condition, param) {
				var q = $q.defer()
				SqliteServ.deletehis(tablename, condition, param).then(function(res) {
					q.resolve(res);
				})
				return q.promise;
			}
		}
	])