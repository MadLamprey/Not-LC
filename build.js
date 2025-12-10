import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const templatePath = path.join(__dirname, 'src', 'background.template.js');
const outputPath = path.join(__dirname, 'background.js');

const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;

let template = fs.readFileSync(templatePath, 'utf8');

template = template
  .replace(/"__NOTION_TOKEN__"/g, JSON.stringify(NOTION_TOKEN))
  .replace(/"__NOTION_DATABASE_ID__"/g, JSON.stringify(NOTION_DATABASE_ID));

fs.writeFileSync(outputPath, template);
