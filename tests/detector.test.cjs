const {test} = require('node:test');
const assert = require('node:assert/strict');
const {classify} = require('../extension/detector.js');
const config = 'window.eaglercraftXOpts = {container:"game", assetsURI:"assets.epk"};';
const runtime = 'function net_lax1dude_eaglercraft_v1_8_Main() {}';
for (const [name,input,expected] of [
 ['inline runtime',{canvas:true,inline:[config,runtime]},'config-runtime-canvas'],
 ['external bundle',{canvas:true,inline:[config],sources:['https://games.example/eaglercraft.1.8.js']},'config-runtime-canvas'],
 ['mere article mention',{canvas:false,inline:[],sources:[]},null],
 ['generic WebGL and mention',{canvas:true,inline:['const title="Eaglercraft";']},null],
 ['config alone',{canvas:true,inline:[config]},null],
 ['runtime alone',{canvas:true,inline:[runtime]},null],
 ['no canvas',{canvas:false,inline:[config,runtime]},null],
 ['query string mention',{canvas:true,inline:[config],sources:['https://example.org/analytics.js?q=eaglercraft.js']},null],
 ['unrelated script path',{canvas:true,inline:[config],sources:['https://example.org/not-eaglercraft.js']},null],
 ['string mention only',{canvas:true,inline:['const x="eaglercraftXOpts";']},null]
]) test(name,()=>assert.equal(classify(input),expected));

const cachedCode = require('node:fs').readFileSync('fixtures/cached-loader.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const cachedSources = ['launcher','util','largeEPK'].map(name=>'https://example.org/lib/'+name+'.js');
test('cached loader with canvas',()=>assert.equal(classify({canvas:true,inline:[cachedCode],sources:cachedSources}),'cached-loader-canvas'));
test('cached loader without canvas',()=>assert.equal(classify({canvas:false,inline:[cachedCode],sources:cachedSources}),null));
test('cached loader without companion scripts',()=>assert.equal(classify({canvas:true,inline:[cachedCode],sources:[]}),null));
test('companion scripts with mere mention',()=>assert.equal(classify({canvas:true,inline:['const text="Eaglercraft"'],sources:cachedSources}),null));

for (const url of ['https://eaglercraft.com/play','https://eaglercraft.com/play/','https://eaglercraft.com/en/play','https://eaglercraft.com/play?version=1.8.8']) {
 test('dedicated launcher '+url,()=>assert.equal(classify({canvas:false,documentUrl:url}),'known-game-launcher'));
}
for (const url of ['https://eaglercraft.com/','https://eaglercraft.com/news','https://eaglercraft.com/guide','https://example.org/?url=https://eaglercraft.com/play','https://eaglercraft.com.example.org/play','https://example.org/eaglercraft.com/play','https://eaglercraft.com/playground','https://eaglercraft.com/play/article','https://example.org@eaglercraft.com.example.org/play','not-a-url']) {
 test('launcher rule excludes '+url,()=>assert.equal(classify({canvas:true,documentUrl:url}),null));
}
