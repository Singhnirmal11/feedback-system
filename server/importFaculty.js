const xlsx = require("xlsx");
const mysql = require("mysql2");


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Nns@1234", 
  database: "feedback_system"      
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});


const workbook = xlsx.readFile("Teaching CSE 2501 Update as on 3rd Jan. 2026.xlsx");


const sheetName = "Faculty List - CSE";
const worksheet = workbook.Sheets[sheetName];


const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log("Total raw rows:", rows.length);


console.log("First 15 rows:");
rows.slice(0, 15).forEach((row, index) => {
  console.log(`Row ${index + 1}:`, row);
});


let headerRowIndex = -1;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i].map(cell => String(cell || "").trim().toLowerCase());

  if (
    row.some(cell => cell.includes("name")) &&
    row.some(cell => cell.includes("designation"))
  ) {
    headerRowIndex = i;
    break;
  }
}

if (headerRowIndex === -1) {
  console.log("Header row not found. Check Excel format.");
  process.exit();
}

console.log("Header row found at row:", headerRowIndex + 1);


const headers = rows[headerRowIndex].map(h => String(h || "").trim());
console.log("Detected headers:", headers);


const dataRows = rows.slice(headerRowIndex + 1);

let insertedCount = 0;
let skippedCount = 0;

dataRows.forEach((row, index) => {
  const rowData = {};

  headers.forEach((header, i) => {
    rowData[header] = row[i] || "";
  });

  const name =
    rowData["Name"] ||
    rowData["Faculty Name"] ||
    rowData["Name of the Faculty"] ||
    rowData["Faculty Name "] ||
    "";

  const designation =
    rowData["Designation"] ||
    "";

  const mobile_no =
    rowData["Mobile No"] ||
    rowData["Mobile No."] ||
    rowData["Mobile Number"] ||
    "";

  const email =
    rowData["Email"] ||
    rowData["Email ID"] ||
    rowData["Email Id"] ||
    "";

  const department =
    rowData["Department"] ||
    "Computer Science";

  if (String(name).trim() !== "") {
    const sql = `
      INSERT INTO faculties (name, department, designation, mobile_no, email)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, department, designation, mobile_no, email], (err) => {
      if (err) {
        console.error("Error inserting:", name, err.message);
      } else {
        console.log("Inserted:", name);
      }
    });

    insertedCount++;
  } else {
    skippedCount++;
    console.log(` Skipping row ${headerRowIndex + 2 + index} because name is missing`);
  }
});

console.log("Done!");
console.log("Inserted:", insertedCount);
console.log("Skipped:", skippedCount);