// Anonymous function with namespace.
C_Repeater = (function () {

    // Private methods and properties.

    const _params = {};

    /**
     * Assign the _updatePagination function to the pagination elements on the click event.
     *
     * @return  void
    */
    function _assignPaginationElements() {
        // Get all the link elements related to pagination.
        let elements = document.getElementsByClassName(_params.itemType+'-CPagination');

        for (let i = 0; i < elements.length; ++i) {
            elements[i].addEventListener('click', function() {
                // Here 'this' refers to the element.
                let pageNb = this.dataset.pageNb;
                _updatePagination(pageNb);
            }, true);
        }
        
    }

    /**
     * Assign the _reverseOrder function to the ordering elements on the click event.
     *
     * @param   integer   idNb  The item id number.
     *
     * @return  void
    */
    function _assignOrderingElements(idNb) {
        let directions = ['up', 'down'];

        for (let i = 0; i < directions.length; ++i){
            // Assign the _reverseOrder function to the newly created up and down elements.
            document.getElementById(_params.itemType+'-'+directions[i]+'-ordering-'+idNb).addEventListener('click', function() {
                _reverseOrder(directions[i], idNb);
            }, true);
        }
    }

    /**
     * Defines the items to display according to the given page number and the pagination parameters.
     *
     * @param   integer   activePageNb   The page to display in the item list.
     *
     * @return  void
    */
    function _updatePagination(activePageNb) {
        // Updates the current page number.
        _params.currentPageNb = activePageNb;

        // Computes the total number of pages from the id list.
        _params.totalPages = Math.ceil(_params.idNbList.length / _params.nbItemsPerPage);

        _params.pagination.style.display = 'block';

        // A new item has been added to the end of the list OR the only item of the current
        // page has been deleted. In both cases the current last item page is displayed.
        if (_params.toLastPage || activePageNb > _params.totalPages) {
            _params.currentPageNb = _params.totalPages;
            // Reset the flag.
            _params.toLastPage = false;
        }

        // Loops through the item id number ordering.
        for (let i = 0; i < _params.idNbList.length; i++) {
            let pageNb = 1;

            // Computes the page number according to the number of items per page.
            if ((i + 1) > _params.nbItemsPerPage) {
                let result = (i + 1) / _params.nbItemsPerPage;
                pageNb = Math.ceil(result);
            }

            // Gets the class names of the item.
            let item = document.getElementById(_params.itemType+'-item-'+_params.idNbList[i]);
            let classes = item.className.split(' ');

            // Loops through the class names.
            for (let j = 0; j < classes.length; j++) {
                // Checks and removes the possible pagination class.
                if (classes[j].substring(0, _params.itemType.length + 20) === _params.itemType+'-pagination-inactive') {
                    item.classList.remove(classes[j]);
                }

                // Hides the items which are not part of the current page.
                if (pageNb != _params.currentPageNb) {
                    item.classList.add(_params.itemType+'-pagination-inactive');
                }
            }
        }

        // The only item of the current page has been deleted.
        if (_params.totalPages < _params.currentPageNb) {
            // Updates the current page number.
            _params.currentPageNb = _params.totalPages;
        }

        if (_params.totalPages < 2) {
            // No pagination is needed if there's just one or no page.
            _params.pagination.style.display = 'none';
            return;
        }

        _updatePaginationBrowser();
    }

    /**
     * Builds the pagination browser according to the pagination parameters.
     *
     * @return  void
     */
    function _updatePaginationBrowser() {
        let beginning = CodaliaLang.pagination.beginning;
        let previous = CodaliaLang.pagination.previous;

        // Sets the 'beginning' and 'previous' links
        if (_params.currentPageNb > 1) {
            beginning = '<a href="javascript:void(0);" class="'+_params.itemType+'-CPagination" data-page-nb="1">'+beginning+'</a>';
            let previousPage = _params.currentPageNb - 1;
            previous = '<a href="javascript:void(0);" class="'+_params.itemType+'-CPagination" data-page-nb="'+previousPage+'">'+previous+'</a>';
        }

        let browser = '<td>'+beginning+'</td><td>'+previous+'</td>';

        let next = CodaliaLang.pagination.next;
        let end = CodaliaLang.pagination.end;

        // Sets the 'next' and 'end' links
        if (_params.currentPageNb < _params.totalPages) {
            let nextPage = _params.currentPageNb + 1;
            next = '<a href="javascript:void(0);" class="'+_params.itemType+'-CPagination" data-page-nb="'+nextPage+'">'+next+'</a>';
            end = '<a href="javascript:void(0);" class="'+_params.itemType+'-CPagination" data-page-nb="'+_params.totalPages+'">'+end+'</a>';
        }

        // Sets the page links
        for (let i = 0; i < _params.totalPages; i++) {
            let pageNb = i + 1;

            if (pageNb == _params.currentPageNb) {
                browser += '<td class="current-page-number">'+pageNb+'</td>';
            }
            else {
                browser += '<td class="page-number"><a href="javascript:void(0);" class="'+_params.itemType+'-CPagination" data-page-nb="'+pageNb+'">'+pageNb+'</a></td>';
            }
        }

        browser += '<td>'+next+'</td><td>'+end+'</td>';

        // Deletes the previous table row (if any).
        if (document.getElementById(_params.itemType+'-pagination-browser').rows.length > 0) {
            document.getElementById(_params.itemType+'-pagination-browser').deleteRow(0);
        }

        // Inserts the new browsing links.
        let row = document.getElementById(_params.itemType+'-pagination-browser').insertRow(0)
        row.innerHTML = browser;

        _assignPaginationElements();
    }

    /**
     * Switches the order of 2 items in the DOM.
     *
     * @param   string  direction  The direction to go when switching (up/down).
     * @param   integer idNb       The id number of the item to switch from.
     *
     * @return  void
    */
    function _reverseOrder(direction, idNb) {
        // Loops through the item id number order.
        for (let i = 0; i < _params.idNbList.length; i++) {
            // Checks for the item which order has to be reversed.
            if (_params.idNbList[i] == idNb) {
              // Sets the item indexes according to the direction.
              let index1 = i;
              let index2 = i + 1;

              if (direction == 'up') {
                  index1 = i - 1;
                  index2 = i;
              }

              // Gets the reference item before which the other item will be inserted.
              let refItem = document.getElementById(_params.itemType+'-item-'+_params.idNbList[index1]);
              // Momentarily withdraws the other item from the DOM.
              let oldChild = _params.container.removeChild(document.getElementById(_params.itemType+'-item-'+_params.idNbList[index2]));
              // Switches the 2 items.
              _params.container.insertBefore(oldChild, refItem);
              break;
            }
        }

        _itemReordering();
        // The "odd" and "even" classes need to be reset.
        _setOddEven();
    }

    /**
     * Updates the order value of the items according to their position into the item
     * container.
     *
     * @return  void
    */
    function _itemReordering() {
        // Collects all the item divs (ie: divs with a itemtype-item class) in the container.
        let divs = _params.container.querySelectorAll('div.'+_params.itemType+'-item');
        // Empties the id number list.
        _params.idNbList = [];

        // Loops through the item divs.
        for (let i = 0; i < divs.length; i++) {
          let ordering = i + 1;
          // Extracts the id number of the item from the end of its id value and convert it into an integer.
          let idNb = parseInt(divs[i].id.replace(/.+-(\d+)$/, '$1'));
          // Updates the ordering of the id number.
          _params.idNbList.push(idNb);

          // Updates the item ordering.
          document.getElementById(_params.itemType+'-ordering-'+idNb).value = ordering;
          document.getElementById(_params.itemType+'-order-number-'+idNb).value = ordering;
          // Displays the up/down links of the item.
          document.getElementById(_params.itemType+'-up-ordering-'+idNb).style.display = 'inline';
          document.getElementById(_params.itemType+'-down-ordering-'+idNb).style.display = 'inline';
          // Resets first and last item classes.
          document.getElementById(_params.itemType+'-order-number-'+idNb).classList.remove('first-item', 'last-item');

          if (ordering == 1) {
            // The first item cannot go any higher.
            document.getElementById(_params.itemType+'-up-ordering-'+idNb).style.display = 'none';
            document.getElementById(_params.itemType+'-order-number-'+idNb).classList.add('first-item');
          }

          if (ordering == divs.length) {
            // The last item cannot go any lower.
            document.getElementById(_params.itemType+'-down-ordering-'+idNb).style.display = 'none';
            document.getElementById(_params.itemType+'-order-number-'+idNb).classList.add('last-item');
          }
        }

        // Reset the item pagination if required.
        if (_params.nbItemsPerPage !== null) {
            _updatePagination(_params.currentPageNb);
        }
    }

    /**
     * Adds the odd or even class to the items according to their position into the list.
     *
     * @return  void
    */
    function _setOddEven() {
        // Loops through the id number list.
        for (let i = 0; i < _params.idNbList.length; i++) {
            // Gets the div item.
            let item = document.getElementById(_params.itemType+'-item-'+_params.idNbList[i]);
            // First removes the current class.
            item.classList.remove(_params.itemType+'-odd');
            item.classList.remove(_params.itemType+'-even');

            // Uses the modulo operator to add the proper class.
            if ((i + 1) % 2) {
                item.classList.add(_params.itemType+'-odd');
            }
            else {
                item.classList.add(_params.itemType+'-even');
            }
        }
    }

    /**
     * The initial function that initialized the repeater.
     *
     * @param   object   params           The parameters for the repeater.
     *
     * @return  void
    */
    const _Repeater = function (params) {

        _params.itemType = params.item;
	_params.itemTypeUpperCase = _params.itemType.slice(0,1).toUpperCase() + _params.itemType.slice(1);
	_params.rowsCells = params.rowsCells;
	_params.rootLocation = params.rootLocation == undefined ? '' : params.rootLocation;
	_params.ordering = params.ordering === undefined ? false : true;
	_params.Select2 = params.Select2 === undefined ? false : true;
	// Pagination parameters.
	_params.nbItemsPerPage = params.nbItemsPerPage === undefined ? null : params.nbItemsPerPage;
	_params.totalPages = 1;
	_params.currentPageNb = 1;
	_params.toLastPage = false;

	// Initializes some utility variables
	_params.idNbList = [];
	// Used to keep each id unique during the session (ie: do not reuse the id of a deleted item).
	_params.removedIdNbs = [];

	// Creates the item container as well as the add button container.
	let attribs = {'id':_params.itemType+'-container', 'class':_params.itemType+'-container'};
	_params.container = this.createElement('div', attribs);
	attribs = {'id':_params.itemType+'-add-button-container', 'class':'add-button-container'};
	_params.addButtonContainer = this.createElement('div', attribs);

	// Adds both the div and add button containers to the DOM.
	document.getElementById(_params.itemType).appendChild(_params.container);
	document.getElementById(_params.itemType+'-container').appendChild(_params.addButtonContainer);
	// Inserts the add button.
	let button = this.createButton('add');
	_params.addButtonContainer.appendChild(button);

	// Builds the pagination area.
	if (_params.nbItemsPerPage !== null) {
	    attribs = {'id':_params.itemType+'-pagination', 'class':_params.itemType+'-pagination'};
	    _params.pagination = this.createElement('div', attribs);
	    document.getElementById(_params.itemType).appendChild(_params.pagination);

	    attribs = {'id':_params.itemType+'-pagination-browser', 'class':_params.itemType+'-pagination-browser'};
	    document.getElementById(_params.itemType+'-pagination').appendChild(this.createElement('table', attribs));
	}
    };

    // Methods
    _Repeater.prototype = {

        /**
	 * Creates an HTML element of the given type.
	 *
	 * @param   string   type        The type of the element.
	 * @param   object   attributes  The element attributes.
	 *
	 * @return  object   The HTML element.
	*/
        createElement: function (type, attributes) {
	    let element = document.createElement(type);
	    // Sets the element attributes (if any).
	    if (attributes !== undefined) {
		for (let key in attributes) {
		    // Ensures that key is not a method/function.
		    if (typeof attributes[key] !== 'function') {
			element.setAttribute(key, attributes[key]);
		    }
		}
	    }

	    return element;
        },

        /**
	 * Creates a button then binds it to a function according to the action.
	 *
	 * @param   string  action The action that the button triggers.
	 * @param   integer idNb   The item id number (for remove action).
	 * @param   string  modal  The url to the modal window (for select action).
	 *
	 * @return  object         The created button.
	*/
        createButton: function (action, idNb, modal) {
	    // Creates a basic button.
	    let label = CodaliaLang.action[action];
	    let attribs = {class: 'btn', title: label};
	    let button = this.createElement('button', attribs);
	    let classes = {add: 'btn-primary', remove: 'btn-danger', clear: 'btn'};
	    let icons = {add: 'plus-circle', remove: 'times-circle', clear: 'remove'};

	    if (action == 'add') {
		button.addEventListener('click', (e) => { e.preventDefault(); this.createItem(); } );
	    }

	    if (action == 'remove') {
		button.addEventListener('click', (e) => { e.preventDefault(); this.removeItem(idNb, true); } );
	    }

	    if (action == 'clear') {
		button.addEventListener('click', (e) => { e.preventDefault(); } );
		button.classList.add('clear-btn');
		// No label on the clear button.
		label = '';
	    }

	    button.classList.add(classes[action]);
	    button.innerHTML = '<span class="icon-'+icons[action]+' icon-white"></span> '+label;

	    return button;
	},

        /**
	 * Creates a basic item of the given type. A callback function (named after the item type) is called afterward.
	 *
	 * @param   object  data   The data to set the item to.
	 *
	 * @return  void
	*/
        createItem: function (data) {
	    // Sets the id number for the item.
	    let idNb = null;

	    if (data !== undefined && data.id_nb !== undefined) {
		// Uses the given id number.
		idNb = data.id_nb;
	    }
	    else {
		// Gets a brand new id number for the item.
		idNb = this.getNewIdNumber();
	    }

	    // Means that a new item has been created from the "Add" button.
	    if (data === undefined) {
		// Displays the last page to show the newly created item. (used for pagination).
		_params.toLastPage = true;
	    }

	    // Creates the item div then its inner structure.
	    let attribs = {id: _params.itemType+'-item-'+idNb, class: _params.itemType+'-item'};
	    let item = this.createElement('div', attribs);
	    _params.container.appendChild(item);
	    this.createItemStructure(item, idNb);

	    if (_params.ordering) {
		// N.B:  No need to add the new item id number to the list as it is updated
		//       in the _itemReordering function. The item pagination is reset as well.
		this.setItemOrdering(idNb);
	    }
	    else {
		// Adds the new item id number to the list.
		_params.idNbList.push(idNb);

		// Reset the item pagination if needed.
		if (_params.nbItemsPerPage !== null) {
		    _updatePagination(_params.currentPageNb);
		}
	    }

	    _setOddEven();

	    // Concatenates the callback function name.
	    let callback = 'populate'+_params.itemTypeUpperCase+'Item';
	    // Calls the callback function to add the specific elements to the item.
	    window[callback](idNb, data);
	},

        /**
	 * Removes the item corresponding to the given id number.
	 *
	 * @param   string   idNb     The id number of the item to remove.
	 * @param   string   warning  If true a confirmation window is shown before deletion.
	 *
	 * @return  void
	*/
        removeItem: function (idNb, warning) {

	    if (warning) {
	      // Asks the user to confirm deletion.
	      if (confirm(CodaliaLang.message.warning_remove_dynamic_item) === false) {
		  return;
	      }
	    }

	    // Calls a callback function to execute possible tasks before the item deletion.
	    // N.B: Check first that the function has been defined. 
	    if (typeof window['beforeRemoveItem'] === 'function') {
	        window['beforeRemoveItem'](idNb, _params.itemType);
	    }

	    // Removes the item from its div id.
	    _params.container.removeChild(document.getElementById(_params.itemType+'-item-'+idNb));
	    // Stores the removed id number.
	    _params.removedIdNbs.push(idNb);

	    if (_params.ordering) {
		// N.B:  No need to remove the item id number from the list as it is updated
		//       in the _itemReordering function. The item pagination is reset as well.
		_itemReordering();
	    }
	    else {
		// Removes the item id number from the list.
		for (let i = 0; i < _params.idNbList.length; i++) {
		    if (_params.idNbList[i] == idNb) {
		        _params.idNbList.splice(i, 1);
		    }
		}

		// Reset the item pagination if required.
		if (_params.nbItemsPerPage !== null) {
		    _updatePagination(_params.currentPageNb);
		}
	    }

	    _setOddEven();

	    // Calls a callback function to execute possible tasks after the item deletion.
	    // N.B: Check first that the function has been defined. 
	    if (typeof window['afterRemoveItem'] === 'function') {
		window['afterRemoveItem'](idNb, _params.itemType);
	    }
	},

        /**
	 * Creates the inner structure of the item (ie: a set of divs structured in rows and
	 * cells). A Remove button is added in the last cell of the first row.
	 *
	 * @param   object  item   The item.
	 * @param   integer idNb   The item id number.
	 *
	 * @return  void
	*/
        createItemStructure: function (item, idNb) {
	    // N.B:  row number = the rowsCells array indexes.
	    //       cell number = the rowsCells array values.
	    for(let i = 0; i < _params.rowsCells.length; i++) {
		let rowNb = i + 1;
		let cellNb = 0;

		for (let j = 0; j < _params.rowsCells[i]; j++) {
		    cellNb = j + 1;
		    let attribs = {
			id: _params.itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb, 
			class: _params.itemType+'-cells-row-'+rowNb+' '+_params.itemType+'-cell-'+cellNb+'-row-'+rowNb
		    };

		    item.appendChild(this.createElement('div', attribs));
		}

		// Adds a button which removes the item.
		if (rowNb == 1) {
		    // Creates first an empty label.
		    let attribs = {class: 'item-space', id: _params.itemType+'-delete-label-'+idNb};
		    document.getElementById(_params.itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb).appendChild(this.createElement('span', attribs));
		    document.getElementById(_params.itemType+'-delete-label-'+idNb).innerHTML = '&nbsp;';
		    // Then adds the button.
		    document.getElementById(_params.itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb).appendChild(this.createButton('remove', idNb));
		}

		// Adds a separator for multiple row structures.
		if (rowNb < _params.rowsCells.length) {
		    item.appendChild(this.createElement('span', {class: _params.itemType+'-row-separator'}));
		}
	    }
	},

        /**
	 * Computes a new item id number according to the item divs which are already in the
	 * container as well as those recently removed.
	 *
	 * @return  integer   The new id number.
	*/
        getNewIdNumber: function () {
	    let newIdNb = 0;
	    // Loops through the id number list.
	    for (let i = 0; i < _params.idNbList.length; i++) {
		// If the item id number is greater than the new one, we use it.
		if (_params.idNbList[i] > newIdNb) {
		    newIdNb = _params.idNbList[i];
		}
	    }

	    // Checks against the recently removed items.
	    for (let i = 0; i < _params.removedIdNbs.length; i++) {
		if (_params.removedIdNbs[i] > newIdNb) {
		    newIdNb = _params.removedIdNbs[i];
		}
	    }

	    // Returns a valid id number (ie: the highest id number in the container plus 1).
	    return newIdNb + 1;
	},

        /**
	 * Inserts an ordering functionality in the given item. This functionality allows the
	 * item to go up or down into the item list.
	 *
	 * @param   integer idNb   The id number of the item.
	 *
	 * @return  void
	*/
        setItemOrdering: function (idNb) {
	    // The ordering tags are always inserted in the penultimate cell of the first row.
	    let row = 1;
	    let cell = _params.rowsCells[0] - 1;

	    // Creates first an empty label.
	    let attribs = {class: 'item-space', id: _params.itemType+'-ordering-label-'+idNb};
	    document.getElementById(_params.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('span', attribs));
	    document.getElementById(_params.itemType+'-ordering-label-'+idNb).innerHTML = '&nbsp;';

	    // Creates a ordering container.
	    attribs = {class: 'ordering-div', id: _params.itemType+'-ordering-div-'+idNb};
	    document.getElementById(_params.itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('div', attribs));

	    // Creates the element in which the item ordering number is stored.
	    attribs = {type: 'hidden', name: _params.itemType+'_ordering_'+idNb, id: _params.itemType+'-ordering-'+idNb};
	    document.getElementById(_params.itemType+'-ordering-div-'+idNb).appendChild(this.createElement('input', attribs));

	    // Creates the link allowing the item to go down the item ordering.
	    attribs = {
	        href: 'javascript:void(0);', 
		id: _params.itemType+'-down-ordering-'+idNb, 
		class: 'down-ordering'
	    };

	    let link = this.createElement('a', attribs);

	    attribs = {
	        src: _params.rootLocation+'images/arrow_down.png', 
	        title: 'arrow down', 
	        height: 16, 
	        width: 16
	    };

	    link.appendChild(this.createElement('img', attribs));
	    document.getElementById(_params.itemType+'-ordering-div-'+idNb).appendChild(link);

	    // Creates fake element to display the order number.
	    attribs = {type: 'text', disabled: 'disabled', id: _params.itemType+'-order-number-'+idNb, class: _params.itemType+'-order-number'};
	    document.getElementById(_params.itemType+'-ordering-div-'+idNb).appendChild(this.createElement('input', attribs));

	    // Creates the link allowing the item to go up the item ordering.
	    attribs = {
	        href: 'javascript:void(0);', 
	        id: _params.itemType+'-up-ordering-'+idNb, 
	        class: 'up-ordering'
	    };

	    link = this.createElement('a', attribs);
	    attribs = {
	        src: _params.rootLocation+'images/arrow_up.png', 
	        title: 'arrow up', 'height':16, 
	        width: 16
	    };

	    link.appendChild(this.createElement('img', attribs));
	    document.getElementById(_params.itemType+'-ordering-div-'+idNb).appendChild(link);

	    _assignOrderingElements(idNb);

	    _itemReordering();
	},

        /**
	 * Checks the item field values.
	 *
	 * @param   object  fields       The name of the fields to check (ie: the mandatory fields). The field names are stored in the
	 *                               object keys (eg 'firstname':'', 'lastname':'', ...).
	 *                               Optional: A value type to check can be set in the value (eg: 'age':'int')
	 * @param   object  extraType    A specific type to check. Object structure: {'type name':'regex to use'}
	 *
	 * @return  boolean              True if all fields are ok, else otherwise.
	*/
        validateFields: function (fields, extraType) {
	    // Loops through the item id numbers.
	    for (let i = 0; i < _params.idNbList.length; i++) {
		// Computes the current page.
		let pageNb = Math.ceil((i + 1) / _params.nbItemsPerPage);

		// Checks the given fields for each item.
		for (let key in fields) {
		    let field = document.getElementById(_params.itemType+'-'+key+'-'+_params.idNbList[i]);

		    if (field.hasAttribute('disabled')) {
			// Skips the disabled fields as their values are not taken in account when
			// sending the form.
			continue;
		     }

		     // Checks the select tags when the Select2 plugin is used.
		     let Select2 = null;
		     if (_params.Select2 && (field.type == 'select-one' || field.type == 'select-multiple')) {
			 // Gets the Select2 span.
			 Select2 = field.nextElementSibling;
		     }

		     // In case the field was previously not valid.
		     field.classList.remove('mandatory');

		     if (Select2 !== null) {
			 Select2.classList.remove('mandatory');
		     }

		     // Removes possible whitespace from both sides of the string.
		     let value = field.value.trim();

		     // Checks for empty fields.
		     if (field.value == '') {
			 field.classList.add('mandatory');

			 if (Select2 !== null) {
			     Select2.classList.add('mandatory');
			 }

			 if (_params.nbItemsPerPage !== null) {
			     // Shows the corresponding page.
			     _updatePagination(pageNb);
			 }

			 alert(CodaliaLang.message.alert_mandatory_field+': '+document.getElementById(_params.itemType+'-'+key+'-label-'+_params.idNbList[i]).innerHTML);

			 return false;
		     }

		     // Checks the value type.
		     if (fields[key] !== '' && !this.checkValueType(field.value, fields[key], extraType)) {
			 field.classList.add('mandatory');

			 if (Select2 !== null) {
			     Select2.classList.add('mandatory');
			 }

			 if (_params.nbItemsPerPage !== null) {
			     // Shows the corresponding page.
			     _updatePagination(pageNb);
			 }

			 alert(CodaliaLang.message.alert_value_type_not_valid);

			 return false;
		    }
	        }
            }

	    return true;
	},

        /**
	 * Checks the type of the given value.
	 *
	 * @param   string  value      The value to check.
	 * @param   string  valueType  The type to check the value against.
	 * @param   object  extraType  A specific type to check. Object structure: {'type name':'regex to use'}
	 *
	 * @return  boolean            True if the value matches the type, false otherwise.
	*/
	checkValueType(value, valueType, extraType) {
	  let regex = '';
	  // Checks first for extra type.
	  if (extraType !== undefined && valueType == extraType.valueType) {
	      regex = extraType.regex;
	      return regex.test(value);
	  }

	  switch(valueType) {
	      case 'string':
		  regex = /^.+$/;
		  break;

	      case 'int':
		  regex = /^-?[0-9]+$/;
		  break;

	      case 'unsigned_int':
		  regex = /^[0-9]+$/;
		  break;

	      case 'float':
		  regex = /^-?[0-9]+(\.[0-9]+)?$/;
		  break;

	      case 'unsigned_float':
		  regex = /^[0-9]+(\.[0-9]+)?$/;
		  break;

	      case 'snake_case':
		  regex = /^[a-z0-9\_]+$/;
		  break;

	      case 'slug':
		  regex = /^[a-z0-9\-]+$/;
		  break;

	      default: // Unknown type.

	      return false;
	  }

	  return regex.test(value);
	},

        /**
	 * Checks if the given value is present into the given array.
	 *
	 * @param   string  needle     The value to search.
	 * @param   array   haystack   The array in which the given value is searched.
	 *
	 * @return  boolean            True if the value matches the type, false otherwise.
	*/
        inArray: function (needle, haystack) {
	    let length = haystack.length;

	    for (let i = 0; i < length; i++) {
		if (haystack[i] == needle) {
		    return true;
		}
	    }

	    return false;
	},

        /**
	 * Creates a date and time fields into a given location.
	 *
	 * @param   string    name  The name of the date time field.
	 * @param   integer   idNb  The item id number.
	 * @param   string    rowCellId The location where the date time field is created.
	 * @param   string    value  The datetime value.
	 * @param   boolean   time  If true, displays the time field.
	 *
	 * @return  void
	*/
        createDateTimeFields: function (name, idNb, rowCellId, value, time) {
	    let attribs = {class: 'field-datepicker row', 'data-control': 'datepicker', 'data-mode': 'datetime', id: 'datepicker-'+name+'-'+idNb};
	    document.getElementById(rowCellId).appendChild(this.createElement('div', attribs));

	    attribs = {class: 'input-with-icon right-align datetime-field', id: 'div-date-'+name+'-'+idNb};
	    document.getElementById('datepicker-'+name+'-'+idNb).appendChild(this.createElement('div', attribs));

	    attribs = {class: 'icon icon-calendar-o'};
	    document.getElementById('div-date-'+name+'-'+idNb).appendChild(this.createElement('i', attribs));

	    attribs = {type: 'text', id: _params.itemType+'-date-'+name+'-'+idNb, class: 'form-control', autocomplete: 'off', 'data-datepicker':''};
	    document.getElementById('div-date-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));

	    if (time) {
		attribs = {class: 'input-with-icon right-align datetime-field', id: 'div-time-'+name+'-'+idNb};
		document.getElementById('datepicker-'+name+'-'+idNb).appendChild(this.createElement('div', attribs));

		attribs = {class: 'icon icon-clock-o'};
		document.getElementById('div-time-'+name+'-'+idNb).appendChild(this.createElement('i', attribs));

		attribs = {type: 'text', id: _params.itemType+'-time-'+name+'-'+idNb, class: 'form-control', autocomplete: 'off', 'data-timepicker':''};
		document.getElementById('div-time-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));
	    }

	    if (value == null) {
		value = '';
	    }

	    attribs = {type: 'hidden', name: _params.itemType+'_'+name+'_'+idNb, id: 'publication-'+name+'-'+idNb, value: value, 'data-datetime-value':''};
	    document.getElementById('datepicker-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));

	    document.getElementById('[data-control="datepicker"]').datePicker();
	}
    };

    return {
        init: _Repeater
    };

})();
