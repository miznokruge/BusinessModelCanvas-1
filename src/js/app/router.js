define(['jquery', 'app/callback', 'app/utils', 'app/config'], function($, Callback, Utils, Config) {

	var _routes = {};
	var _config = {};

	$(window).on('popstate', function(e) {
		Router.run(e);
	});

	$(document).on('click', 'a', function(e) {

		var $$ = $(this);
		var href = $$.attr('href');

		if(Utils.isInternalURL(href)) {
			e.preventDefault();
			history.pushState(null, null, href);
			Router.run();
			return false;
		}

	});

	var Router = {

		END: 1,
		FALLBACK: 2,

		set: function(prop, value) {

			if(typeof prop == 'object') {
				for(var property in prop) {
					_config[property] = prop[property];
				}
			} else {
				_config[prop] = value;
			}

			return this;

		},

		get: function(prop) {
			return _config[prop] || null;
		},

		go: function(url, state) {

			if(url.indexOf('/') === 0) {
				var baseUrl = Config.baseUrl || '';
				url = baseUrl + url;
			}

			history.pushState(state, null, url);
			this.run();
			return this;

		},

		add: function(route, handler) {

			if(typeof _routes[route] == 'undefined') {

				_routes[route] = [];
				_routes[route].push(handler);

			} else {

				_routes[route].push(handler);

			}

			return this;

		},

		match: function(url, search) {

			if(!(search instanceof RegExp)) {
				search = '^' + search + '$';
			}

			search = new RegExp(search);

			return url.match(search);

		},

		run: function() {

			var url = location.pathname;
			var baseUrl = Config.baseUrl || '';

			if(url.indexOf(baseUrl) === 0) {
				url = url.substr(baseUrl.length);
			}

			if(typeof _routes != 'undefined') {

				for(var route in _routes) {

					var match = this.match(url, route);

					if(match != null) {
console.log(route, match);
						//var matching = match.splice(0,1);
						var matching = match.slice(1);

						if(_routes[route] instanceof Array) {

							_routes[route].every(function(handler) {

								var retVal = handler.apply(handler.prototype, matching);

								if(retVal === Router.END) {
									return false;
								}

								return true;

							});

						}

					}

				}

			}

		}

	};

	return Router;

});