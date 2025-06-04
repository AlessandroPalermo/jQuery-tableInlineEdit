const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');

function setupDOM() {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>
    <div>
      <button class="add-row">Add</button>
      <table id="tbl">
        <thead>
          <tr>
            <th data-editable="text" data-name="name">Name</th>
            <th data-name="inline-toolbar">Tools</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </body></html>`, { url: 'http://localhost' });
  const { window } = dom;
  const $ = jquery(window);
  global.window = window;
  global.document = window.document;
  global.$ = global.jQuery = $;
  const classJs = fs.readFileSync(path.join(__dirname, '../src/Class.js'), 'utf8');
  eval(classJs);
  const pluginJs = fs.readFileSync(path.join(__dirname, '../src/jquery.tableInlineEdit.js'), 'utf8');
  eval(pluginJs);
  return $;
}

describe('tableInlineEdit addRow', () => {
  let $, table;

  beforeEach(() => {
    $ = setupDOM();
    table = $('#tbl');
    table.inlineEdit();
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.$;
    delete global.jQuery;
  });

  test('should create empty row in edit mode and then save', () => {
    expect(table.find('tbody tr').length).toBe(0);

    table.tableInlineEdit.addRow();

    const rows = table.find('tbody tr');
    expect(rows.length).toBe(1);
    const row = rows.eq(0);
    expect(row.find('input[type="text"]').length).toBe(1);
    expect(row.find('.edit-row').css('display')).toBe('none');
    expect(row.find('.delete-row').css('display')).toBe('none');
    expect(row.find('.save-row').css('display')).not.toBe('none');

    table.tableInlineEdit.toggleEdit(row, false);

    expect(row.find('input').length).toBe(0);
    expect(row.find('td').first().text()).toBe('');
    expect(row.find('.edit-row').css('display')).not.toBe('none');
    expect(row.find('.delete-row').css('display')).not.toBe('none');
    expect(row.find('.save-row').css('display')).toBe('none');
  });
});
