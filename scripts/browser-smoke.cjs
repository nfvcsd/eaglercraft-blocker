// Optional: npm install --no-save --package-lock=false playwright; npx playwright install chromium
const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const http=require('node:http');const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'), profile=fs.mkdtempSync(path.join(os.tmpdir(),'nfv-smoke-'));
 const server=http.createServer((req,res)=>{const name=path.basename(new URL(req.url,'http://localhost').pathname);const file=path.join(root,'fixtures',name);if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(file,'utf8').replaceAll('localhost:8765', 'localhost:'+server.address().port));});
 await new Promise(r=>server.listen(0,r));let context;
 try {
  const extension=path.join(root,'extension');
  context=await chromium.launchPersistentContext(profile,{channel:'chromium',executablePath:process.env.CHROME_TEST_BINARY||undefined,headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  for(const [file,count] of [['mention.html',0],['positive.html',1],['dynamic.html',1],['frame.html',1],['csp.html',1],['cached-loader.html',1]]){
   await worker.evaluate(()=>chrome.storage.session.clear());
   const page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/'+file);await page.waitForTimeout(4500);
   const stats=await worker.evaluate(()=>chrome.storage.session.get('stats'));
   assert.equal(stats.stats?.detected||0,count,file);assert.equal(stats.stats?.blocked||0,0,file+' detection-only');
   console.log('PASS',file);await page.close();
  }
  // Test-only policy stub in isolated test browser; real MDM still requires pilot.
  await worker.evaluate(()=>{chrome.storage.managed.get=async()=>({Mode:'block'});});
  const page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/positive.html');
  await page.waitForURL(/chrome-extension:\/\/.*\/blocked.html/);console.log('PASS block navigation with policy stub');
 } finally {if(context)await context.close();await new Promise(r=>server.close(r));fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
