define([

	'jquery',
	'underscore',
	'backbone',
	'view/company_view',
	'geosearch',
	'geosearch_provider',
	'leaflet',

	], function($, _, Backbone, CompanyView) {

                var LocateModel = Backbone.Model.extend({
                    defaults: {
                        latlng: null
                    }
                });
                var LocateCollection = Backbone.Collection.extend({
                    model: LocateModel,
                    startLocate: function() {
                        if (navigator.geolocation) {
                            var that = this;
                            navigator.geolocation.getCurrentPosition(
                                function(option) {
                                    that.add({latlng: option});
                                },
                                function(error) {
                                    switch (error.code) {
                                        case error.TIMEOUT:
                                            alert('GPS 定位連線逾時，請手動輸入所在地');
                                            break;
                                        case error.POSITION_UNAVAILABLE:
                                            alert('無法取得 GPS 定位，請手動輸入所在地');
                                            break;
                                        case error.PERMISSION_DENIED://拒絕
                                            alert('不允許 GPS 自動定位，請手動輸入所在地');
                                            break;
                                        case error.UNKNOWN_ERROR:
                                            alert('不明的錯誤，請手動輸入所在地');
                                            break;
                                    }
                                }
                            );
                        }
                    }
                });

		var mapView = Backbone.View.extend({

			initialize: function  () {
                                // company view now depends on window.map
                                // allow it for a while
                                this.map = L.map('map', {
                                    zoomControl: false,
                                    attributionControl: false
                                });

				this.location = new LocateCollection();
				this._company_view = new CompanyView({ map: this.map });

				this.listenTo(this.location, 'add', this.userLocation)
				this.location.startLocate();

                                new L.Control.GeoSearch({
                                    provider: new L.GeoSearch.Provider.OpenStreetMap()
                                }).addTo(this.map);

                                L.tileLayer(
                                    'http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png',
                                    { maxZoom: 18, }
                                ).addTo(this.map);

				this.map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));
			},

			userLocation: function () {
				var option = this.location.pop().attributes.latlng;
				var setplace = [option.coords.latitude, option.coords.longitude];
				this.map.setView(setplace, 13);
				L.marker(setplace).addTo(this.map).bindPopup("<b>你現在在這！</b>").openPopup();
				this._company_view.addlocateCenter({center: {lat: option.coords.latitude, lng: option.coords.longitude}})
			},
		});

		return mapView;	
	})
