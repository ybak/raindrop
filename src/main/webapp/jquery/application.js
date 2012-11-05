$(function () {
	  $(document).ready(function() {
	        Highcharts.setOptions({
	            global: {
	                useUTC: false
	            }
	        });
	    
	        new Highcharts.Chart({
	            chart: {
	                renderTo: 'container',
	            type: 'spline',
	            marginRight: 10,
	            events: {
	                load: addServerPushListener
	            }
	        },
	        title: {
	            text: 'Live random data'
	        },
	        xAxis: {
	            type: 'datetime',
	            tickPixelInterval: 150
	        },
	        yAxis: {
	            title: {
	                text: 'Value'
	            },
	            plotLines: [{
	                value: 0,
	                width: 1,
	                color: '#808080'
	            }]
	        },
	        tooltip: {
	            formatter: function() {
	                    return '<b>'+ this.series.name +'</b><br/>'+
	                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
	                    Highcharts.numberFormat(this.y, 2);
	            }
	        },
	        legend: {
	            enabled: false
	        },
	        exporting: {
	            enabled: false
	        },
	        series: [{
	            name: 'Random data',
	            data: (function() {
	                // generate an array of random data
	                var data = [],
	                    time = (new Date()).getTime(),
	                    i;
	
	                for (i = -19; i <= 0; i++) {
	                    data.push({
	                        x: time + i * 1000,
	                        y: Math.random()
	                    });
	                }
	                return data;
	            })()
	        }]
	    });
	
	    function addServerPushListener() {
	    	var series = this.series[0];

		    var content = $('#content');
		    var socket = $.atmosphere;
		    var request = { url: document.location.toString() + 'meteor',
		                    contentType : "application/json",
		                    logLevel : 'debug',
		                    transport : 'websocket' ,
		                    fallbackTransport: 'long-polling' ,
		                	maxRequest: 600000	};
		
		
		    request.onOpen = function(response) {
		        content.html($('<p>', { text: 'Atmosphere connected using ' + response.transport }));
		    };
		
		    request.onMessage = function (response) {
		        var message = response.responseBody;
		        try {
		            var json = jQuery.parseJSON(message);
		            var x = (new Date()).getTime(), // current time
		            y = json.text;
		            series.addPoint([x, y], true, true);
		        } catch (e) {
		            console.log('This doesn\'t look like a valid JSON: ', message.data);
		            return;
		        }
		    };
		
		    request.onError = function(response) {
		        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
		            + 'socket or the server is down' }));
		    };
		
		    request.onClose = function(response) {
		        logged = false;
		    };
		
		    socket.subscribe(request);
	    }
    });
});

