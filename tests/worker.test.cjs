const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
async function harness(policy, pingFails=false) {
 let listener, updates=0, data={};
 const chrome={runtime:{id:'test',onMessage:{addListener:f=>listener=f},getURL:s=>'chrome-extension://test/'+s},storage:{managed:{get:async()=>{if(policy instanceof Error)throw policy;return {Mode:policy};}},session:{get:async()=>structuredClone(data),set:async d=>{data=d;}}},tabs:{sendMessage:async()=>{if(pingFails)throw Error('gone');return {};},update:async()=>{updates++;}},action:{setBadgeText:async()=>{}}};
 const context=vm.createContext({chrome});vm.runInContext(fs.readFileSync('extension/background.js','utf8'),context);
 const send=async(documentId='doc', overrides={}, reason='config-runtime-canvas')=>{listener({type:'detection',reason},{id:'test',tab:{id:2},documentId,...overrides});await vm.runInContext('queue',context);};
 return {send,result:()=>({updates,data})};
}
for (const policy of [undefined,'detect','typo',new Error('missing managed storage')]) test('safe default '+String(policy),async()=>{const h=await harness(policy);await h.send();assert.equal(h.result().updates,0);assert.equal(h.result().data.stats.detected,1);});
test('block and deduplicate document',async()=>{const h=await harness('block');await h.send();await h.send();assert.equal(h.result().updates,1);assert.equal(h.result().data.stats.detected,1);});
test('stale document does not block',async()=>{const h=await harness('block',true);await h.send();assert.equal(h.result().updates,0);assert.equal(h.result().data.stats.errors,1);});
test('reject foreign sender',async()=>{const h=await harness('block');await h.send('d',{id:'foreign'});assert.equal(h.result().updates,0);});
test('concurrent counters survive serialization',async()=>{const h=await harness('detect');await Promise.all([h.send('a'),h.send('b')]);assert.equal(h.result().data.stats.detected,2);});

test('known launcher blocks through worker',async()=>{const h=await harness('block');await h.send('launcher',{},'known-game-launcher');assert.equal(h.result().updates,1);});
test('known launcher stays detection-only by default',async()=>{const h=await harness(undefined);await h.send('launcher',{},'known-game-launcher');assert.equal(h.result().updates,0);assert.equal(h.result().data.stats.detected,1);});
