projectModule
	.factory('ProjectServ', ['DataServ', '$rootScope', 'CommFun','$state',
		function(DataServ, $rootScope, CommFun,$state) {
			var CurrentProPage = 0;
			var CurrentProLength = 0;
			var pageCount = 20; //每次上拉加载条数

			var serverdata = {
				projectlist: null,
				currentlist: null
			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData,
				ShowProject: ShowProject,
				GotoScene:GotoScene,
				Destory:Destory
			}
			return server;

			function GetServerData() {
				return serverdata;
			}

			function InitData() {
				CurrentProPage = 0;
				$rootScope.FlagNewSceneItem = false;
				SelectProject();
			}

			function SelectProject() {
				if (CommFun.CheckItem($rootScope.userInfo.FunctionIDs, "Root.AppPermission.SceneManage.ViewAchievedScene")) {
					DataServ.BaseSelect("select * from tb_Projects  where tb_Projects.EnterpriseID=? order by ProjectState", [$rootScope.userInfo.EnterpriseID]).then(function(adata) {
						if (adata) {
							var _arrTrue = [];
							var _arrFalse = [];
							var _len = adata.length;
							if (CommFun.CheckItem($rootScope.userInfo.FunctionIDs, "Root.AppPermission.SceneManage.ShowAllProjects")) {
								for (var i = 0; i < _len; i++) {
									if (adata[i].Status == "true") {
										_arrTrue.push(adata[i]);
									} else {
										_arrFalse.push(adata[i]);
									}
								}

							} else {
								for (var i = 0; i < _len; i++) {
									var Departments = adata[i].Departments == "" ? [] : adata[i].Departments.split('|');
									if ((userInfo.DepartmentID && CommFun.CheckItem(Departments, $rootScope.userInfo.DepartmentID.toString()) != -1) || $rootScope.userInfo.UserID == adata[i].Creater) {
										if (adata.item(i).Status = "true") {
											_arrTrue.push(adata[i]);
										} else {
											_arrFalse.push(adata[i]);
										}
									}
								}
							}
							_arrTrue.sort(SortArr);
							_arrFalse.sort(SortArr);
							//Array.prototype.push.apply(_arrTrue, _arrFalse)
							//var _arr = _arrTrue.concat(_arrFalse);
							if (serverdata.projectlist == null) {
								serverdata.projectlist = new Array();
							}
							serverdata.projectlist=_arrTrue.concat(_arrFalse);
							ShowProject();

						}

						function SortArr(a, b) {
							var i = a.ProjectState - b.ProjectState;
							if (i == 0) {
								return 0;
							} else if (i == 2 || ((i == 1 || i == -1) && b.ProjectState == 2)) {
								return 1;
							} else {
								return -1;
							}
						};
					})
				}
			}

			function ShowProject() {
				if (serverdata.projectlist == null) {
					return;
				}
				var _length = serverdata.projectlist.length;
				CurrentProLength = _length;
				var startindex = CurrentProPage * pageCount;
				var count = 0;
				if (startindex < _length) {
					for (var i = startindex; i < _length; i++) {
						if (count >= pageCount) {
							break;
						}
						//按照用户权限、项目状态、是否有现场划分是否显示项目
						if ($rootScope.userInfo.RoleID == "11" && (adata[i].Status == "完成" || adata[i].HaveScene == false)) {
							continue;
						}
						count++;
						if (serverdata.currentlist == null) {
							serverdata.currentlist = new Array()
						}
						serverdata.currentlist.push(serverdata.projectlist[i]);

					}
					CurrentProPage++;
				}
				CommFun.RefreshData(serverdata);
			}

			function AddProjcet() {
					
			}
			function GotoScene(projectid,manager){
				DataServ.UpdateProjectSceneStatus(projectid).then(function(res){
					$state.go("scene",{
						projectID:projectid,
						manager:manager
					})
				})
			}
			function Destory(){
				serverdata.projectlist=null;
				serverdata.currentlist=null;
				CurrentProPage=0;
			}
		}
	])