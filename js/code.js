
document.addEventListener('DOMContentLoaded', () => {

    let getUrl = window.location;
    let pathParts = getUrl.pathname.split('/');
    // Removes the file name from the path.
    let path = getUrl.pathname.replace(pathParts[pathParts.length-1],'');
    const baseUrl = getUrl.protocol + '//' + getUrl.host + '/' + path;

    let repeater = new C_Repeater.init({
		item:'publication',
		ordering: true,
		rootLocation: baseUrl,
		rowsCells: [5,5],
		Select2: true,
		nbItemsPerPage: 3
    });

    document.getElementById('save-items').addEventListener('click', function(e) {
	validateFields(e);
    }, true);


    validateFields = function(e) {
      let fields = {'editor':'', 'standard':''};

      if(!repeater.validateFields(fields)) {
	e.preventDefault();
	e.stopPropagation();
	return false;
      }
      else {
	  alert('Items saved successfuly.');
      }
    }

    let ajax = new C_Ajax.init({
	    method: 'GET',
	    url: baseUrl+'php/request.php',
	    dataType: 'json'
    });

    ajax.run(getAjaxResult);


    function getAjaxResult(status, result) {
      if(status === 200) {
	  result.data.forEach(publication => { 
	      repeater.createItem(publication) 
	  });
      }
      else {
	  alert('Error: '+result.response);
      }
    }


    populatePublicationItem = function(idNb, data) {

	// Defines the default field values.
	if (data === undefined) {
	  data = {id:'', title:'', editor:'', translations:[], standard:'', ebook:0, version:'integral'};
	}

	// Element label
	attribs = {'title': CodaliaLang.publication.editor_desc, 'class':'item-label', 'id':'publication-editor-label-'+idNb};
	document.getElementById('publication-row-1-cell-1-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-editor-label-'+idNb).textContent = CodaliaLang.publication.editor_label;

	// Text input tag
	attribs = {'type':'text', 'name':'publication_editor_'+idNb, 'id':'publication-editor-'+idNb, 'class':'form-control', 'value':data.editor};
	document.getElementById('publication-row-1-cell-1-'+idNb).append(repeater.createElement('input', attribs));

	// Element label
	attribs = {'title': CodaliaLang.publication.standard_desc, 'class':'item-label', 'id':'publication-standard-label-'+idNb};
	document.getElementById('publication-row-1-cell-2-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-standard-label-'+idNb).textContent = CodaliaLang.publication.standard_label

	// Select tag:
	attribs = {'name':'publication_standard_'+idNb, 'id':'publication-standard-'+idNb, 'class':'form-control custom-select'};
	elem = repeater.createElement('select', attribs);

	// Builds the select options.
	let standards = ['isbn', 'issn', 'istc', 'isni', 'apa'];
	let options = '<option value="">- Select -</option>';

	for (let i = 0; i < 5; i++) {
	    let value = standards[i];
	    let text = standards[i].toUpperCase();
	    let selected = '';

	    if (data.standard == value) {
		selected = 'selected="selected"';
	    }

	    options += '<option value="'+value+'" '+selected+'>'+text+'</option>';
	}

	document.getElementById('publication-row-1-cell-2-'+idNb).append(elem);
	document.getElementById('publication-standard-'+idNb).innerHTML = options;
	// Uses jQuery with the Select2 plugin.
	$('#publication-standard-'+idNb).select2();
	
	// Element label.
	attribs = {'title':CodaliaLang.publication.translations_desc, 'class':'item-label', 'id':'publication-translations-label-'+idNb};
	document.getElementById('publication-row-1-cell-3-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-translations-label-'+idNb).textContent = CodaliaLang.publication.translations_label;

	// Multiple Select tag:
	attribs = {'name':'publication_translations_'+idNb+'[]', 'id':'publication-translations-'+idNb, 'multiple':'true', 'class':'form-control custom-select'};
	elem = repeater.createElement('select', attribs);

	// Builds the select options.
	let translations = ['english', 'french', 'spanish', 'german', 'italian', 'russian', 'chinese', 'japanese'];
	options = '<option value="">- Select -</option>';

	for (let i = 0; i < 8; i++) {
	    let value = translations[i];
	    let text = translations[i].charAt(0).toUpperCase() + translations[i].slice(1);
	    let selected = '';

	    if (repeater.inArray(value, data.translations)) {
		selected = 'selected="selected"';
	    }

	    options += '<option value="'+value+'" '+selected+'>'+text+'</option>';
	}

	document.getElementById('publication-row-1-cell-3-'+idNb).append(elem);
	document.getElementById('publication-translations-'+idNb).innerHTML = options;
	// Uses jQuery with the Select2 plugin.
	$('#publication-translations-'+idNb).select2();

	// Element label.
	attribs = {'title':CodaliaLang.publication.version_desc, 'class':'item-label', 'id':'publication-version-label-'+idNb};
	document.getElementById('publication-row-2-cell-1-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-version-label-'+idNb).textContent = CodaliaLang.publication.version_label;

	// Radio buttons:
	attribs = {'type':'radio', 'name':'publication_version_'+idNb, 'id':'publication-version-integral-'+idNb, 'value':'integral'};

	if (data.version == 'integral') {
	    attribs.checked = 'checked';
	}

	document.getElementById('publication-row-2-cell-1-'+idNb).append(repeater.createElement('input', attribs));

	// Option label
	attribs = {'title':CodaliaLang.publication.integral_version_desc, 'class':'radio-option', 'id':'publication-integral-option-'+idNb};
	document.getElementById('publication-row-2-cell-1-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-integral-option-'+idNb).textContent = CodaliaLang.publication.integral_version_label;

	attribs = {'type':'radio', 'name':'publication_version_'+idNb, 'id':'publication-version-redacted-'+idNb, 'value':'redacted'};

	if (data.version == 'redacted') {
	    attribs.checked = 'checked';
	}

	document.getElementById('publication-row-2-cell-1-'+idNb).append(repeater.createElement('input', attribs));

	// Option label
	attribs = {'title':CodaliaLang.publication.redacted_version_desc, 'class':'radio-option', 'id':'publication-redacted-option-'+idNb};
	document.getElementById('publication-row-2-cell-1-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-redacted-option-'+idNb).textContent = CodaliaLang.publication.redacted_version_label;

	// Element label.
	attribs = {'title':CodaliaLang.publication.ebook_desc, 'class':'item-label', 'id':'publication-ebook-label-'+idNb};
	document.getElementById('publication-row-2-cell-2-'+idNb).append(repeater.createElement('span', attribs));
	document.getElementById('publication-ebook-label-'+idNb).textContent = CodaliaLang.publication.ebook_label;

	// Checkbox tag:
	attribs = {'type':'checkbox', 'name':'publication_ebook_'+idNb, 'id':'publication-ebook-'+idNb, 'value':'ebook'};

	if (data.ebook == 1) {
	    attribs.checked = 'checked';
	}

	document.getElementById('publication-row-2-cell-2-'+idNb).append(repeater.createElement('input', attribs));
    }

});
