CRepeater = (function () {

    const Repeater = function (props) {

        this._itemType = props.item;
	this._itemTypeUpperCase = this._itemType.slice(0,1).toUpperCase() + this._itemType.slice(1);
	this._rowsCells = props.rowsCells;
	this._rootLocation = props.rootLocation == undefined ? '' : props.rootLocation;
	this._ordering = props.ordering === undefined ? false : true;
	this._Select2 = props.Select2 === undefined ? false : true;
	// Pagination parameters.
	this._nbItemsPerPage = props.nbItemsPerPage === undefined ? null : props.nbItemsPerPage;
	this._totalPages = 1;
	this._currentPageNb = 1;
	this._toLastPage = false;

	// Initializes some utility variables
	this._idNbList = [];
	// Used to keep each id unique during the session (ie: do not reuse the id of a deleted item).
	this._removedIdNbs = [];

	// Creates the item container as well as the add button container.
	let attribs = {'id':this._itemType+'-container', 'class':this._itemType+'-container'};
	this._container = this.createElement('div', attribs);
	attribs = {'id':this._itemType+'-add-button-container', 'class':'add-button-container'};
	this._addButtonContainer = this.createElement('div', attribs);

	// Adds both the div and add button containers to the DOM.
	document.getElementById(this._itemType).appendChild(this._container);
	document.getElementById(this._itemType+'-container').appendChild(this._addButtonContainer);
	// Inserts the add button.
	let button = this.createButton('add');
	this._addButtonContainer.appendChild(button);

	// Builds the pagination area.
	if (this._nbItemsPerPage !== null) {
	    attribs = {'id':this._itemType+'-pagination', 'class':this._itemType+'-pagination'};
	    this._pagination = this.createElement('div', attribs);
	    document.getElementById(this._itemType).appendChild(this._pagination);

	    attribs = {'id':this._itemType+'-pagination-browser', 'class':this._itemType+'-pagination-browser'};
	    document.getElementById(this._itemType+'-pagination').appendChild(this.createElement('table', attribs));
	}
    };

    // Methods
    Repeater.prototype = {

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
		this._toLastPage = true;
	    }

	    // Creates the item div then its inner structure.
	    let attribs = {id: this._itemType+'-item-'+idNb, class: this._itemType+'-item'};
	    let item = this.createElement('div', attribs);
	    this._container.appendChild(item);
	    this.createItemStructure(item, idNb);

	    if (this._ordering) {
		// N.B:  No need to add the new item id number to the list as it is updated
		//       in the itemReordering function. The item pagination is reset as well.
		this.setItemOrdering(idNb);
	    }
	    else {
		// Adds the new item id number to the list.
		this._idNbList.push(idNb);

		// Reset the item pagination if needed.
		if (this._nbItemsPerPage !== null) {
		    this.updatePagination(this._currentPageNb);
		}
	    }

	    this.setOddEven();

	    // Concatenates the callback function name.
	    let callback = 'populate'+this._itemTypeUpperCase+'Item';
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
	        window['beforeRemoveItem'](idNb, this._itemType);
	    }

	    // Removes the item from its div id.
	    this._container.removeChild(document.getElementById(this._itemType+'-item-'+idNb));
	    // Stores the removed id number.
	    this._removedIdNbs.push(idNb);

	    if (this._ordering) {
		// N.B:  No need to remove the item id number from the list as it is updated
		//       in the itemReordering function. The item pagination is reset as well.
		this.itemReordering();
	    }
	    else {
		// Removes the item id number from the list.
		for (let i = 0; i < this._idNbList.length; i++) {
		    if (this._idNbList[i] == idNb) {
		        this._idNbList.splice(i, 1);
		    }
		}

		// Reset the item pagination if required.
		if (this._nbItemsPerPage !== null) {
		    this.updatePagination(this._currentPageNb);
		}
	    }

	    this.setOddEven();

	    // Calls a callback function to execute possible tasks after the item deletion.
	    // N.B: Check first that the function has been defined. 
	    if (typeof window['afterRemoveItem'] === 'function') {
		window['afterRemoveItem'](idNb, this._itemType);
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
	    for(let i = 0; i < this._rowsCells.length; i++) {
		let rowNb = i + 1;
		let cellNb = 0;

		for (let j = 0; j < this._rowsCells[i]; j++) {
		    cellNb = j + 1;
		    let attribs = {
			id: this._itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb, 
			class: this._itemType+'-cells-row-'+rowNb+' '+this._itemType+'-cell-'+cellNb+'-row-'+rowNb
		    };

		    item.appendChild(this.createElement('div', attribs));
		}

		// Adds a button which removes the item.
		if (rowNb == 1) {
		    // Creates first an empty label.
		    let attribs = {class: 'item-space', id: this._itemType+'-delete-label-'+idNb};
		    document.getElementById(this._itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb).appendChild(this.createElement('span', attribs));
		    document.getElementById(this._itemType+'-delete-label-'+idNb).innerHTML = '&nbsp;';
		    // Then adds the button.
		    document.getElementById(this._itemType+'-row-'+rowNb+'-cell-'+cellNb+'-'+idNb).appendChild(this.createButton('remove', idNb));
		}

		// Adds a separator for multiple row structures.
		if (rowNb < this._rowsCells.length) {
		    item.appendChild(this.createElement('span', {class: this._itemType+'-row-separator'}));
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
	    for (let i = 0; i < this._idNbList.length; i++) {
		// If the item id number is greater than the new one, we use it.
		if (this._idNbList[i] > newIdNb) {
		    newIdNb = this._idNbList[i];
		}
	    }

	    // Checks against the recently removed items.
	    for (let i = 0; i < this._removedIdNbs.length; i++) {
		if (this._removedIdNbs[i] > newIdNb) {
		    newIdNb = this._removedIdNbs[i];
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
	    let cell = this._rowsCells[0] - 1;

	    // Creates first an empty label.
	    let attribs = {class: 'item-space', id: this._itemType+'-ordering-label-'+idNb};
	    document.getElementById(this._itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('span', attribs));
	    document.getElementById(this._itemType+'-ordering-label-'+idNb).innerHTML = '&nbsp;';

	    // Creates a ordering container.
	    attribs = {class: 'ordering-div', id: this._itemType+'-ordering-div-'+idNb};
	    document.getElementById(this._itemType+'-row-'+row+'-cell-'+cell+'-'+idNb).appendChild(this.createElement('div', attribs));

	    // Creates the element in which the item ordering number is stored.
	    attribs = {type: 'hidden', name: this._itemType+'_ordering_'+idNb, id: this._itemType+'-ordering-'+idNb};
	    document.getElementById(this._itemType+'-ordering-div-'+idNb).appendChild(this.createElement('input', attribs));

	    // Creates the link allowing the item to go down the item ordering.
	    attribs = {
	        href: 'javascript:void(0);', 
		id: this._itemType+'-down-ordering-'+idNb, 
		class: 'down-ordering'
	    };

	    let link = this.createElement('a', attribs);

	    attribs = {
	        src: this._rootLocation+'images/arrow_down.png', 
	        title: 'arrow down', 
	        height: 16, 
	        width: 16
	    };

	    link.appendChild(this.createElement('img', attribs));
	    document.getElementById(this._itemType+'-ordering-div-'+idNb).appendChild(link);

	    // Creates fake element to display the order number.
	    attribs = {type: 'text', disabled: 'disabled', id: this._itemType+'-order-number-'+idNb, class: this._itemType+'-order-number'};
	    document.getElementById(this._itemType+'-ordering-div-'+idNb).appendChild(this.createElement('input', attribs));

	    // Creates the link allowing the item to go up the item ordering.
	    attribs = {
	        href: 'javascript:void(0);', 
	        id: this._itemType+'-up-ordering-'+idNb, 
	        class: 'up-ordering'
	    };

	    link = this.createElement('a', attribs);
	    attribs = {
	        src: this._rootLocation+'images/arrow_up.png', 
	        title: 'arrow up', 'height':16, 
	        width: 16
	    };

	    link.appendChild(this.createElement('img', attribs));
	    document.getElementById(this._itemType+'-ordering-div-'+idNb).appendChild(link);

	    this._assignOrderingElements(idNb);

	    this.itemReordering();
	},

        /**
	 * Updates the order value of the items according to their position into the item
	 * container.
	 *
	 * @return  void
	*/
        itemReordering: function () {
	    // Collects all the item divs (ie: divs with a itemtype-item class) in the container.
	    let divs = this._container.querySelectorAll('div.'+this._itemType+'-item');
	    // Empties the id number list.
	    this._idNbList = [];

	    // Loops through the item divs.
	    for (let i = 0; i < divs.length; i++) {
	      let ordering = i + 1;
	      // Extracts the id number of the item from the end of its id value and convert it into an integer.
	      let idNb = parseInt(divs[i].id.replace(/.+-(\d+)$/, '$1'));
	      // Updates the ordering of the id number.
	      this._idNbList.push(idNb);

	      // Updates the item ordering.
	      document.getElementById(this._itemType+'-ordering-'+idNb).value = ordering;
	      document.getElementById(this._itemType+'-order-number-'+idNb).value = ordering;
	      // Displays the up/down links of the item.
	      document.getElementById(this._itemType+'-up-ordering-'+idNb).style.display = 'inline';
	      document.getElementById(this._itemType+'-down-ordering-'+idNb).style.display = 'inline';
	      // Resets first and last item classes.
	      document.getElementById(this._itemType+'-order-number-'+idNb).classList.remove('first-item', 'last-item');

	      if (ordering == 1) {
		// The first item cannot go any higher.
		document.getElementById(this._itemType+'-up-ordering-'+idNb).style.display = 'none';
		document.getElementById(this._itemType+'-order-number-'+idNb).classList.add('first-item');
	      }

	      if (ordering == divs.length) {
		// The last item cannot go any lower.
		document.getElementById(this._itemType+'-down-ordering-'+idNb).style.display = 'none';
		document.getElementById(this._itemType+'-order-number-'+idNb).classList.add('last-item');
	      }
	    }

	    // Reset the item pagination if required.
	    if (this._nbItemsPerPage !== null) {
		this.updatePagination(this._currentPageNb);
	    }
        },

        /**
	 * Switches the order of 2 items in the DOM.
	 *
	 * @param   string  direction  The direction to go when switching (up/down).
	 * @param   integer idNb       The id number of the item to switch from.
	 *
	 * @return  void
	*/
        reverseOrder: function (direction, idNb) {
	    // Loops through the item id number order.
	    for (let i = 0; i < this._idNbList.length; i++) {
		// Checks for the item which order has to be reversed.
		if (this._idNbList[i] == idNb) {
		  // Sets the item indexes according to the direction.
		  let index1 = i;
		  let index2 = i + 1;

		  if (direction == 'up') {
		      index1 = i - 1;
		      index2 = i;
		  }

		  // Gets the reference item before which the other item will be inserted.
		  let refItem = document.getElementById(this._itemType+'-item-'+this._idNbList[index1]);
		  // Momentarily withdraws the other item from the DOM.
		  let oldChild = this._container.removeChild(document.getElementById(this._itemType+'-item-'+this._idNbList[index2]));
		  // Switches the 2 items.
		  this._container.insertBefore(oldChild, refItem);
		  break;
		}
	    }

	    this.itemReordering();
	    // The "odd" and "even" classes need to be reset.
	    this.setOddEven();
	},

        /**
	 * Defines the items to display according to the given page number and the pagination parameters.
	 *
	 * @param   integer   activePageNb   The page to display in the item list.
	 *
	 * @return  void
	*/
        updatePagination: function (activePageNb) {
	    // Updates the current page number.
	    this._currentPageNb = activePageNb;

	    // Computes the total number of pages from the id list.
	    this._totalPages = Math.ceil(this._idNbList.length / this._nbItemsPerPage);

	    this._pagination.style.display = 'block';

	    // A new item has been added to the end of the list OR the only item of the current
	    // page has been deleted. In both cases the current last item page is displayed.
	    if (this._toLastPage || activePageNb > this._totalPages) {
		this._currentPageNb = this._totalPages;
		// Reset the flag.
		this._toLastPage = false;
	    }

	    // Loops through the item id number ordering.
	    for (let i = 0; i < this._idNbList.length; i++) {
		let pageNb = 1;

		// Computes the page number according to the number of items per page.
		if ((i + 1) > this._nbItemsPerPage) {
		    let result = (i + 1) / this._nbItemsPerPage;
		    pageNb = Math.ceil(result);
		}

		// Gets the class names of the item.
		let item = document.getElementById(this._itemType+'-item-'+this._idNbList[i]);
		let classes = item.className.split(' ');

		// Loops through the class names.
		for (let j = 0; j < classes.length; j++) {
		    // Checks and removes the possible pagination class.
		    if (classes[j].substring(0, this._itemType.length + 20) === this._itemType+'-pagination-inactive') {
			item.classList.remove(classes[j]);
		    }

		    // Hides the items which are not part of the current page.
		    if (pageNb != this._currentPageNb) {
			item.classList.add(this._itemType+'-pagination-inactive');
		    }
		}
	    }

	    // The only item of the current page has been deleted.
	    if (this._totalPages < this._currentPageNb) {
		// Updates the current page number.
		this._currentPageNb = this._totalPages;
	    }

	    if (this._totalPages < 2) {
		// No pagination is needed if there's just one or no page.
		this._pagination.style.display = 'none';
		return;
	    }

	    this.updatePaginationBrowser();
        },

        /**
	 * Builds the pagination browser according to the pagination parameters.
	 *
	 * @return  void
	 */
        updatePaginationBrowser: function () {
	    let beginning = CodaliaLang.pagination.beginning;
	    let previous = CodaliaLang.pagination.previous;

	    // Sets the 'beginning' and 'previous' links
	    if (this._currentPageNb > 1) {
		beginning = '<a href="javascript:void(0);" class="'+this._itemType+'-CPagination" data-page-nb="1">'+beginning+'</a>';
		let previousPage = this._currentPageNb - 1;
		previous = '<a href="javascript:void(0);" class="'+this._itemType+'-CPagination" data-page-nb="'+previousPage+'">'+previous+'</a>';
	    }

	    let browser = '<td>'+beginning+'</td><td>'+previous+'</td>';

	    let next = CodaliaLang.pagination.next;
	    let end = CodaliaLang.pagination.end;

	    // Sets the 'next' and 'end' links
	    if (this._currentPageNb < this._totalPages) {
		let nextPage = this._currentPageNb + 1;
		next = '<a href="javascript:void(0);" class="'+this._itemType+'-CPagination" data-page-nb="'+nextPage+'">'+next+'</a>';
		end = '<a href="javascript:void(0);" class="'+this._itemType+'-CPagination" data-page-nb="'+this._totalPages+'">'+end+'</a>';
	    }

	    // Sets the page links
	    for (let i = 0; i < this._totalPages; i++) {
		let pageNb = i + 1;

		if (pageNb == this._currentPageNb) {
	            browser += '<td class="current-page-number">'+pageNb+'</td>';
		}
		else {
	            browser += '<td class="page-number"><a href="javascript:void(0);" class="'+this._itemType+'-CPagination" data-page-nb="'+pageNb+'">'+pageNb+'</a></td>';
		}
	    }

	    browser += '<td>'+next+'</td><td>'+end+'</td>';

	    // Deletes the previous table row (if any).
	    if (document.getElementById(this._itemType+'-pagination-browser').rows.length > 0) {
		document.getElementById(this._itemType+'-pagination-browser').deleteRow(0);
	    }

	    // Inserts the new browsing links.
	    let row = document.getElementById(this._itemType+'-pagination-browser').insertRow(0)
	    row.innerHTML = browser;

	    this._assignPaginationElements();
	},

        /**
	 * Assign the updatePagination function to the pagination elements on the click event.
	 *
	 * @return  void
	*/
        _assignPaginationElements: function () {
	    // Get all the link elements related to pagination.
	    let elements = document.getElementsByClassName(this._itemType+'-CPagination');
	    let _this = this;

	    for (let i = 0; i < elements.length; ++i){
		elements[i].addEventListener('click', function() {
		    // Here 'this' refers to the element.
		    let pageNb = this.dataset.pageNb;
		    // _this refers to the CRepeater object.
		    _this.updatePagination(pageNb);
		}, true);
	    }
	    
	},

        /**
	 * Assign the reverseOrder function to the ordering elements on the click event.
	 *
	 * @param   integer   idNb  The item id number.
	 *
	 * @return  void
	*/
        _assignOrderingElements: function (idNb) {
	    let directions = ['up', 'down'];
	    let _this = this;

	    for (let i = 0; i < directions.length; ++i){
	        // Assign the reverseOrder function to the newly created up and down elements.
		document.getElementById(this._itemType+'-'+directions[i]+'-ordering-'+idNb).addEventListener('click', function() {
		    _this.reverseOrder(directions[i], idNb);
		}, true);
	    }
	},

        /**
	 * Adds the odd or even class to the items according to their position into the list.
	 *
	 * @return  void
	*/
        setOddEven: function () {
	    // Loops through the id number list.
	    for (let i = 0; i < this._idNbList.length; i++) {
		// Gets the div item.
		let item = document.getElementById(this._itemType+'-item-'+this._idNbList[i]);
		// First removes the current class.
		item.classList.remove(this._itemType+'-odd');
		item.classList.remove(this._itemType+'-even');

		// Uses the modulo operator to add the proper class.
		if ((i + 1) % 2) {
		    item.classList.add(this._itemType+'-odd');
		}
		else {
		    item.classList.add(this._itemType+'-even');
		}
	    }
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
	    for (let i = 0; i < this._idNbList.length; i++) {
		// Computes the current page.
		let pageNb = Math.ceil((i + 1) / this._nbItemsPerPage);

		// Checks the given fields for each item.
		for (let key in fields) {
		    let field = document.getElementById(this._itemType+'-'+key+'-'+this._idNbList[i]);

		    if (field.hasAttribute('disabled')) {
			// Skips the disabled fields as their values are not taken in account when
			// sending the form.
			continue;
		     }

		     // Checks the select tags when the Select2 plugin is used.
		     let Select2 = null;
		     if (this._Select2 && (field.type == 'select-one' || field.type == 'select-multiple')) {
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

			 if (this._nbItemsPerPage !== null) {
			     // Shows the corresponding page.
			     this.updatePagination(pageNb);
			 }

			 alert(CodaliaLang.message.alert_mandatory_field+': '+document.getElementById(this._itemType+'-'+key+'-label-'+this._idNbList[i]).innerHTML);

			 return false;
		     }

		     // Checks the value type.
		     if (fields[key] !== '' && !this.checkValueType(field.value, fields[key], extraType)) {
			 field.classList.add('mandatory');

			 if (Select2 !== null) {
			     Select2.classList.add('mandatory');
			 }

			 if (this._nbItemsPerPage !== null) {
			     // Shows the corresponding page.
			     this.updatePagination(pageNb);
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

	    attribs = {type: 'text', id: this._itemType+'-date-'+name+'-'+idNb, class: 'form-control', autocomplete: 'off', 'data-datepicker':''};
	    document.getElementById('div-date-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));

	    if (time) {
		attribs = {class: 'input-with-icon right-align datetime-field', id: 'div-time-'+name+'-'+idNb};
		document.getElementById('datepicker-'+name+'-'+idNb).appendChild(this.createElement('div', attribs));

		attribs = {class: 'icon icon-clock-o'};
		document.getElementById('div-time-'+name+'-'+idNb).appendChild(this.createElement('i', attribs));

		attribs = {type: 'text', id: this._itemType+'-time-'+name+'-'+idNb, class: 'form-control', autocomplete: 'off', 'data-timepicker':''};
		document.getElementById('div-time-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));
	    }

	    if (value == null) {
		value = '';
	    }

	    attribs = {type: 'hidden', name: this._itemType+'_'+name+'_'+idNb, id: 'publication-'+name+'-'+idNb, value: value, 'data-datetime-value':''};
	    document.getElementById('datepicker-'+name+'-'+idNb).appendChild(this.createElement('input', attribs));

	    document.getElementById('[data-control="datepicker"]').datePicker();
	}
    };

    return {
        init: Repeater
    };

})();
