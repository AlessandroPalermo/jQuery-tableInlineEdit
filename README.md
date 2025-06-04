# jQuery tableInlineEdit
jQuery Plugin for inline table editing

## Usage
Prepare a table where each column declares whether the cells are editable using data attributes inside `<th>` tags. One column should be reserved for the editing toolbar.

```html
<div id="table-wrapper">
  <button class="add-row">Add row</button>
  <table id="myTable">
    <thead>
      <tr>
        <th data-editable="text" data-name="first_name">First name</th>
        <th data-editable="text" data-name="last_name">Last name</th>
        <th data-editable="datetime" data-name="created">Created</th>
        <th data-name="inline-toolbar">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr data-id="1">
        <td>John</td>
        <td>Doe</td>
        <td>2015-04-16 10:00:00</td>
        <td style="text-align:center">
          <i class="edit-row fa fa-pencil-square-o"></i>
          <i class="save-row fa fa-check"></i>
          <i class="delete-row fa fa-times-circle"></i>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

Initialise the plugin on your table and customise the selectors for the toolbar controls if needed:

```javascript
$('#myTable').inlineEdit({
  controls: {
    addRow: '.add-row',
    editRow: '.edit-row',
    deleteRow: '.delete-row',
    saveRow: '.save-row'
  },
  serverSide: {
    saveUrl: '',
    extraData: {}
  }
});
```

### Options
- **controls**: selectors used for the edit, save, delete and add actions.
- **serverSide**: configuration object used when saving data to the server.

### Server side saving
When `serverSide.saveUrl` is defined the plugin issues an AJAX `POST` request on each add, edit or delete operation. The payload contains the row id, the action performed and all cell values merged with `serverSide.extraData`.
