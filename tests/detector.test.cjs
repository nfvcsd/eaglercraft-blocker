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
