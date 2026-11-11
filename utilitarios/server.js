const http = require('http');
const fs = require('fs');
const https = require('https');
const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const { JWT } = require('/usr/local/lib/node_modules/n8n/node_modules/.pnpm/node_modules/google-auth-library');
const core = require('/usr/local/lib/node_modules/n8n/node_modules/n8n-core');

const config = JSON.parse(fs.readFileSync('/home/node/.n8n/config', 'utf8'));
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');
const cipher = new core.CipherAes256CBC();
const spreadsheetId = '1AfkOyj27IK4rmlkwW5t_UmJBaXDRJt37kZJByr5eh_8';

const headersStandard = [
  'Nome',
  'Telefone',
  'TipoCarro',
  'Carro',
  'Tipo Lavagem',
  'EstadoCarro',
  'Placa',
  'FormaPagamento',
  'Valor',
  'Data'
];

function requestSheets(method, path, body = null, token) {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'sheets.googleapis.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {})
      }
    }, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve(JSON.parse(out)); } catch(e) { resolve(out); }
      });
    });
    req.on('error', reject);
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function getGoogleToken() {
  return new Promise((resolve, reject) => {
    db.get("SELECT data FROM credentials_entity WHERE type = 'googleApi'", async (err, row) => {
      if (err || !row) return reject(err || new Error('No cred'));
      try {
        const dec = cipher.decrypt(row.data, config.encryptionKey);
        const googleCred = JSON.parse(dec);
        const auth = new JWT({
          email: googleCred.email,
          key: googleCred.privateKey.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        const tokenRes = await auth.getAccessToken();
        resolve(tokenRes.token);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function realignSheet(sheetTitle) {
  const token = await getGoogleToken();
  const encTitle = encodeURIComponent(sheetTitle);
  const res = await requestSheets('GET', `/v4/spreadsheets/${spreadsheetId}/values/${encTitle}!A1:J100`, null, token);
  const rows = res.values || [];
  if (rows.length === 0) return { ok: false, error: 'Empty sheet' };

  const now = new Date();
  const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  const mesAtual = meses[now.getMonth()];
  const label = sheetTitle === 'Jcar' ? `TOTAL JCAR (${mesAtual})` : `TOTAL DO MÊS (${mesAtual})`;

  // Check if any row from index 3 onwards starts with TOTAL (accidental summary)
  for (let i = 3; i < rows.length; i++) {
    const colA = String(rows[i]?.[0] || '').trim().toUpperCase();
    if (colA.startsWith('TOTAL')) {
      const rowNum = i + 1;
      await requestSheets('POST', `/v4/spreadsheets/${spreadsheetId}/values/${encTitle}!A${rowNum}:K${rowNum}:clear`, {}, token);
      console.log(`Cleared accidental bottom summary at row ${rowNum}`);
    }
  }

  // Ensure Row 1 has the summary formulas
  await requestSheets('PUT', `/v4/spreadsheets/${spreadsheetId}/values/${encTitle}!A1:J1?valueInputOption=USER_ENTERED`, {
    range: `${sheetTitle}!A1:J1`,
    majorDimension: 'ROWS',
    values: [
      [
        label,
        '',
        '="Total: " & COUNTA(D4:D) & " veículos"',
        '',
        '',
        '',
        '',
        '',
        '=SUM(I4:I)',
        ''
      ]
    ]
  }, token);

  // Ensure Row 2 has the headers
  await requestSheets('PUT', `/v4/spreadsheets/${spreadsheetId}/values/${encTitle}!A2:J2?valueInputOption=USER_ENTERED`, {
    range: `${sheetTitle}!A2:J2`,
    majorDimension: 'ROWS',
    values: [headersStandard]
  }, token);

  // Get sheetId
  const meta = await requestSheets('GET', `/v4/spreadsheets/${spreadsheetId}`, null, token);
  const sheetMeta = meta.sheets.find(s => s.properties.title === sheetTitle);
  const sheetId = sheetMeta ? sheetMeta.properties.sheetId : 0;

  // Apply batchUpdate for styling and dimensions
  await requestSheets('POST', `/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    requests: [
      {
        updateSheetProperties: {
          properties: {
            sheetId: sheetId,
            gridProperties: {
              frozenRowCount: 2
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: 0,
            endIndex: 1
          },
          properties: { pixelSize: 38 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: 1,
            endIndex: 2
          },
          properties: { pixelSize: 26 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: 2,
            endIndex: 3
          },
          properties: { pixelSize: 14 },
          fields: 'pixelSize'
        }
      },
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 10
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.85, green: 0.89, blue: 0.94 },
              textFormat: { bold: true, fontSize: 12, foregroundColor: { red: 0.08, green: 0.15, blue: 0.28 } },
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)'
        }
      },
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 10
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.94, green: 0.95, blue: 0.96 },
              textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 0.2, green: 0.25, blue: 0.3 } },
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)'
        }
      }
    ]
  }, token);

  return { ok: true, sheetTitle, position: 'top_row1', summaryRow: 1, headerRow: 2 };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:4000');
  if (url.pathname === '/realign') {
    const sheet = url.searchParams.get('sheet') || 'Página1';
    try {
      const result = await realignSheet(sheet);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  } else if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4000, '0.0.0.0', () => {
  console.log('Realign service listening on port 4000 (Row 1 Summary, Row 2 Headers)');
});
