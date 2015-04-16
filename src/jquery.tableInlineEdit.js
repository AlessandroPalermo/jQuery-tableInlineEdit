jQuery.fn.extend({
    inlineEdit : function(options){
    	this.tableInlineEdit = new (InlineTableEdit = Class.extend({
    	    defaults : {
    	        controls    : {
    	            addRow      : '.add-row',
    	            editRow     : '.edit-row',
    	            deleteRow   : '.delete-row',
    	            saveRow     : '.save-row'
    	        },
    	        
    	        serverSide : {
            	    saveUrl    : '',
    	            extraData  : {}
    	        }
    	    },
    	    construct : function($container, props){
    	        this.$container    = $container;
    	        this.props         = $.extend(this.defaults, props);

    	        this.table_header  = [];
    	        
    	        this.init();
    	    },
    	    init : function(){
        	    var _self = this;

        	    this.$container.find(this.props.controls.saveRow).hide();
        	    
    	    	this.$container.find('th').each(function(i){
    	    		var editable     = $(this).data('editable');
    	    		var editWidth    = $(this).data('edit-width');
    	    		var editDefault  = $(this).data('default');
    	    		var editName     = $(this).data('name');
    	    		var options      = $(this).data('options');
    	    		
    	    	    _self.table_header.push({
    	    	    	editable     : editable != undefined ? editable : false,
    	    	    	name         : editName != undefined ? editName : null,
    	    	    	width        : editWidth != undefined ? editWidth : null,
    	    			editDefault  : editDefault != undefined ? editDefault : null,
    					options      : options != undefined ? options : null,
    	    	    });
    	    	});
    	        this.bindEvents();
    	    },
    	    bindEvents : function(){
    	        var _self = this;

    	        // Edit/Delete row buttons
    	        this.$container.on('click', this.props.controls.editRow, function(){
 	        	   var tr = $(this).parents('tr');
 	        	   _self.toggleEdit(tr, true);
    	        }).on('click', this.props.controls.deleteRow, function(){
 	        	   var tr = $(this).parents('tr');
  	        	   _self.deleteRow(tr);
    	        }).on('click', this.props.controls.saveRow, function(){
 	        	   var tr = $(this).parents('tr');
 	        	   _self.toggleEdit(tr, false);
    	        });

    	        // Add row button
    	        this.$container.parents('div').find(this.props.controls.addRow).on('click', function(){
    	            _self.addRow();
    	        });
    	    },
    	    addRow : function(){
 	    	   var row = this.createEmptyRow();
 	    	   this.$container.append(row);
        	   this.toggleEdit(row, true);
    	    },
    	    createEmptyRow : function(){
    	    	var html  = '<tr>';
    	    	var _self = this;
    	    	$.each(this.table_header, function(i){
        	    	if(this.name == 'inline-toolbar'){
        	    	    html += '<td style="text-align:center">' + _self.toolbarHtml() + '</td>';
        	    	}else{
            	    	if(this.editDefault)
                	    	html += '<td>' + this.editDefault + '</td>';
            	    	else
                	    	html += '<td></td>';
        	    	}
    	    	});

    	    	html += '</tr>';
        	    
    	        return $(html);
    	    },
    	    toolbarHtml : function(){
        	    var html = [
                            '<i class="' + this.props.controls.editRow.substring(1) + ' fa fa-pencil-square-o" style="cursor:pointer;font-size:18px;" title="Edit"></i>',
                            '<i class="' + this.props.controls.saveRow.substring(1) + ' fa fa-check" style="cursor:pointer;font-size:18px;" title="Save"></i>',
                            '<i class="' + this.props.controls.deleteRow.substring(1) + ' fa fa-times-circle" style="cursor:pointer;font-size:18px;" title="Delete"></i>'
    	        	    	];

    	    	return html.join('');
    	    },
    	    editRow : function(row){
        	    var _self = this;
        	    
    	        row.find('td').each(function (i){
    	        	var field = _self.table_header[i];
    	        	if(field.editable)
        	        	_self.createInput($(this), field);
    	        });
    	    },
    	    saveRow : function(row, method){
        	    var _self      = this;
    	        var row_data   = {};
    	        
    	    	row.find('td').each(function (i){
    	        	var field = _self.table_header[i];

    	            console.log(field);
    	        	
    	        	if(field.editable){
        	        	switch(field.editable){
            	        	case 'text':
            	        	case 'datetime':
            	        		var value = $(this).find('input').val();
                	        	row_data[field.name] = value;
                	        	break;
            	        	case 'select':
            	        		var value = $(this).find('select > option:selected').text();
            	        		row_data[field.name] = $(this).find('select').val();
            	        		break;
        	        	}
        	        	
        	        	$(this).html(value);
    	        	}
    	        	
    	        });

    	        if(this.props.serverSide.saveUrl){
        	        var id = row.data('id');
        	        this.ajaxSave(id, method, row_data);
	        	}
    	    },
    	    ajaxSave : function(id, method, data){
        	    var _self = this;
        	    
    	        var send_data = {
	        	    id        : id,
	        	    method    : method,
	        	    data      : data
    	        };

    	        send_data.data = $.extend(send_data.data, this.props.serverSide.extraData);

    	        var retVal = null;
    	        $.post(this.props.serverSide.saveUrl, send_data).done(function(result){
    	        	retVal = result;
    	        });
    	        
    	        return retVal;
    	    },
    	    toggleEdit : function(row, toggle){
    	        if(toggle){
        	        row.find(this.props.controls.editRow).hide();
        	        row.find(this.props.controls.deleteRow).hide();
        	        row.find(this.props.controls.saveRow).show();
    	            this.editRow(row);
    	        }else{
        	        row.find(this.props.controls.editRow).show();
        	        row.find(this.props.controls.deleteRow).show();
        	        row.find(this.props.controls.saveRow).hide();
    	            this.saveRow(row, 'edit');
    	        }
    	    }, 
    	    createInput : function(cell, field){
    	        var cell_content   = cell.text();
    	        var inputField     = null;

    	        switch(field.editable){
    	            case 'text' : 
        	            inputField = $('<input type="text">').val(cell_content);
    	            break;
    	            case 'datetime':
    	            	inputField = $('<input type="text">').val(cell_content);
    	            	inputField.datetimepicker({dateFormat : "yy-mm-dd", timeFormat : "HH:mm:ss"});
        	        	var date = new Date(Date.parse(cell_content.split("-").join("/")));
        	        	inputField.datetimepicker("setDate", date);
    	        	break;
    	            case 'select':
        	            inputField = $('<select>');
        	            var options_data = field.options;
        	            console.log(options_data);
        	            $.each(options_data, function(){
            	            var select_option = $('<option value="' + this.id + '">').text(this.text);
        	                
        	                if(this.text == cell_content)
        	                	select_option.attr('selected', true);

    	                	inputField.append(select_option);
        	            });
    	            break;
    	        }

    	        if(field.width)
        	        inputField.width(field.width);
    	        
    	        cell.html(inputField);
    	    },
    	    deleteRow : function(row){
    	        row.remove();
    	        
    	        if(this.props.serverSide.saveUrl){
        	        var id = row.data('id');
        	        if(id) this.ajaxSave(id, 'delete', {});
	        	}
    	    }
    	}))(this, options);
    }
});