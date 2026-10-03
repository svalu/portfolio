const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const app = fs.readFileSync('work/team/workshop/assets/app.js','utf8');
const setup = app.slice(app.indexOf('  const CFG'), app.indexOf('  const $ ='));
let externalReads = 0;
const context = { window:{WK_CONFIG:{}}, URLSearchParams, URL, Map, location:{search:'?preview=1'}, document:{addEventListener(){}} };
Object.defineProperty(context,'localStorage',{get(){externalReads++;throw new Error('Visitor storage accessed');}});
vm.runInNewContext(setup + '\nthis.demoStorage = storage;',context);
context.demoStorage.setItem('wk2_item', '{"demo":true}');
assert.equal(context.demoStorage.getItem('wk2_item'),'{"demo":true}');
assert.equal(externalReads,0,'tour neither reads nor overwrites visitor storage');
const other = {...context,window:{WK_CONFIG:{}}};
vm.runInNewContext(setup + '\nthis.demoStorage = storage;',other);
assert.equal(other.demoStorage.getItem('wk2_item'),null,'replay starts with isolated state');
for(const name of ['home','easy','weekly','weekly-me','actions','deals','meetings','team']) {
  const html = fs.readFileSync(`work/team/weekly/${name}.html`,'utf8');
  const nav = html.match(/<header[\s\S]*?<\/header>/)[0];
  if(name !== 'weekly-me') assert.match(nav,new RegExp(`href="${name}\\.html"[^>]*aria-current="page"`));
  assert.match(html,/assets\/preview.css/);
}
console.log('PASS: isolated demo storage, clean replay state, current-page navigation');
