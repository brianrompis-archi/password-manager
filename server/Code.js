// --- CONFIGURATION ---
const DB_ID = '1iyGuNYEyVfhC07EUWm_XguBwVCXF5txq3JuWOLQFwN0'; // OPTIONAL: Leave empty to use the active spreadsheet, or paste ID here.

// --- WEB APP SERVING ---
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('ARCHIPELAGO Password Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- API ENDPOINTS (Called from React) ---

function login(email) {
  const users = getTableData('Users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

function getAccessibleHotels(user) {
  console.log("Getting accessible hotels for user:", user);
  const hotels = getTableData('Hotels');
  const permissions = getTableData('Permissions');
  
  const accessibleIds = new Set();

  // 1. Direct Permissions
  permissions.forEach(p => {
    if (p.user_id === user.id) accessibleIds.add(p.hotel_id);
  });

  // 2. Group Permissions
  if (user.group_id) {
    hotels.forEach(h => {
      if (h.group_id === user.group_id) accessibleIds.add(h.id);
    });
  }

  // Filter hotels
  return hotels.filter(h => accessibleIds.has(h.id));
}

function getPasswordsForHotel(hotelId) {
  console.log("Fetching passwords for hotel ID:", hotelId);
  const allPasswords = getTableData('Passwords');
  console.log("All passwords fetched:", allPasswords);
  // Filter and Decrypt
  return allPasswords
    .filter(p => p.hotel_id === hotelId)
    .map(p => ({
      ...p,
      password_value: decrypt(p.encrypted_password) // Decrypt for display
    }));
}

function savePassword(data, userId) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Passwords');
  const now = new Date().toISOString().split('T')[0];
  
  // Basic Encryption
  const encryptedValue = encrypt(data.password_value);

  if (data.id) {
    // UPDATE
    const result = findRowIndex(sheet, data.id);
    if (result === -1) throw new Error("Password ID not found");
    
    // Update specific columns. Mapping: 
    // id(0), hotel_id(1), description(2), username(3), encrypted_password(4), login_type(5), created_by(6), last_edited(7), last_edited_by(8)
    
    const row = result;
    sheet.getRange(row, 3).setValue(data.description);
    sheet.getRange(row, 4).setValue(data.username);
    sheet.getRange(row, 5).setValue(encryptedValue);
    sheet.getRange(row, 6).setValue(data.login_type);
    sheet.getRange(row, 8).setValue(now);
    sheet.getRange(row, 9).setValue(userId);
    
    return { ...data, last_edited: now, last_edited_by: userId };
    
  } else {
    // CREATE
    const newId = Utilities.getUuid();
    // Order: id, hotel_id, description, username, encrypted_password, login_type, created_by, last_edited, last_edited_by
    const newRow = [
      newId,
      data.hotel_id,
      data.description,
      data.username,
      encryptedValue,
      data.login_type,
      userId,
      now,
      userId
    ];
    sheet.appendRow(newRow);
    
    return {
      id: newId,
      hotel_id: data.hotel_id,
      description: data.description,
      username: data.username,
      password_value: data.password_value,
      login_type: data.login_type,
      created_by: userId,
      last_edited: now,
      last_edited_by: userId
    };
  }
}

function deletePassword(id) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Passwords');
  const row = findRowIndex(sheet, id);
  if (row !== -1) {
    sheet.deleteRow(row);
  }
}

function getAllUsers() {
  // In real app, check permission here using Session.getActiveUser().getEmail()
  return getTableData('Users');
}

function updateUserAccessLevel(userId, newLevel) {
  const ss = getDb();
  const sheet = ss.getSheetByName('Users');
  const row = findRowIndex(sheet, userId);
  if (row === -1) throw new Error("User not found");
  
  // Access Level is column 6 (F)
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
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      // Handle potentially empty strings or nulls
      obj[header] = row[index] === "" ? null : row[index];
    });
    return obj;
  });
}

function findRowIndex(sheet, id) {
  const data = sheet.getDataRange().getValues();
  // Assuming ID is always in first column (index 0)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) return i + 1; // Return 1-based row index
  }
  return -1;
}

// --- SECURITY (Basic Obfuscation for Demo) ---
// IMPORTANT: For production, use the PropertiesService to store a secret key 
// and use a proper AES encryption library or similar. 
// This is a simple base64 placeholder to prevent plain-text reading.

function encrypt(text) {
  return Utilities.base64Encode(text); 
}

function decrypt(text) {
  return Utilities.newBlob(Utilities.base64Decode(text)).getDataAsString();
}
