CAjax = (function () {

    /**
     * The initial function that initialized the AJAX request.
     *
     * @param   object   params           The parameters for the Ajax request.
     * @param   object   queryParams      The query parameters. (optional)
     * 
     * @return  void
     */
    var Ajax = function (params, queryParams) {
        // Initializes the XMLHttpRequest object.
	this._xhr = new XMLHttpRequest();

        // Set the parameters.
        this._params = {}; 
        // Checks the given parameters for the current Ajax request and modified them if needed.
        this._params.method = params.method === undefined || (params.method != 'GET' && params.method != 'POST') ? 'GET' : params.method;
        this._params.url = params.url === undefined ? window.location.href : params.url;
        this._params.dataType = params.dataType === undefined || (params.dataType != 'json' && params.dataType != 'xml' && params.dataType != 'text') ? 'text' : params.dataType;
        this._params.async = params.async === undefined ? true : params.async;
        this._params.indicateFormat = params.indicateFormat === undefined ? false : params.indicateFormat;

	// Prepares the Ajax request with the given parameters and data.

	// Sets the url and query string according to the given data.
	let url = this._params.url;
	let queryString = null;

	if (queryParams !== undefined) {
	    queryString = this._buildQueryString(queryParams);
	    // Adds the query string to the given url.
	    if (this._params.method == 'GET') {
		queryString = '?'+queryString;
		// Checks whether a query is already contained in the given url.
		let regex = /\?/;

		if (regex.test(this._params.url)) {
		    // Adds the variables after the query already existing. 
		    queryString = queryString.replace('?', '&');
		}

		url = url+queryString;
	    }
	}

	// Initializes the newly-created request.
	this._xhr.open(this._params.method, url, this._params.async);

	// Forces the MIME Type according to the given dataType.
	if (this._params.dataType == 'json') {
	    this._xhr.overrideMimeType('application/json');
	}
	else if (this._params.dataType == 'xml') {
	    this._xhr.overrideMimeType('text/xml');
	}
	else {
	    this._xhr.overrideMimeType('text/plain');
	}

	if (this._params.method == 'POST') {
	    // Send the proper header information along with the request.
	    this._xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	    this._xhr.send(queryString);
	}
	else {
	    // Always null with the GET method.
	    this._xhr.send(null);
	}
    };

    // Methods
    Ajax.prototype = {

	/**
	 * Runs the EventHandler that is called whenever the readyState attribute changes. Calls the given callback 
	 * function when the Ajax request has succeed. 
	 *
	 * @param   string   callback  The name of the callback function to call when the Ajax request has succeed.
	 * @return  void/boolean       Returns false whether the Ajax request or the JSON parsing fail. Void otherwise. 
	 */
        process: function (callback) {
	    console.log('process');
	    const xhrRef = this._xhr; // Storing reference.
	    let params = this._params; 

            xhrRef.onreadystatechange = function () {
	        // Checks for error.
		if (xhrRef.status !== 200) {
		    alert(xhrRef.status + ': ' + xhrRef.statusText);
		    return false;
		}
		else if (xhrRef.readyState === 4 && xhrRef.status === 200) {
		    // By default returns response as plain text.
		    let response = xhrRef.responseText;

		    // Formats response according to the given dataType.
		    if (params.dataType == 'json') {
		        try {
			    response = JSON.parse(xhrRef.responseText);
			}
			catch (e) {
			    alert('Parsing error: '+e);
			    return false;
			}
		    }
		    else if (params.dataType == 'xml') {
		        response = xhrRef.responseXML;
		    }
		    
		    // To get header information in debugging mode.
		    //alert(xhrRef.getAllResponseHeaders());

		    // Calls the given callback function.
		    callback(response);
	        }
            }
	},

	/**
	 * Turns the given query parameters into an encoded query string.
	 *
	 * @param   object   queryParams      The query parameters for the Ajax request.
	 * @return  string                    The query string as an encoded variable string for the Ajax request.
	*/
        _buildQueryString: function (queryParams) {
	    let queryString = '';
	    // Loops through the given queryParams object.
	    for (var key in queryParams) {
	        // Checks for arrays.
		if (Array.isArray(queryParams[key])) {
		    for (var i = 0; i < queryParams[key].length; i++) {
		        // Encodes the array values.
		        queryString += key+'='+encodeURIComponent(queryParams[key][i])+'&';
		    }
		}
		else {
		    // Encodes the query parameters values.
		    queryString += key+'='+encodeURIComponent(queryParams[key])+'&';
	        }
	    }

	    // Removes the & character from the end of the string.
	    queryString = queryString.slice(0, -1);

	    return queryString;
	}
    };

    return {
        init: Ajax
    };

})();

