const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../www/index.html'); // 调整路径为你的构建文件
let html = fs.readFileSync(filePath, 'utf-8');

html = html.replace(
  'if(location.protocol!="file:"){window.__vite_is_modern_browser=true}',
  'window.__vite_is_modern_browser = true;'
);

fs.writeFileSync(filePath, html, 'utf-8');
console.log('构建后文件已修改，避免 file 协议检查。');
