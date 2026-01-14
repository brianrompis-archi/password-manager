
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

  if (user.password !== password) {
    throw new Error(`ACCESS_DENIED: Incorrect password.`);
  }
  
  const { password: _, ...userSafe } = user;
  return userSafe;
}

function getLoginTypes() {
  return getTableData('Categories');
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
  const newRow = [
    newId,
    userData.email.toLowerCase(),
    userData.name,
    userData.position,
    userData.group_id || null,
    userData.access_level || 'viewer',
    userData.avatar || null,
    userData.password || 'Welcome123'
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

function findRowIndex(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) return i + 1;
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
    return "Error decrypting";
  }
}
