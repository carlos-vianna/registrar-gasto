const SHEET_NAME = 'Gastos';

function doGet() {
  try {
    const sh = getSheet_();
    const lastRow = sh.getLastRow();

    if (lastRow <= 1) {
      return json_({ ok: true, expenses: [] });
    }

    const rows = sh.getRange(2, 1, lastRow - 1, 9).getValues();

    const expenses = rows
      .filter(row => String(row[6] || '').trim() !== '')
      .map(row => ({
        date: formatDate_(row[0]),
        cardId: String(row[1] || ''),
        description: String(row[2] || ''),
        category: String(row[3] || 'Outros'),
        value: Number(row[4] || 0),
        note: String(row[5] || ''),
        id: String(row[6] || ''),
        updatedAt: row[7] instanceof Date ? row[7].getTime() : Number(row[7] || 0),
        createdAt: row[8] instanceof Date ? row[8].getTime() : Number(row[8] || 0)
      }));

    return json_({ ok: true, expenses: expenses });
  } catch (error) {
    return json_({ ok: false, message: error.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = String(body.action || 'upsert');

    if (action === 'delete') {
      deleteExpense_(String(body.id || ''));
      return json_({ ok: true });
    }

    upsertExpense_(body.expense || body);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, message: error.message });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'Data', 'Cartão', 'Descrição', 'Categoria', 'Valor',
    'Observação', 'ID', 'Atualizado em', 'Criado em'
  ];

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sh;
}

function upsertExpense_(expense) {
  const sh = getSheet_();
  const id = String(expense.id || '').trim();

  if (!id) {
    throw new Error('ID do gasto não informado.');
  }

  const row = findRowById_(sh, id);
  const date = expense.date ? new Date(expense.date + 'T12:00:00') : new Date();
  const updatedAt = new Date(Number(expense.updatedAt || Date.now()));
  const createdAt = new Date(Number(expense.createdAt || expense.updatedAt || Date.now()));

  const values = [[
    date,
    String(expense.cardId || ''),
    String(expense.description || ''),
    String(expense.category || 'Outros'),
    Number(expense.value || 0),
    String(expense.note || ''),
    id,
    updatedAt,
    createdAt
  ]];

  if (row) {
    sh.getRange(row, 1, 1, 9).setValues(values);
  } else {
    sh.getRange(sh.getLastRow() + 1, 1, 1, 9).setValues(values);
  }
}

function deleteExpense_(id) {
  if (!id) {
    throw new Error('ID não informado para exclusão.');
  }

  const sh = getSheet_();
  const row = findRowById_(sh, id);

  if (row) {
    sh.deleteRow(row);
  }
}

function findRowById_(sh, id) {
  const lastRow = sh.getLastRow();

  if (lastRow <= 1) {
    return 0;
  }

  const ids = sh.getRange(2, 7, lastRow - 1, 1).getValues().flat();
  const index = ids.findIndex(value => String(value || '') === id);

  return index >= 0 ? index + 2 : 0;
}

function formatDate_(value) {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return '';
  }

  return Utilities.formatDate(
    value,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}