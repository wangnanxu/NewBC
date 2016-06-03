sceneModule
	.factory('SceneServ', ['DataServ', 'CommFun', '$rootScope', '$state', '$timeout',
		function(DataServ, CommFun, $rootScope, $state, $timeout) {
			$rootScope.projectId = 0; //项目ID
			var projectmanager; //项目管理者
			var departments; //项目涉及部门
			var roles; //项目涉及角色
			var sceneState; //现场状态

			var CurrentProPage = 0;
			var CurrentProLength = 0;
			var pageCount = 20; //每次上拉加载条数

			var currentPosition = ""; //当前地址坐标
			var CacheNodesID;
			var nodeItemType = "{id:'{id}',pId:'{pid}',name:'{name}',type:'{type}'}";
			var AllUserDepartmentName = {};
			var typemodal; //弹出框类型0现场类型，1角色人员
			var roleIndex; //角色索引

			$rootScope.parentidList = null; //父级id列表

			var zNodesType = null;
			var settingType = {
				view: {
					selectedMulti: false,
					showLine: false
				},
				check: {
					enable: true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onClick: OnClickType
				}
			};
			var serverdata = {
				isShowAddbtn: false, //是否显示添加现场按钮
				scenelist: null, //所有现场数据
				currentlist: null, //当前显示现场列表
				noMore: true,
				currentScene: null, //设置选择的当前现场

				modaltype: 0, //新增为0，修改为1
				addSceneName: '',
				isShowPerson: false, //是否显示人员分配
				parentSceneList: null, //添加现场父现场列
				hasRoles: true, //是否存在人员分配
				address: '',
				sceneType: null,

				beginDate: '',
				endDate: '',

				sceneTypeSelect: null, //选中类型
				roleslist: null,

			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData,
				GoBack: GoBack,
				GotoScene: GotoScene,
				CheckPermission: CheckPermission, //检查是否可以添加现场
				InitAddScene: InitAddScene, //初始化添加现场数据
				InitSceneTypeModal: InitSceneTypeModal,
				ReInitAddSceneData: ReInitAddSceneData,
				SelectTime: SelectTime, //选择时间
				ChangeShow: ChangeShow,
				ConfirmSelectType: ConfirmSelectType,
				ConfirmAddScene: ConfirmAddScene, //确认添加
				InitUpdateModal: InitUpdateModal, //显示设置
				
				Destory:Destory
			}
			return server;

			function GetServerData() {
				return serverdata;
			}
			//初始化现场页面
			function InitData(projectid, manager, sceneid) {
				sceneState = null;
				$rootScope.projectId = projectid;
				serverdata.isShowAddbtn = CommFun.CheckItem($rootScope.userInfo.FunctionIDs, "Root.AppPermission.SceneManage.AddScene");
				if (sceneid && $rootScope.parentidList) { //具体现场返回
					var len = $rootScope.parentidList.length;
					ShowSceneList(0, $rootScope.parentidList[len - 1]);
				} else { //项目进入
					ShowSceneList(0, '-1');
				}
			}
			//显示现场列表，type=0子列表，type=1返回父列表
			function ShowSceneList(type, sceneid) {
				var id = 0;
				if (type == 0) {
					if ($rootScope.parentidList == null) {
						$rootScope.parentidList = new Array();
					}
					if (CommFun.CheckItem($rootScope.parentidList, sceneid)) {
						return;
					}
					id = sceneid;
					$rootScope.parentidList.push(sceneid);
				} else {
					if ($rootScope.parentidList == null && $rootScope.parentidList.length <= 0) {
						return;
					}
					var len = $rootScope.parentidList.length;
					id = $rootScope.parentidList[len - 2];
					$rootScope.parentidList.pop();
				}

				if (CommFun.CheckItem($rootScope.userInfo.FunctionIDs, "Root.AppPermission.SceneManage.ViewAchievedScene")) {
					if ($rootScope.parentidList)
						DataServ.BaseSelect("select * from tb_Scenes where ProjectID=? And ParentID=? Order By SceneState", [$rootScope.projectId, id]).then(function(adata) {
							if (adata && adata.length > 0) {
								var _arrTrue = [];
								var _arrFalse = [];
								isHaveScene = true;
								var _len = adata.length;
								for (var i = 0; i < _len; i++) {
									adata[i].GPS = adata[i].Address.split(',');
									if (adata[i].Status == "true") {
										_arrTrue.push(adata[i]);
									} else {
										_arrFalse.push(adata[i]);
									}
								}
								_arrTrue.sort(SortArr);
								_arrFalse.sort(SortArr);
								ReInitData();
								if (serverdata.scenelist == null) {
									serverdata.scenelist = new Array();
								}
								serverdata.scenelist = _arrTrue.concat(_arrFalse);

							} else {
								isHaveScene = false;
							}
							ShowScene(sceneid);

							function SortArr(a, b) {
								var i = a.SceneState - b.SceneState;
								if (i == 0) {
									return 0;
								} else if (i == 2 || ((i == 1 || i == -1) && b.SceneState == 2)) {
									return 1;
								} else {
									return -1;
								}
							};
						})
				}
				DataServ.BaseSelect("select Departments,ProjectRoles from tb_Projects where ProjectID=?", [$rootScope.projectId]).then(function(adata) {
					if (adata && adata.length > 0) {
						departments = adata[0].Departments;
						roles = adata[0].ProjectRoles;
					}
				})
			}
			//组装现场列表数据
			function ShowScene(sceneid) {
				if (serverdata.scenelist == null) {
					return;
				}
				if (isHaveScene == false) {
					GotoSceneItem(sceneid);
					return;
				}
				var _length = serverdata.scenelist.length;
				CurrentProLength = _length;
				var startindex = CurrentProPage * pageCount;
				var count = 0;
				if (startindex < _length) {
					for (var i = startindex; i < _length; i++) {
						if (count >= pageCount) {
							break;
						}
						count++;
						if (serverdata.currentlist == null) {
							serverdata.currentlist = new Array()
						}
						serverdata.currentlist.push(serverdata.scenelist[i]);

					}
					CurrentProPage++;
				}
				CommFun.RefreshData(serverdata);
			}
			//返回
			function GoBack() {
				if ($rootScope.parentidList == null || ($rootScope.parentidList && $rootScope.parentidList.length <= 0)) {
					return;
				}
				if ($rootScope.parentidList.length == 1 && $rootScope.parentidList[0] == '-1') {
					$rootScope.parentidList = null;
					ReInitData();
					$state.go('tab.project')
				} else {
					ShowSceneList(1);
				}
			}
			//查找子页面
			function GotoScene(index) {
				var item = serverdata.currentlist[index];
				DataServ.UpdateProjectSceneStatus("scene", item.SceneID);
				sceneState = item.SceneState;
				ShowSceneList(0, item.SceneID);
			}
			//进入具体现场
			function GotoSceneItem(sceneid) {
				$state.go('sceneItem', {
					sceneID: sceneid,
					state: sceneState
				});
			}
			//还原数据
			function ReInitData() {
				CurrentProPage = 0;
				serverdata.scenelist = null; //所有现场数据
				serverdata.currentlist = null; //当前显示现场列表
				serverdata.noMore = true;
			}
			//检测是否有该权限
			function CheckPermission(permission) {
				if (permission == false || permission == true || $rootScope.userInfo[permission]) {
					if (sceneState != "3") {
						return true;
					} else {
						if (permission == true) {
							//				alert("项目已完工！");
							//NotificationAlert("项目已完工！", "提示");
						}
						return false;
					}
				} else {
					//NotificationAlert("无该项操作权限!", "提示");
					//		alert("无该项操作权限!");
					return false;
				}
			};
			//初始化添加现场页面，type=0新增现场，type=1修改现场
			function InitAddScene(type) {
				serverdata.modaltype = type;
				if (type == 0) {
					GetParentList(); //获得父级
					GetAddress(); //获取地址
					GetAllSceneType(); //获取现场类型
					GetDepartments(); //获取人员
				} else {

					GetAllSceneType(); //获取现场类型
					GetDepartments(); //获取人员
					$timeout(function() {
						SetUpdateData(); //初始化数据
					}, 1000)
				}
			}
			//设置默认
			function SetUpdateData() {
				if (serverdata.currentScene) {
					var item = serverdata.currentScene;
					var arr = item.Address.split(',')
					serverdata.address = arr[0];
					serverdata.addSceneName = item.SceneName;
					currentPosition = arr[1];
					serverdata.beginDate = item.BeginDate;
					serverdata.endDate = item.EndDate;
					if (serverdata.parentSceneList == null) {
						serverdata.parentSceneList = new Array();
					}
					serverdata.parentSceneList[0] = [{
						SceneName: '',
						ID: item.ProjectID + '|' + item.SceneID
					}]
					if (item.ParentID == '-1') {
						DataServ.BaseSelect("select * from tb_Projects where ProjectID=?", [item.ProjectID]).then(function(res) {
							if (res) {
								serverdata.parentSceneList[0].SceneName = res[0].ProjectName;
							}
						})
					} else {
						DataServ.BaseSelect("select * from tb_Scenes where SceneID=?", [item.ParentID]).then(function(data) {
							if (res) {
								serverdata.parentSceneList[0].SceneName = res[0].SceneName;
							}
						})
					}
					//设置类型
					if (item.SceneType) {
						var arr = item.SceneType.split('|')
						var len = arr.length;
						if (serverdata.sceneType) {
							var length = serverdata.sceneType.length;
							for (var i = 0; i < len; i++) {
								for (var j = 0; j < length; j++) {
									if (serverdata.sceneType[j].SceneTypeID == parseInt(arr[i])) {
										if (serverdata.sceneTypeSelect == null) {
											serverdata.sceneTypeSelect = new Array()
										}
										serverdata.sceneTypeSelect.push({
											id: serverdata.sceneType[j].SceneTypeID,
											name: serverdata.sceneType[j].SceneTypeName
										})
									}
								}
							}
						}

					}
					//设置状态
					if (item.SceneState) {
						serverdata.scenestatus = item.SceneState;
					}
					//设置worker
					if (item.SceneWorker) {
						sceneWorker = item.SceneWorker;
						try {
							var _arr = JSON.parse(item.SceneWorker);
							var _len = _arr.length;
							if (serverdata.roleslist) {
								var length = serverdata.roleslist.length;
								for (var i = 0; i < _len; i++) {
									for (var j = 0; j < length; j++) {
										if (serverdata.roleslist[j].typeID == _arr[i].roleId) {
											var _leng = serverdata.roleslist[j].user.length;
											for (var k = 0; k < _leng; k++) {
												if (serverdata.roleslist[j].Select == null) {
													serverdata.roleslist[j].Select = new Array();
												}
												var _lengt = _arr[i].UserID.length;
												for (var e = 0; e < _lengt; e++) {
													if (serverdata.roleslist[j].user[k].UserID == _arr[i].UserID[e]) {
														var a = serverdata.roleslist[j].user[k]
														serverdata.roleslist[j].Select.push({
															id: a.UserID,
															name: a.UserName
														});
													}
												}

											}
										}

									}
								}
							}

						} catch (e) {

						}
					}

				}
				CommFun.RefreshData(serverdata);
			}
			//获取父类项目现场
			function GetParentList() {
				if ($rootScope.parentidList && $rootScope.parentidList.length == 1) {
					if ($rootScope.parentidList[0] == '-1') { //项目开始
						DataServ.BaseSelect("select * from tb_Projects where ProjectID=?", [$rootScope.projectId]).then(function(adata) {
							if (adata.length >= 1) {
								//添加角色人员
								var item = {
									SceneName: "[项目]" + adata[0].ProjectName,
									ID: adata[0].ProjectID + "|-1"
								}
								if (serverdata.parentSceneList == null) {
									serverdata.parentSceneList = new Array();
								}
								serverdata.parentSceneList.push(item);
								var _projectid = adata[0].ProjectID;
								DataServ.BaseSelect("select * from tb_Scenes where ProjectID=? And ParentID=? And HasData=?", [_projectid, "-1", 'false']).then(function(data) {
									if (data && data.length > 0) {
										AddParentScene(data)
									}

								})
							}
						})
					} else { //现场开始
						var len = $rootScope.parentidList.length
						DataServ.BaseSelect("select * from tb_Scenes where SceneID=?", [$rootScope.parentidList[len - 1]]).then(function(adata) {
							AddParentScene(adata);
							DataServ.BaseSelect("select * from tb_Scenes where ProjectID=? And ParentID=? And HasData=?", [projectId, parentId, 'false']).then(function(data) {
								AddParentScene(data);
							});
						});
					}
				}
			}

			function AddParentScene(adata) {
				var len = adata.length;
				for (var i = 0; i < len; i++) {
					var item = {
						SceneName: "[项目]" + adata[i].SceneName,
						ID: adata[i].ProjectID + "|" + adata[i].SceneID
					}
					if (serverdata.parentSceneList == null) {
						serverdata.parentSceneList = new Array();
					}
					serverdata.parentSceneList.push(item);

				}
				CommFun.RefreshData(serverdata);
			}
			//获取地址
			function GetAddress() {
				CommFun.GetPosition(function(position) {
					if (position) {
						CommFun.GetBaiduAddress(position, function(address) {
							currentPosition = position.longitude + "|" + position.latitude;
							serverdata.address = address;
							CommFun.RefreshData(serverdata);
						})
					}
				})
			}
			//获取现场类型
			function GetAllSceneType() {
				DataServ.BaseSelect("select * from tb_SceneTypes where EnterpriseID=?", [$rootScope.userInfo.EnterpriseID]).then(function(data) {
					if (data && data.length > 0) {
						serverdata.sceneType = data;
						CommFun.RefreshData(serverdata);
					}
				})
			}
			/*
			 * 查找项目涉及并与属于当前操作者有关部门
			 */
			function GetDepartments() {
				if (departments) {
					var _departments = departments.split("|");
					ChioceRoles(_departments);
				} else {
					serverdata.hasRoles = false;
					return;
				}
			}
			//查找对应角色人员
			function ChioceRoles(departments) {
				if (roles) {
					var _roles = roles.split("|");
				} else {
					serverdata.hasRoles = false;
					return;
				}
				var _len = _roles.length;
				DataServ.GetRoles(_roles, function(adata) {
					if (adata) {
						var str = "(" + departments.join(",") + ")";
						var _lengthUR = adata.length;
						var _adata = {
							type: adata[0].RoleName,
							typeID: adata[0].RoleID,
							user: null, //所有人员
							Select: null //被选中
						};
						if (serverdata.roleslist == null) {
							serverdata.roleslist = new Array();
						}
						var len = serverdata.roleslist.length;
						var has = false;
						for (var j = 0; j < len; j++) {
							if (serverdata.roleslist[j].typeID == adata[0].RoleID) {
								has = true;
							}
						}
						if (has == false) {
							serverdata.roleslist.push(_adata);
						}
						for (var i = 0; i < _lengthUR; i++) {
							DataServ.GetFrontUser(adata, str, function(newadata, roleID) {
								if (newadata && serverdata.roleslist) {
									var len = serverdata.roleslist.length;
									for (var j = 0; j < len; j++) {
										if (serverdata.roleslist[j].typeID == roleID) {
											if (serverdata.roleslist[j].user == null) {
												serverdata.roleslist[j].user = new Array();
											}
											var length = serverdata.roleslist[j].user.length;
											var hasv = false
											for (var k = 0; k < length; k++) {
												if (serverdata.roleslist[j].user[k].UserID == newadata[0].UserID) {
													hasv = true;
												}
											}
											if (hasv == false) {
												serverdata.roleslist[j].user.push(newadata[0]);
											}
										}
									}
								}

							})
						}
						CommFun.RefreshData(serverdata);
					}
				})
			}

			function ReInitAddSceneData() {
				serverdata.parentSceneList = null; //添加现场父现场列
				serverdata.hasRoles = true, //是否存在人员分配
					serverdata.address = '';
				serverdata.sceneType = null;
				serverdata.roleslist = null;
			}
			//初始化现场类型模块,type=0现场类型，type=1角色人员
			function InitSceneTypeModal(type, index) {
				typemodal = type;
				if (type == 0) {
					serverdata.sceneTypeSelect = null;
					if (serverdata.sceneType) {
						var len = serverdata.sceneType.length;
						for (var i = 0; i < len; i++) {
							AssembleSceneTypeTree(serverdata.sceneType[i]);
						}
					}
					InitTreeType();
					SetDefaultSelect();
				} else {
					roleIndex = index;
					serverdata.roleslist[roleIndex].Select = null;
					SelectUerDepartment(index);
				}
			}

			//组装现场类型
			function AssembleSceneTypeTree(adata) {
				if (adata) {
					var _item = nodeItemType;
					_item = _item.replace(/{id}/g, adata.SceneTypeID);
					_item = _item.replace(/{pid}/g, adata.ParentID);
					_item = _item.replace(/{name}/g, adata.SceneTypeName);
					_item = _item.replace(/{type}/g, "1");
					if (zNodesType == null) {
						zNodesType = new Array();
					}
					zNodesType.push(_item);
				}
			};
			//初始化树形结构
			function InitTreeType() {
				if (zNodesType) {
					var _str = zNodesType.join(",");
					var _json = eval('[' + _str + ']');
					$.fn.zTree.init($("#typetreeDemo"), settingType, _json);
				}
			};
			//设置默认节点
			function SetDefaultSelect() {
				var zTree = $.fn.zTree.getZTreeObj("typetreeDemo");
				var nodes = zTree.getNodes();
				if (typemodal == 0) {
					CacheNodesID = serverdata.sceneTypeSelect == null ? [] : serverdata.sceneTypeSelect;
				} else {
					CacheNodesID = serverdata.roleslist[roleIndex].Select == null ? [] : serverdata.roleslist[roleIndex].Select;
				}
				DefalutSelect(nodes);
				zTree.refresh();
			}

			function DefalutSelect(nodes) {
				if (nodes) {
					var _length = nodes.length;
					for (var i = 0; i < _length; i++) {
						if (CommFun.CheckItem(nodes[i].id, CacheNodesID)) {
							nodes[i].checked = true;
						}
						DefalutSelect(nodes[i].children);
					}
				}
			}

			function OnClickType(e, treeId, treeNode, clickFlag) {
				var zTree = $.fn.zTree.getZTreeObj("typetreeDemo");
				treeNode.checked = !treeNode.checked;
				var nodes = treeNode.children;
				doCheck(nodes)

				zTree.refresh();

				function doCheck(Node) {
					if (Node) {
						var _length = Node.length;
						for (var i = 0; i < _length; i++) {
							Node[i].checked = treeNod + e.checked;
							doCheck(Node[i].children);
						}
					}
				}
			};
			//确认选择现场类型
			function ConfirmSelectType() {
				var zTree = $.fn.zTree.getZTreeObj("typetreeDemo");
				var nodes = zTree.getNodes();
				zNodesType = null;
				GetSelectSceneType(nodes);
				CommFun.RefreshData(serverdata)
			}
			//获取已选节点
			function GetSelectSceneType(nodes) {
				if (nodes) {
					var _length = nodes.length;
					for (var i = 0; i < _length; i++) {
						if (nodes[i].checked == true) {
							if (typemodal == 0) {
								if (serverdata.sceneTypeSelect == null) {
									serverdata.sceneTypeSelect = new Array();
								}
								serverdata.sceneTypeSelect.push(nodes[i])
							} else {
								if (serverdata.roleslist[roleIndex].Select == null) {
									serverdata.roleslist[roleIndex].Select = new Array();
								}
								serverdata.roleslist[roleIndex].Select.push(nodes[i])
							}
						}
						GetSelectSceneType(nodes[i].children);
					}
				}
			}

			function SelectUerDepartment(index) {
				var sql = "select tb_FrontUsers.UserID,tb_Departments.DepartmentName from tb_FrontUsers, tb_Departments where tb_FrontUsers.DepartmentID = tb_Departments.DepartmentID and tb_FrontUsers.EnterpriseID = ?";
				DataServ.BaseSelect(sql, [$rootScope.userInfo.EnterpriseID]).then(function(data) {
					if (data) {
						var _length = data.length;
						for (var i = 0; i < _length; i++) {
							AllUserDepartmentName[data[i].UserID] = data[i].DepartmentName;
						}
						if (serverdata.roleslist) {
							var length = serverdata.roleslist[index].user.length;
							for (var j = 0; j < length; j++) {
								AssembleScenePersonTree(serverdata.roleslist[index].user[j]);
							}
						}
						InitTreeType();
						SetDefaultSelect();
					}
				})
			}
			//组装人员
			function AssembleScenePersonTree(adata) {
				if (adata) {
					var _item = nodeItemType;
					_item = _item.replace(/{id}/g, adata.UserID);
					_item = _item.replace(/{pid}/g, 0);
					_item = _item.replace(/{name}/g, adata.UserName + "-" + AllUserDepartmentName[adata.UserID]);
					_item = _item.replace(/{type}/g, "1");
					if (zNodesType == null) {
						zNodesType = new Array();
					}
					zNodesType.push(_item);
				}
			};

			function ChangeShow() {
				serverdata.isShowPerson = !serverdata.isShowPerson;
				CommFun.RefreshData(serverdata);
			}

			function SelectTime(id) {
				var oldtime = $("#" + id).val();
				var newtime = new Date();
				if (oldtime != "") {
					newtime = new Date(oldtime);
				}
				var options = {
					date: newtime,
					mode: 'date'
				};
				CommFun.ShowDatePicker(options).then(function(date) {
					try {
						if (date) {
							var Year = date.getFullYear();
							var month = date.getMonth() + 1;
							var Month = month < 10 ? ("0" + month) : month;
							var day = date.getDate();
							var Day = day < 10 ? ("0" + day) : day;
							var time = Year + "-" + Month + "-" + Day;
							$("#" + id).val(time);
						}
					} catch (error) {}
				})
			}
			//确认添加
			function ConfirmAddScene(name, callback) {
				var _data = AssemblePostData('0', name);
				if (_data != null) {
					var point = _data.LongAndLat.split('|');
					_data.LongAndLat = point[1] + "|" + point[0];;
					//向服务器请求添加现场
					DataServ.PostAddScene(_data).then(function(adata) {
						if (adata.Success) { //请求成功
							var jsondata = adata.Value;
							if (jsondata.SceneID == undefined) {
								jsondata.SceneID = _data.SceneID;
							}
							DataServ.BaseUpdate("tb_Scenes", ['SceneID', 'SendStatus'], [jsondata.SceneID, '1'], "SceneID=?", _data.SceneID).then(function(res) {
								ReInitAddSceneData();
							})
						} else {
							DataServ.BaseDelete("tb_Scenes", 'SceneID=?', [_data.SceneID]).then(function(res) {

								})
								//NotificationAlert("服务器添加现场错误：" + adata.Message, "错误提示"); //输出请求错误信息
						}
					});
					_data.Address = _data.Address + "," + _data.LongAndLat;
					callback();
					//写入本地数据库
					//PushAddNoSendScene(_data);
				}
			}

			//组装数据
			function AssemblePostData(status, name) {
				var _sendData = {
					SceneID: '',
					ProjectID: $rootScope.projectId,
					ParentID: '',
					SceneName: name,
					Address: serverdata.address, //现场地址
					BeginDate: '',
					EndDate: '',
					SceneType: '',
					SceneWorker: '',
					SceneState: '',
					SendStatus: status,
					HasData: 'false',
					EnterpriseID: $rootScope.userInfo.EnterpriseID,
					Token: $rootScope.userInfo.Token,
					LongAndLat: currentPosition //坐标
				}
				if (serverdata.modaltype == 0) {
					_sendData.SceneID = CommFun.NewGuid();
					var _str = $("#id_parent").find("option:selected").val();
					var _arr = _str.split("|");
					if (_arr.length >= 2) {
						_sendData.ProjectID = _arr[0];
						_sendData.ParentID = _arr[1];
					}

				} else {
					_sendData.SceneID = serverdata.currentScene.SceneID;
					_sendData.ProjectID = serverdata.currentScene.ProjectID;
					_sendData.ParentID = serverdata.currentScene.ParentID;
				}
				if (_sendData.ProjectID == "" || _sendData.ParentID == "") {
					CommFun.ShowAlert("错误提示", "请选择项目或现场");
					return null;
				}
				if (serverdata.sceneTypeSelect && serverdata.sceneTypeSelect.length > 0) {
					var len = serverdata.sceneTypeSelect.length
					var arr = new Array();
					for (var i = 0; i < len; i++) {
						arr.push(serverdata.sceneTypeSelect[i].id);
					}
					_sendData.SceneType = arr.join("|"); //现场类型
				} else {
					CommFun.ShowAlert("错误提示", "请选择现场类型");
					return null;
				}
				_sendData.SceneState = $("#id_status").find("option:selected").val(); //现场状态
				_sendData.BeginDate = $("#id_beginDate").val(); //开始时间
				if (!_sendData.BeginDate || _sendData.BeginDate == "") {
					CommFun.ShowAlert("错误提示", "请选择开始时间");
					return null;
				}
				_sendData.EndDate = $("#id_endDate").val();; //结束时间
				if (!_sendData.EndDate || _sendData.EndDate == "") {
					CommFun.ShowAlert("错误提示", "请选择结束时间");
					return null;
				}
				var _serworker = new Array(); //工作人员UserID
				//遍历所有选择列表
				if (serverdata.roleslist) {
					var len = serverdata.roleslist.length;
					for (var i = 0; i < len; i++) {
						var _data = {
							roleId: serverdata.roleslist[i].RoleID,
							UserID: new Array()
						}
						if (serverdata.roleslist[i].Select) {
							var length = serverdata.roleslist[i].Select.length;
							for (var j = 0; j < length; j++) {
								_data.UserID.push(serverdata.roleslist[i].Select[j].id)
							}
						}
						_serworker.push(_data);
					}
				}
				_sendData.SceneWorker = JSON.stringify(_serworker);

				if (_sendData.SceneName == "") {
					CommFun.ShowAlert("错误提示", "现场名为空");
					return null;
				}

				if (_sendData.Address == "") {
					CommFun.ShowAlert("错误提示", "未获取到现场地址");
					return null;
				}
				if (_sendData.SceneType == "" || _sendData.SceneType == null) {
					CommFun.ShowAlert("错误提示", "请选择现场类型");
					return;
				}
				//alert(JSON.stringify(_sendData))
				return _sendData;
			};

			function InitUpdateModal(index) {
				serverdata.currentScene = serverdata.currentlist[index];
				CommFun.RefreshData(serverdata);
			}
			function Destory(){
			}
		}
	])