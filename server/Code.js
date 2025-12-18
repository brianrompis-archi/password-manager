// --- CONFIGURATION ---
const DB_ID = '1iyGuNYEyVfhC07EUWm_XguBwVCXF5txq3JuWOLQFwN0'; 

// --- WEB APP SERVING ---
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('ARCHIPELAGO Password Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Automatically gets the email of the current logged-in Google User.
 * Note: Requires the user to have authorized the script.
 */
function getActiveUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Validates the Google Account against the Users database.
 */
function login() {
  const email = getActiveUserEmail();
  if (!email) {
    throw new Error("Could not detect Google Account. Please ensure you are logged in.");
  }
  
  const users = getTableData('Users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error(`Access Denied: ${email} is not registered in the system.`);
  }
  
  return user;
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

function savePassword(data, userId) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Passwords');
  const now = new Date().toISOString().split('T')[0];
  const encryptedValue = encrypt(data.password_value);

  if (data.id) {
    const result = findRowIndex(sheet, data.id);
    if (result === -1) throw new Error("Password ID not found");
    const row = result;
    sheet.getRange(row, 3).setValue(data.description);
    sheet.getRange(row, 4).setValue(data.username);
    sheet.getRange(row, 5).setValue(encryptedValue);
    sheet.getRange(row, 6).setValue(data.login_type);
    sheet.getRange(row, 8).setValue(now);
    sheet.getRange(row, 9).setValue(userId);
    return { ...data, last_edited: now, last_edited_by: userId };
  } else {
    const newId = Utilities.getUuid();
    const newRow = [newId, data.hotel_id, data.description, data.username, encryptedValue, data.login_type, userId, now, userId];
    sheet.appendRow(newRow);
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

/**
 * Creates a new user in the system
 */
function createUser(userData) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Users');
  const newId = Utilities.getUuid();
  
  // Columns: id, email, name, position, group_id, access_level, avatar
  const newRow = [
    newId,
    userData.email.toLowerCase(),
    userData.name,
    userData.position,
    userData.group_id || null,
    userData.access_level || 'viewer',
    userData.avatar || null
  ];
  
  sheet.appendRow(newRow);
  
  return {
    id: newId,
    email: userData.email.toLowerCase(),
    name: userData.name,
    position: userData.position,
    group_id: userData.group_id,
    access_level: userData.access_level,
    avatar: userData.avatar
  };
}

function updateUserAccessLevel(userId, newLevel) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Users');
  const row = findRowIndex(sheet, userId);
  if (row === -1) throw new Error("User not found");
  sheet.getRange(row, 6).setValue(newLevel);
  return { id: userId, access_level: newLevel };
}

// --- HELPERS ---

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
      if (val instanceof Date) val = val.toISOString().split('T')[0];
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
