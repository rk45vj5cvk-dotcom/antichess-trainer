// Headless training-flow smoke check: real Board logic, mocked native views/audio.
// Run from the app directory; this does not replace an iPhone rendering test.
import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
import * as pgn from 'chessops/pgn';
import * as variant from 'chessops/variant';
import * as fen from 'chessops/fen';
import * as san from 'chessops/san';
import * as util from 'chessops/util';
const app=fs.readFileSync('App.tsx','utf8');
const data=['completedStudy','modernDefenseStudy','wizardStudy','polishStudy'].map(n=>fs.readFileSync(`src/${n}.ts`,'utf8').replace(/^export /gm,'')).join('\n');
const code=data+'\n'+app.slice(app.indexOf('type Line =')).replace('export default function App','function App')+'\nreturn {Board, polishCourse, initialCourse, readCourse};';
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None,jsx:ts.JsxEmit.React}}).outputText;
let slots=[],cursor=0,effects=[],pending=[],timers=new Map(),nextTimer=1;
const state=initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];};
const ref=v=>{const i=cursor++;return slots[i]??=( {current:v} );};
const effect=(callback,deps)=>{const i=cursor++;const old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))pending.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:callback()};});};
const React={createElement:(type,props,...children)=>({type,props:{...props,children:children.flat(Infinity)}})};
const audio=new Map();
const env={React,useState:state,useRef:ref,useEffect:effect,useAudioPlayer:s=>{if(!audio.has(s))audio.set(s,{seekTo:async()=>{},play:()=>{}});return audio.get(s);},setAudioModeAsync:async()=>{},useWindowDimensions:()=>({width:390,height:844}),StyleSheet:{create:x=>x},Linking:{openURL:async()=>{}},pieceSvg:{},require:x=>x,console,setTimeout:fn=>{const id=nextTimer++;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),...pgn,...variant,...fen,...san,...util};
for(const n of ['SafeAreaView','ScrollView','View','Text','Pressable','TextInput','SvgXml'])env[n]=n;
const {Board,polishCourse,initialCourse,readCourse}=new Function(...Object.keys(env),js)(...Object.values(env));
assert.equal(polishCourse.lines.length,6);
assert.equal(polishCourse.trainingColor,'white');
assert.equal(polishCourse.title,'Defeating the Polish Defense');
for(const l of polishCourse.lines){assert.equal(l.fen,fen.makeFen(variant.Antichess.default().toSetup()));assert.deepEqual(l.sans.slice(0,4),['e3','c5','Ba6','Nxa6']);}
const blackFixture=readCourse(fs.readFileSync('studies/polish/archived-black-introduction.pgn','utf8'));
let props={line:blackFixture.lines[2],color:'black',title:blackFixture.title,chapterIndex:2,chapterCount:11,soundEnabled:false,onClose(){},onPreviousChapter(){},onNextChapter(){},onToggleSound(){}};
let tree;
function render(){cursor=0;tree=Board(props);const work=pending;pending=[];work.forEach(f=>f());return tree;}
function walk(node,pred){if(!node||typeof node!=='object')return; if(pred(node))return node;for(const child of node.props?.children||[]){const result=walk(child,pred);if(result)return result;}}
function square(name){const el=walk(tree,n=>n.type==='Pressable'&&n.props.accessibilityLabel?.startsWith(name+' '));assert.ok(el,name);el.props.onPress();render();}
function button(text){const el=walk(tree,n=>n.type==='Pressable'&&walk(n,c=>c.type==='Text'&&c.props.children.includes(text)));assert.ok(el,text);el.props.onPress();render();}
function tick(){const work=[...timers.values()];timers.clear();work.forEach(f=>f());render();}
render();
assert.ok(timers.size,'Black lesson schedules White opening move');
tick();
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='e3 white pawn'));
square('c7');square('c5');
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='c5 black pawn'));
tick();
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='a6 white bishop'));
square('b8');square('a6');tick();
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='b4 white pawn'));
square('a6');square('b4');
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='Try again'));
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='b4 white pawn, incorrect destination'));
button('Try again');square('c5');square('b4');tick();
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='d3 white pawn'));
button('Restart');
assert.ok(timers.size,'Learn restart schedules White opening');tick();
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='e3 white pawn'));
// Unmount clears scheduled opponent turns; mounting a White lesson needs no opening timer.
for(const e of effects)e?.cleanup?.();slots=[];effects=[];pending=[];timers.clear();
props={...props,line:initialCourse.lines[0],color:'white'};render();assert.equal(timers.size,0);
for(const e of effects)e?.cleanup?.();slots=[];effects=[];pending=[];timers.clear();
props={...props,line:polishCourse.lines[2],title:polishCourse.title,color:'white',chapterIndex:2,chapterCount:3};render();
square('e2');square('e3');tick();
square('f1');square('a6');tick();
square('b2');square('b4');tick();
square('d2');square('d3');
assert.ok(walk(tree,n=>n.props?.accessibilityLabel==='d3 white pawn'));
assert.ok(walk(tree,n=>n.type==='Text'&&n.props.children.includes('Click Next Line.')));
for(const e of effects)e?.cleanup?.();slots=[];effects=[];pending=[];timers.clear();
const continuation=polishCourse.lines[5];
props={...props,line:continuation,chapterIndex:5,chapterCount:6};render();
for(let i=0;i<continuation.moves.length;i+=2){
 const move=util.parseUci(continuation.moves[i]);
 square(util.makeSquare(move.from));square(util.makeSquare(move.to));tick();
}
assert.ok(walk(tree,n=>n.type==='Text'&&n.props.children.includes('Click Next Line.')));
console.log('PASS: 6 initial-position White chapters; d3 and Andrejić branch completion; Black auto-start/replies, wrong-move retry, restart, and White start regression.');
