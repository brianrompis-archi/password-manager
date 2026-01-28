
// --- CONFIGURATION ---
const DB_ID = '1iyGuNYEyVfhC07EUWm_XguBwVCXF5txq3JuWOLQFwN0'; 

/**
 * DEPLOYMENT INSTRUCTIONS:
 * Keep:
 * - Execute as: "Me"
 * - Who has access: "Anyone"
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('ARCHIPELAGO Password Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Verifies the credentials provided by the user against the "Users" sheet.
 */
function loginWithCredentials(email, password) {
  if (!email || !password) throw new Error("Email and password are required");
  
  const users = getTableData('Users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error(`ACCESS_DENIED: User with email ${email} was not found.`);
  }

  // Decrypt the stored password for comparison
  const decryptedStoredPassword = decrypt(user.password);
  
  if (decryptedStoredPassword !== password) {
    throw new Error(`ACCESS_DENIED: Incorrect password.`);
  }
  
  const { password: _, ...userSafe } = user;
  return userSafe;
}

/**
 * Generates and sends a verification code to the user's email.
 */
function sendVerificationCode(email) {
  const users = getTableData('Users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("User not found");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

  const ss = getDb();
  let sheet = ss.getSheetByName('VerificationCodes');
  if (!sheet) {
    sheet = ss.insertSheet('VerificationCodes');
    sheet.appendRow(['email', 'code', 'expires_at']);
  }

  // Clean up old codes for this user
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === email) sheet.deleteRow(i + 1);
  }

  sheet.appendRow([email, code, expiresAt]);

  // Send the email
  const subject = "ARCHIPELAGO - Password Change Verification Code";
  const body = `Your verification code is: ${code} <br><br>This code will expire in 10 minutes. If you did not request this, please ignore this email. <br><br>`;
  
  try {
    // Updated to use GmailApp to support sending from an alias
    GmailApp.sendEmail(email, subject, '', {
      from: 'corporateIT@archipelagohotels.com',
      replyTo: 'corporateIT@archipelagohotels.com',
      name: 'ARCHIPELAGO Corporate IT',
      htmlBody: body
    });
  } catch (e) {
    // Fallback logic if the alias is not configured or fails
    try {
      console.log("Failed to send email as corpIT " + e.message);
      MailApp.sendEmail(email, subject, body);
    } catch (innerError) {
      throw new Error("Failed to send email. " + e.message);
    }
  }

  return { success: true };
}

/**
 * Verifies the code and updates the user's password.
 */
function verifyAndChangePassword(email, code, newPassword) {
  const ss = getDb();
  const sheet = ss.getSheetByName('VerificationCodes');
  if (!sheet) throw new Error("No verification session found.");

  const data = sheet.getDataRange().getValues();
  let validEntryIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][1].toString() === code.toString()) {
      const expiresAt = new Date(data[i][2]);
      if (expiresAt > new Date()) {
        validEntryIndex = i + 1;
        break;
      } else {
        throw new Error("Verification code has expired.");
      }
    }
  }

  if (validEntryIndex === -1) throw new Error("Invalid verification code.");

  // Update user password
  const userSheet = ss.getSheetByName('Users');
  const rowIndex = findRowIndex(userSheet, email, 1); // Search by email in column 2 (index 1)
  if (rowIndex === -1) throw new Error("User record not found during update.");

  const encryptedPassword = encrypt(newPassword);
  userSheet.getRange(rowIndex, 8).setValue(encryptedPassword);

  // Clean up code
  sheet.deleteRow(validEntryIndex);

  return { success: true };
}

function getLoginTypes() {
  return getTableData('Categories');
}

function getGroups() {
  return getTableData('Groups');
}

function getAllHotels() {
  return getTableData('Hotels');
}

function getUserPermissions(userId) {
  const permissions = getTableData('Permissions');
  return permissions
    .filter(p => p.user_id === userId)
    .map(p => p.hotel_id);
}

function updateUserPermissions(userId, hotelIds) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Permissions');
  const data = sheet.getDataRange().getValues();
  
  // 1. Remove existing permissions for this user
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === userId) {
      sheet.deleteRow(i + 1);
    }
  }
  
  // 2. Add new permissions
  hotelIds.forEach(hotelId => {
    const newId = Utilities.getUuid();
    sheet.appendRow([newId, userId, hotelId]);
  });
  
  return { success: true };
}

function getAccessibleHotels(user) {
  const hotels = getTableData('Hotels');
  const permissions = getTableData('Permissions');
  const accessibleIds = new Set();

  permissions.forEach(p => {
    if (p.user_id === user.id) accessibleIds.add(p.hotel_id);
  });

  if (user.group_id) {
    hotels.forEach(h => {
      if (h.group_id === user.group_id) accessibleIds.add(h.id);
    });
  }

  return hotels.filter(h => accessibleIds.has(h.id));
}

function getPasswordsForHotel(hotelId) {
  const allPasswords = getTableData('Passwords');
  return (allPasswords || [])
    .filter(p => p.hotel_id === hotelId)
    .map(p => ({
      ...p,
      password_value: decrypt(p.encrypted_password)
    }));
}

function getPasswordHistory(passwordId) {
  const allHistory = getTableData('PasswordHistory');
  return (allHistory || [])
    .filter(h => h.password_id === passwordId)
    .map(h => ({
      ...h,
      password_value: decrypt(h.encrypted_password)
    }))
    .sort((a, b) => new Date(b.change_date) - new Date(a.change_date));
}

function savePassword(data, userId) {
  const ss = getDb();
  const passwordSheet = ss.getSheetByName('Passwords');
  const historySheet = ss.getSheetByName('PasswordHistory');
  const now = new Date().toISOString();
  const encryptedValue = encrypt(data.password_value);

  if (data.id) {
    const oldData = getTableData('Passwords').find(p => p.id == data.id);
    if (oldData) {
      const historyId = Utilities.getUuid();
      historySheet.appendRow([
        historyId, 
        oldData.id, 
        oldData.description, 
        oldData.username, 
        oldData.encrypted_password, 
        oldData.last_edited_by || oldData.created_by, 
        oldData.last_edited || now
      ]);
    }

    const result = findRowIndex(passwordSheet, data.id);
    if (result === -1) throw new Error("Password ID not found");
    const row = result;
    passwordSheet.getRange(row, 3).setValue(data.description);
    passwordSheet.getRange(row, 4).setValue(data.username);
    passwordSheet.getRange(row, 5).setValue(encryptedValue);
    passwordSheet.getRange(row, 6).setValue(data.login_type);
    passwordSheet.getRange(row, 8).setValue(now);
    passwordSheet.getRange(row, 9).setValue(userId);
    return { ...data, last_edited: now, last_edited_by: userId };
  } else {
    const newId = Utilities.getUuid();
    const newRow = [newId, data.hotel_id, data.description, data.username, encryptedValue, data.login_type, userId, now, userId];
    passwordSheet.appendRow(newRow);
    return { ...data, id: newId, created_by: userId, last_edited: now, last_edited_by: userId };
  }
}

function deletePassword(id) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Passwords');
  const row = findRowIndex(sheet, id);
  if (row !== -1) sheet.deleteRow(row);
}

function getAllUsers() {
  return getTableData('Users');
}

function createUser(userData) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Users');
  const newId = Utilities.getUuid();
  
  // Encrypt the user password before storage
  const encryptedPassword = encrypt(userData.password || 'Welcome123');
  
  const newRow = [
    newId,
    userData.email.toLowerCase(),
    userData.name,
    userData.position,
    userData.group_id || null,
    userData.access_level || 'viewer',
    userData.avatar || null,
    encryptedPassword
  ];
  sheet.appendRow(newRow);
  return { id: newId, ...userData, email: userData.email.toLowerCase() };
}

function updateUserAccessLevel(userId, newLevel) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Users');
  const row = findRowIndex(sheet, userId);
  if (row === -1) throw new Error("User not found");
  sheet.getRange(row, 6).setValue(newLevel);
  return { id: userId, access_level: newLevel };
}

function getDb() {
  return DB_ID ? SpreadsheetApp.openById(DB_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getTableData(sheetName) {
  const ss = getDb();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  if (range.isBlank()) return [];
  const data = range.getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val instanceof Date) val = val.toISOString();
      obj[header] = val === "" ? null : val;
    });
    return obj;
  });
}

function findRowIndex(sheet, id, columnIndex = 0) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] == id) return i + 1;
  }
  return -1;
}

function encrypt(text) {
  if (!text) return "";
  return Utilities.base64Encode(text); 
}

function decrypt(text) {
  if (!text) return "";
  try {
    return Utilities.newBlob(Utilities.base64Decode(text)).getDataAsString();
  } catch (e) {
    // If the data isn't Base64 (e.g. manually entered plain text), return as is
    return text;
  }
}
