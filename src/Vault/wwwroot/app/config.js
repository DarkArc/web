angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, $uibTooltipProvider, toastrConfig) {
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (config, appSettings, tokenService) {
            if (config.url.indexOf(appSettings.apiUri) === 0) {
                return tokenService.getToken();
            }
        };

        angular.extend(toastrConfig, {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            target: '.toast-target'
        });

        $uibTooltipProvider.options({
            popupDelay: 600
        });

        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get.Pragma = 'no-cache';

        $httpProvider.interceptors.push('apiInterceptor');
        $httpProvider.interceptors.push('jwtInterceptor');

        $urlRouterProvider.otherwise('/');

        $stateProvider
        // Backend
            .state('backend', {
                templateUrl: 'app/views/backendLayout.html',
                abstract: true,
                data: {
                    authorize: true
                }
            })
            .state('backend.vault', {
                url: '^/',
                templateUrl: 'app/vault/views/vault.html',
                controller: 'vaultController',
                data: { pageTitle: 'My Vault' }
            })
            .state('backend.settings', {
                url: '^/settings',
                templateUrl: 'app/settings/views/settings.html',
                controller: 'settingsController',
                data: { pageTitle: 'Settings' }
            })
            .state('backend.tools', {
                url: '^/tools',
                templateUrl: 'app/tools/views/tools.html',
                controller: 'toolsController',
                data: { pageTitle: 'Tools' }
            })

        // Frontend
            .state('frontend', {
                templateUrl: 'app/views/frontendLayout.html',
                abstract: true,
                data: {
                    authorize: false
                }
            })
            .state('frontend.login', {
                templateUrl: 'app/accounts/views/accountsLogin.html',
                controller: 'accountsLoginController',
                data: {
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.login.info', {
                url: '^/login',
                templateUrl: 'app/accounts/views/accountsLoginInfo.html',
                data: {
                    pageTitle: 'Log In'
                }
            })
            .state('frontend.login.twoFactor', {
                url: '^/login/two-factor',
                templateUrl: 'app/accounts/views/accountsLoginTwoFactor.html',
                data: {
                    pageTitle: 'Log In (Two Factor)',
                    authorizeTwoFactor: true
                }
            })
            .state('frontend.logout', {
                url: '^/logout',
                controller: 'accountsLogoutController',
                data: {
                    authorize: true
                }
            })
            .state('frontend.passwordHint', {
                url: '^/password-hint',
                templateUrl: 'app/accounts/views/accountsPasswordHint.html',
                controller: 'accountsPasswordHintController',
                data: {
                    pageTitle: 'Master Password Hint',
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.register', {
                url: '^/register',
                templateUrl: 'app/accounts/views/accountsRegister.html',
                controller: 'accountsRegisterController',
                data: {
                    pageTitle: 'Register',
                    bodyClass: 'register-page'
                }
            })
            .state('frontend.registerFinalize', {
                controller: 'accountsRegisterFinalizeController',
                templateUrl: 'app/accounts/views/accountsRegisterFinalize.html',
                data: {
                    bodyClass: 'register-page'
                }
            })
            .state('frontend.registerFinalize.info', {
                url: '^/register/finalize',
                templateUrl: 'app/accounts/views/accountsRegisterFinalizeInfo.html',
                data: {
                    pageTitle: 'Finalize Registration'
                }
            })
            .state('frontend.registerFinalize.confirm', {
                url: '^/register/finalize/confirm',
                templateUrl: 'app/accounts/views/accountsRegisterFinalizeConfirm.html',
                data: {
                    pageTitle: 'Finalize Registration (Confirm)'
                }
            });
    })
    .run(function ($rootScope, authService, jwtHelper, tokenService, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (!toState.data || !toState.data.authorize) {
                if (authService.isAuthenticated() && !jwtHelper.isTokenExpired(tokenService.getToken())) {
                    event.preventDefault();
                    $state.go('backend.vault');
                }

                return;
            }

            if (!authService.isAuthenticated() || jwtHelper.isTokenExpired(tokenService.getToken())) {
                event.preventDefault();
                authService.logOut();
                $state.go('frontend.login.info');
            }
        });
    });