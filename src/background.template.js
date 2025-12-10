const NOTION_TOKEN = "__NOTION_TOKEN__";
const NOTION_DATABASE_ID = "__NOTION_DATABASE_ID__";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LEETCODE_SAVE_NOTION') {

    createNotionPage(message.payload)
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.toString() });
      });

    return true;
  }
});

async function getNextSerialNumber() {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      sorts: [
        {
          property: 'S.No.',
          direction: 'descending'
        }
      ],
      page_size: 1
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion query error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const [lastPage] = data.results;

  if (!lastPage) {
    return 1;
  }

  const serialProp = lastPage.properties?.['S.No.'];
  const currentSerial = serialProp?.number;

  if (typeof currentSerial === 'number') {
    return currentSerial + 1;
  }

  return 1;
}


async function createNotionPage(data) {
  const { problem, timestamp, url, notes, statistics } = data;

  const s_no = await getNextSerialNumber();

  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      'S.No.':{
        number: s_no
      },
      Problem: {
        title: [{ text: { content: problem } }]
      },
      Date: {
        date: { start: timestamp }
      },
      Link: {
        url
      },
      Notes: {
        rich_text: [{ text: { content: notes || '' } }]
      },
      Runtime: {
        rich_text: [{ text: { content: statistics?.runtime || '' } }]
      },
      Memory: {
        rich_text: [{ text: { content: statistics?.memory || '' } }]
      }
    }
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }
}
