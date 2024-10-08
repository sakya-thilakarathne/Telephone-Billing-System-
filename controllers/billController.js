const xlsx = require('xlsx');
const mysql = require('mysql');
const db = require('../config/query');

// Function to handle bill upload
exports.uploadBill = (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Parse the Excel file
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Save data to MySQL database
  const sql = `INSERT INTO bills 
  (Mobile, Conn, Divdat, GPRS, Data, MMSRnt, OUG, MMS, OutSMS, IncSMS, Roam, IDD, IDDReb, Pack, VPN, RegFee, Nor, VdCall, VdIDD, Wap, SubRb, Mtune, Msub, PMsubs, Pmail, USDSMS, USSD, CLI, Val50, VRC, Info, News, ECH, ESer, Devices, Services, DBR, STK, Fax, BLB, IDT, IDTReb, VAT, NBT, LCF, TLE, SSCL_TAX, Total, Month, Year) 
  VALUES ?`; // Modify this query according to your table structure

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index
  const currentYear = currentDate.getFullYear();

  const values = data.map(row => [
    row.Mobile,
    row.Conn,
    row.Div,
    row.GPRS,
    row.Data,
    row['MMS Rnt'],
    row.OUG,
    row.MMS,
    row['Out SMS'],
    row['Inc SMS'],
    row.Roam,
    row.IDD,
    row['IDD Reb'],
    row.Pack,
    row.VPN,
    row['Reg Fee'],
    row.Nor,
    row['Vd Call'],
    row['Vd IDD'],
    row.Wap,
    row['Sub Rb'],
    row['M tune'],
    row.Msub,
    row['PM subs'],
    row.Pmail,
    row['USD SMS'],
    row.USSD,
    row.CLI,
    row.Val50,
    row.VRC,
    row.Info,
    row.News,
    row.ECH,
    row['E Ser'],
    row.Devices,
    row.Services,
    row.DBR,
    row.STK,
    row.Fax,
    row.BLB,
    row.IDT,
    row['IDT Reb'],
    row.VAT,
    row.NBT,
    row.LCF,
    row.TLE,
    row.SSCL_TAX,
    row.Total,
    currentMonth,
    currentYear
  ]); 

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    connection.query(sql, [values], (err, results) => {
      connection.release(); // Release the connection

      if (err) {
        console.error('Error inserting data into database:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Data inserted successfully', results });
    });
  });
};


exports.getMonthlyBills = (req, res) => {
  const { month, year } = req.query; 
  const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;

  const sql = `
  SELECT u.*, um.*, b.*
  FROM users u
  JOIN user_mobile um ON um.UserId = u.Id
  JOIN bills b ON b.Mobile = um.MobileNumber
  WHERE um.GivenFrom < ?
  AND (um.GivenUntill IS NULL OR um.GivenUntill > ?)
  AND b.Month = ? AND b.Year = ?;
  `;

  db.query(sql, [dateString,dateString,month, year], (err, results) => {
    if (err) {
      console.error('Error fetching bill data:', err);
      return res.status(500).json({ error: 'Database error' + err });
    }

    res.json(results);
  });
};

exports.getDptBills = (req, res) => {
  const { month, year, Dpt } = req.query; 
  const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;

  const sql = `
  SELECT u.*, um.*, b.*
  FROM users u
  JOIN user_mobile um ON um.UserId = u.Id
  JOIN bills b ON b.Mobile = um.MobileNumber
  WHERE um.GivenFrom < ?
  AND (um.GivenUntill IS NULL OR um.GivenUntill > ?)
  AND b.Month = ? AND b.Year = ? AND u.Dpt = ?;
  `;

  db.query(sql, [dateString,dateString,month, year, Dpt], (err, results) => {
    if (err) {
      console.error('Error fetching bill data:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
};