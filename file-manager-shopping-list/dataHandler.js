const http = require('http');
const { readShoppingList, writeShoppingList } = require('./fileManager'); // Importing from fileManager

// Helper function to send JSON responses
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/shopping-list' && req.method === 'GET') {
    // GET: Retrieve the current shopping list
    const shoppingList = readShoppingList();
    sendResponse(res, 200, shoppingList);
  } else if (req.url === '/shopping-list' && req.method === 'POST') {
    // POST: Add a new item to the shopping list
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        if (!newItem.name || newItem.quantity <= 0) {
          sendResponse(res, 400, { error: 'Invalid item data' });
          return;
        }

        const shoppingList = readShoppingList();
        shoppingList.push(newItem);
        writeShoppingList(shoppingList);
        sendResponse(res, 201, newItem);
      } catch (err) {
        sendResponse(res, 500, { error: 'Failed to add item' });
      }
    });
  } else if (req.url === '/shopping-list' && (req.method === 'PUT' || req.method === 'PATCH')) {
    // PUT/PATCH: Update an existing shopping list item
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const updatedItem = JSON.parse(body);
        const shoppingList = readShoppingList();
        const index = shoppingList.findIndex(item => item.name === updatedItem.name);

        if (index === -1) {
          sendResponse(res, 404, { error: 'Item not found' });
          return;
        }

        if (!updatedItem.name || updatedItem.quantity <= 0) {
          sendResponse(res, 400, { error: 'Invalid item data' });
          return;
        }

        shoppingList[index] = updatedItem;
        writeShoppingList(shoppingList);
        sendResponse(res, 200, updatedItem);
      } catch (err) {
        sendResponse(res, 500, { error: 'Failed to update item' });
      }
    });
  } else if (req.url.startsWith('/shopping-list/') && req.method === 'DELETE') {
    // DELETE: Remove an item from the shopping list
    const itemName = req.url.split('/')[2];
    if (!itemName) {
      sendResponse(res, 400, { error: 'Item name is required' });
      return;
    }

    const shoppingList = readShoppingList();
    const filteredList = shoppingList.filter(item => item.name !== itemName);

    if (shoppingList.length === filteredList.length) {
      sendResponse(res, 404, { error: 'Item not found' });
      return;
    }

    writeShoppingList(filteredList);
    sendResponse(res, 200, { message: 'Item deleted' });
  } else {
    sendResponse(res, 404, { error: 'Not found' });
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
