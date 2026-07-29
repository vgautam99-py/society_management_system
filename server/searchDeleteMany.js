import fs from 'fs';
import path from 'path';

const searchDir = 'c:/Users/Admin/Desktop/sms/server';

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        search(filePath);
      }
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('deleteMany')) {
        console.log(`Found deleteMany in: ${filePath}`);
      }
    }
  }
}

search(searchDir);
