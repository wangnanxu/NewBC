// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('BC', ['ionic','ngCordova','CommModule', 'LoginModule', 'MessageModule', 'ProjectModule', 'SceneModule', 'MaterialModule', 'AccountModule'])

.run(function($ionicPlatform,SqliteServ,CommFun) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		//创建数据库
		SqliteServ.createDB();
		//本地创建文件夹
		CommFun.CreateDir();
	});
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.platform.ios.tabs.style('standard');
	$ionicConfigProvider.platform.ios.tabs.position('bottom');
	$ionicConfigProvider.platform.android.tabs.style('standard');
	$ionicConfigProvider.platform.android.tabs.position('bottom');
	$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
	$ionicConfigProvider.platform.android.navBar.alignTitle('center');
	$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
	$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
	$ionicConfigProvider.platform.ios.views.transition('ios');
	$ionicConfigProvider.platform.android.views.transition('android');
	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider
		.state('login', {
			url: '/login',
			cache: false,
			templateUrl: 'sources/login/login.html',
			controller: 'LoginCtrl'
		})
		.state('sync', {
			url: '/sync/:isSame',
			cache: false,
			templateUrl: 'sources/login/sync.html',
			controller: 'SyncCtrl'
		})
		.state('scene', {
			url: '/scene/:projectID/:manager/:sceneID',
			cache: false,
			templateUrl: 'sources/scene/scene.html',
			controller: 'SceneCtrl'
		})
		.state('sceneItem', {
			url: '/sceneItem/:sceneID/:state',
			cache: false,
			templateUrl: 'sources/scene/item/sceneItem.html',
			controller: 'SceneItemCtrl'
		})
		// setup an abstract state for the tabs directive
		.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: 'sources/comm/page/tabs.html'
		})
	// Each tab has its own nav history stack:
	.state('tab.message', {
		url: '/message/:IsPost',
		cache: false,
		views: {
			'tab-message': {
				templateUrl: 'sources/message/message.html',
				controller: 'MessageCtrl'
			}
		}
	})

	.state('tab.project', {
			url: '/project',
			cache: false,
			views: {
				'tab-project': {
					templateUrl: 'sources/project/project.html',
					controller: 'ProjectCtrl'
				}
			}
		})
		.state('tab.material', {
			url: '/material',
			cache: false,
			views: {
				'tab-material': {
					templateUrl: 'sources/material/material.html',
					controller: 'MaterialCtrl'
				}
			}
		})

	.state('tab.account', {
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'sources/account/account.html',
				controller: 'AccountCtrl'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');

});