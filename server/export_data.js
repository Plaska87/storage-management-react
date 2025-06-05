// Export database data to multiple formats for easy viewing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonDbPath = path.join(__dirname, 'storage_data.json');

console.log('📊 Exporting database data to viewable formats...');

if (!fs.existsSync(jsonDbPath)) {
  console.log('❌ No data file found');
  process.exit(1);
}

const jsonData = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
const materials = jsonData.materials;

console.log(`📦 Found ${materials.length} materials to export`);

// 1. Export to CSV
const csvPath = path.join(__dirname, 'materials_export.csv');
let csvContent = 'ID,Material Name,Location,Quantity,When Stored,When Taken,Status\n';

materials.forEach(material => {
  const whenTaken = material.when_taken || '';
  const status = material.when_taken ? 'REMOVED' : 'STORED';
  const whenStored = new Date(material.when_stored).toLocaleString();
  const whenTakenFormatted = material.when_taken ? new Date(material.when_taken).toLocaleString() : '';
  
  csvContent += `${material.id},"${material.material_name}","${material.location}",${material.quantity},"${whenStored}","${whenTakenFormatted}","${status}"\n`;
});

fs.writeFileSync(csvPath, csvContent);
console.log(`✅ CSV exported to: ${csvPath}`);

// 2. Export to HTML table
const htmlPath = path.join(__dirname, 'materials_view.html');
let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Storage Management Database</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stored { background-color: #e8f5e8; }
        .removed { background-color: #ffe8e8; }
        .header { background-color: #4CAF50; color: white; padding: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗄️ Storage Management Database</h1>
        <p>Total Materials: ${materials.length} | Active: ${materials.filter(m => !m.when_taken).length} | Removed: ${materials.filter(m => m.when_taken).length}</p>
    </div>
    
    <table>
        <tr>
            <th>ID</th>
            <th>Material Name</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>When Stored</th>
            <th>When Taken</th>
            <th>Status</th>
        </tr>
`;

materials.forEach(material => {
  const status = material.when_taken ? 'REMOVED' : 'STORED';
  const rowClass = material.when_taken ? 'removed' : 'stored';
  const whenStored = new Date(material.when_stored).toLocaleString();
  const whenTaken = material.when_taken ? new Date(material.when_taken).toLocaleString() : '-';
  
  htmlContent += `
        <tr class="${rowClass}">
            <td>${material.id}</td>
            <td>${material.material_name}</td>
            <td>${material.location}</td>
            <td>${material.quantity}</td>
            <td>${whenStored}</td>
            <td>${whenTaken}</td>
            <td><strong>${status}</strong></td>
        </tr>
  `;
});

htmlContent += `
    </table>
    
    <div style="margin-top: 20px; padding: 10px; background-color: #f0f0f0;">
        <h3>📋 Database Information</h3>
        <p><strong>Database File:</strong> storage_database.db</p>
        <p><strong>Last Updated:</strong> ${jsonData.metadata.lastModified}</p>
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);
console.log(`✅ HTML view exported to: ${htmlPath}`);

// 3. Export to readable text format
const txtPath = path.join(__dirname, 'materials_list.txt');
let txtContent = `STORAGE MANAGEMENT DATABASE
==========================

Total Materials: ${materials.length}
Active Materials: ${materials.filter(m => !m.when_taken).length}
Removed Materials: ${materials.filter(m => m.when_taken).length}
Last Updated: ${jsonData.metadata.lastModified}

MATERIALS LIST:
===============

`;

materials.forEach((material, index) => {
  const status = material.when_taken ? 'REMOVED' : 'STORED';
  const whenStored = new Date(material.when_stored).toLocaleString();
  const whenTaken = material.when_taken ? new Date(material.when_taken).toLocaleString() : 'Still in storage';
  
  txtContent += `${index + 1}. ${material.material_name}
   ID: ${material.id}
   Location: ${material.location}
   Quantity: ${material.quantity}
   Status: ${status}
   Stored: ${whenStored}
   Taken: ${whenTaken}
   
`;
});

fs.writeFileSync(txtPath, txtContent);
console.log(`✅ Text list exported to: ${txtPath}`);

console.log('');
console.log('🎉 Data exported successfully!');
console.log('');
console.log('📋 How to view your data:');
console.log('');
console.log('1. 📊 CSV File (Excel/Spreadsheet):');
console.log(`   Open: ${csvPath}`);
console.log('   - Can be opened in Excel, Google Sheets, etc.');
console.log('');
console.log('2. 🌐 HTML File (Web Browser):');
console.log(`   Open: ${htmlPath}`);
console.log('   - Double-click to open in your web browser');
console.log('   - Nice formatted table with colors');
console.log('');
console.log('3. 📝 Text File (Notepad):');
console.log(`   Open: ${txtPath}`);
console.log('   - Simple text format, readable in any text editor');
console.log('');
console.log('4. 🗄️ Original JSON Data:');
console.log(`   Open: ${jsonDbPath}`);
console.log('   - Raw data in JSON format');
