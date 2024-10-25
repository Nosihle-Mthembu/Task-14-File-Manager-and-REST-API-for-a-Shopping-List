const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'data');
const filePath = path.join(directoryPath, 'shoppingList.json');

// Ensure that the 'data' directory exists
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}

// Read and parse the shopping list file
function readShoppingList() {
  try {
    if (!fs.existsSync(filePath)) {
      // If the file doesn't exist, return an empty array
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading the shopping list file:', err);
    return [];
  }
}

// Update (write) the shopping list file with new data
function writeShoppingList(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to the shopping list file:', err);
  }
}

module.exports = {
  readShoppingList,
  writeShoppingList
};
