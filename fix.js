const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminPanel.jsx', 'utf8');

content = content.replace(
  /useState\(\{ name: '', email: '', password: '' \}\);/g,
  "useState({ name: '', email: '', password: '', role: 'staff' });"
);

content = content.replace(
  /setStaffData\(\{ name: '', email: '', password: '' \}\);/g,
  "setStaffData({ name: '', email: '', password: '', role: 'staff' });"
);

content = content.replace(
  /placeholder="Set temporary password"[\s\S]*?\/>[\s\S]*?<\/div>/,
  `placeholder="Set temporary password"
                    />
                  </div>
                  {currentRole === 'admin' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                      <select
                        value={staffData.role}
                        onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}`
);

content = content.replace(
  /<h3 className="text-xl font-bold font-manrope">Create Staff Account<\/h3>/g,
  "<h3 className=\"text-xl font-bold font-manrope\">{currentRole === 'admin' ? 'Create User' : 'Create Staff Account'}</h3>"
);

fs.writeFileSync('frontend/src/pages/AdminPanel.jsx', content);
console.log('Successfully updated AdminPanel.jsx');
