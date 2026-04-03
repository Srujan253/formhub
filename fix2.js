const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/AdminPanel.jsx', 'utf8');

c = c.replace(
  /<UserPlus size=\{18\} \/>[\s\S]*?\{error\}[\s\S]*?<\/div>/,
  `<UserPlus size={18} />
          {currentRole === 'admin' ? 'Create User' : 'Create Staff Account'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}`
);

fs.writeFileSync('frontend/src/pages/AdminPanel.jsx', c);
