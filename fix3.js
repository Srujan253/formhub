const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/AdminPanel.jsx', 'utf8');

c = c.replace(
  'className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-xl z-50 p-6"',
  'className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl z-50 p-6"'
);

fs.writeFileSync('frontend/src/pages/AdminPanel.jsx', c);
console.log('Fixed Modal Class');