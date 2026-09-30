// Chart contracts: sums, dates, stable fixtures, group filters and login responses.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const $ = () => {}; // DOM-ready callbacks aren't needed for API contract checks.
const window = {jQuery:$};
window.parent=window;
const ctx={window,$,console,setTimeout,clearTimeout,URLSearchParams,location:{pathname:'/2025/index.html',search:'',protocol:'http:'}};
vm.runInNewContext(fs.readFileSync('work/os-ui/2025/mock/mock-api.js','utf8'),ctx);
const call=(path,data={})=>$.ajax({url:'/rest/api/'+path,data,async:false}).responseJSON;
const range={searchStartDt:'2025-09-01',searchEndDt:'2025-09-30'};
const sum=(rows,key)=>rows.reduce((a,r)=>a+r[key],0);
for(const scope of ['user/perf','admin/tot-perf']){
  const url='analytics/'+scope+'/data';
  const summary=call(url,range),rows=call(url+'/month',range);
  assert.equal(summary.totalCnslCnt,summary.totalChatCnt+summary.totalRsvtnCnt);
  assert.equal(summary.totalCnslCnt,sum(rows,'count'));
  assert.equal(summary.totalCnslCnt,sum(summary.dataByDays,'count'));
  assert.equal(summary.totalCnslCnt,sum(summary.dataByHours,'count'));
  assert.equal(summary.totalCnslReviewCnt,sum(rows,'countCnslReview'));
  assert.equal(summary.totalCnslReviewGrade,sum(rows,'sumCnslReviewGrade'));
  assert.equal(rows.length,60);
  assert(rows.every(r=>r.cnslDate.startsWith('2025-09')&&Number.isFinite(r.avgCnslDurationSeconds)&&r.sumCnslReviewGrade<=r.countCnslReview*5));
  assert.equal(JSON.stringify(summary),JSON.stringify(call(url,range)));
}
const full=call('analytics/admin/tot-perf/data',range);
const groups=['g1','g2','g3','g4'].map(grpId=>call('analytics/admin/tot-perf/data',{...range,grpId}));
assert.equal(full.totalCnslCnt,sum(groups,'totalCnslCnt'));
assert(call('analytics/user/perf/data',range).totalCnslCnt<full.totalCnslCnt);
const dash=call('analytics/dashboard/data');
assert.equal(dash.totalCnslCnt,sum(dash.chartDatas,'endCnt'));
assert.equal(new Set(dash.chartDatas.map(m=>m.id)).size,14);
assert.equal(call('login/proc',{mbrID:'demo',mbrPwd:'demo2025'}).data.statusCode,200);
assert.equal(call('login/proc',{mbrID:'demo',mbrPwd:'incorrect'}).data.statusCode,401);
assert.equal(call('login/find-pwd/exist',{mbrID:'demo',mbrEmail:'demo@example.com'}).data,true);
const empty=call('analytics/admin/tot-perf/data',{searchStartDt:'2025-09-30',searchEndDt:'2025-09-01'});
assert.equal(empty.totalCnslCnt,0);
assert(empty.dataByHours.every(r=>r.count===0&&r.percentage===0));
console.log('PASS: chart totals, stable queries, filters, unique IDs, login and empty range');
