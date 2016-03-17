var sortActive = false;
var droppableOptionsGeneral = {
	greedy: true,		
	over: function( event, ui ) {
		var _drop = $(this),
		_drag = $(ui.draggable);
		
		removeSpaceForDrop();
		if (sortActive == true) {	//sort
			
			if(_drop.parent().get(0) == _drag.parent().get(0)) {

				//show dotted area for sort
				$('.space-for-drop').css('width','100%');
				_drop.append($('#space-for-drop').html());
				$('.space-for-drop').removeClass('alert-info').addClass('alert-danger');

			} else 					
				return false;
			
		} else {	//make tree
			_drop.children('.custom-child').append($('#space-for-drop').html());
			$('.space-for-drop').removeClass('alert-danger').addClass('alert-info');
			
		}		
		
	},
	out: function( event, ui ) {
		removeSpaceForDrop();		
	},
	drop: function(event, ui) {

		var _drop = $(this),
		_drag = $(ui.draggable);

		if (sortActive === true) { // sorting
			
			removeSpaceForDrop();
			if(_drop.parent().get(0) == _drag.parent().get(0)){ //sortable if the are sibling
				_drag.insertAfter(_drop);
			} else {
				//console.log('sibling false');
			}
			sortActive = false;
			
		} else { //make tree
			
			if(_drag.hasClass('new-dropable')){	//add new list
				var newItemBind = _drag.clone();
				newItemBind.css('width', '90%');
				newItemBind.droppable(droppableOptionsGeneral);
				newItemBind.draggable(draggableOption);
				newItemBind.removeClass('new-dropable');
				_drop.children('.custom-child').prepend(newItemBind);
				newItemBind.find('.glyphicon').removeClass('hide');
				
			} else {
				_drag.css('width', '90%');
				_drop.children('.custom-child').prepend(_drag);
			}
			removeSpaceForDrop();
			sortActive = false;

		}
	}
};
var droppableOptionsInParent = {
	hoverClass: 'ui-state-hover',
	accept: '.custom-dropable',
	over: function( event, ui ) {
		
		removeSpaceForDrop();
	
		//make tree
		$(this).next('.panel-body').children('.list-group').append($('#space-for-drop').html());
		$('.space-for-drop').removeClass('alert-danger').addClass('alert-info');
		$('.space-for-drop').css('width','90%');		
		
	},
	out: function( event, ui ) {
		removeSpaceForDrop();		
	},
	drop: function(event, ui) {
		
		if($(ui.draggable).hasClass('new-dropable')){	//add new list into panel

			// re-bind dragable+dropable for new on fly list			
			var _drag = $(ui.draggable);
			var newItemBind = _drag.clone();
			newItemBind.droppable(droppableOptionsGeneral);
			newItemBind.draggable(draggableOption);
			newItemBind.removeClass('new-dropable');
			
			$(this).next('.panel-body').children('.list-group').append(newItemBind);
			
			//show icons for new list
			newItemBind.find('.glyphicon').removeClass('hide');

			// re-bind pop over for new on fly list	
			//bindPopOver(newItemBind.find('.pop-over-trigger'));

		} else {// list alreay in panel
			$(this).next('.panel-body').children('.list-group').append($(ui.draggable));
		}
		
		ui.draggable.css('width', '100%');
		removeSpaceForDrop();
	}
}
var draggableOption = {
	containment: '#drop-container',		
	revert: 'invalid',
	cursor: 'move',
	cursorAt: { top: -5, left: -5 },
	helper: function(event) {
		if (sortActive == true)
			return $('<span class="label label-danger move-here">&harr; Sort</span>');
		else
			return $('<span class="label label-info move-here">&harr; Move</span>');
	}		
};

var popOverOption = {
	placement : 'left',
	trigger: 'manual',
    html: true,
    title: function () {
        return $('#popover-form .head').html();
    },
    content: function () {
        return $('#popover-form .content').html();
    }
}

$(document).ready(function() {

	//Drag a list
	$('div.custom-dropable').draggable(draggableOption);	
	
	//Drop into a list
	$('#drop-container div.custom-dropable').droppable(droppableOptionsGeneral);

	//Drop to panel header, then append to droped panel's list group
	$('#drop-container div.panel-heading').droppable(droppableOptionsInParent);

	
	//Flag for sort action
	$(document).on('mousedown','.sort-active',function() {
		sortActive = true;
	});
	
	//Delete list
	$(document).on('click','.delete-list',function() {
		if(confirm('Are you sure you want to delete this ? Child lists will be removed too.'))
			$(this).closest('.custom-dropable').remove();
	});

	//generate json button action
	$(document).on('click','#make_json',function() {
		try {
			$("#show_result .panel-body").html(JSON.stringify(buildObFromDOM($('.list-group'))));
		} catch(e) {
			alert('There is an error!');
		}
	});


	//list item edit
	$(document).on('click', '.custom-dropable:not(.new-dropable) .list-group-item' , function(e) {

        var editListDom = $(this).find('.custom-title:first');
        var linkTitle = editListDom.text();
        var linkRef = editListDom.attr('href');
        linkRef = (linkRef == 'javascript:void(0);') ? '' :  linkRef;
        
        //set value in form
        $('#form-title').val(linkTitle);
        $('#form-link').val(linkRef);

        $('.current-edit').removeClass('current-edit');
        editListDom.addClass('current-edit');
        
        //mark editing box
        $('.edit-focus').removeClass('edit-focus');
        $(this).addClass('edit-focus');

    });


    //pop over form management
    $(document).on('click','.custom-submit',function() {        	
    	  
		//set form data to list attribute
		$('.current-edit').text($('#form-title').val());
		$('.current-edit').attr('href',$('#form-link').val());
		
		//reset form
		$('#form-title,#form-link').val('');
		$('.edit-focus').removeClass('edit-focus');

	});

	
	
});

function removeSpaceForDrop() {
	$('#drop-container .space-for-drop').remove();
}

//generate json with recursion call
function buildObFromDOM(parent) {
	
	if(parent.children('.custom-dropable').length == 0)
		return null;

	var resultOb = [];

	parent.children('.custom-dropable').each(function(i,customDropableSingle){
		
		var ListItem = {};		
		ListItem.title = $(customDropableSingle).find('.custom-title:first').text();
		ListItem.link = $(customDropableSingle).find('.custom-title:first').attr('href') == "javascript:void(0);" ? "" : $(customDropableSingle).find('.custom-title:first').attr('href');

		var childListItems;
		$(customDropableSingle).children('.custom-child').each(function( j,val ){
			
			childListItems = buildObFromDOM($(this));

		});
		
		ListItem.child = childListItems;

		resultOb.push(ListItem);
		
	});
	return resultOb;
}