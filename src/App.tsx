import { useEffect, useMemo, useRef, useState } from 'react';
import { GameEngine } from './game/core/GameEngine';
import { SimulatorBridge } from './game/core/SimulatorBridge';

function Nav(){return <div className="nav"><a href="/live">LIVE</a><a href="/control">CONTROL</a><a href="/dev">DEV</a></div>}

function Live(){
  const canvasRef=useRef<HTMLCanvasElement>(null); const gameRef=useRef<GameEngine|null>(null);
  const [,force]=useState(0);
  useEffect(()=>{const bridge=new SimulatorBridge('receiver');const canvas=canvasRef.current!;const game=new GameEngine(canvas,()=>force(x=>x+1));gameRef.current=game;return()=>{bridge.dispose();game.dispose();gameRef.current=null}},[]);
  const g=gameRef.current;
  return <div className="live-shell"><canvas ref={canvasRef} className="game-canvas"/><div className="hud"><div className="hud-top"><div className="pill">HUMANS {g?.counters.humansAlive??0}</div><div className="pill">ZOMBIES {g?.counters.zombiesAlive??0}</div></div>{g?.feed?.length?<div className="feed">{g.feed.slice(0,5).map((x,i)=><div className="feed-item" key={i}>{x}</div>)}</div>:null}</div></div>
}

function Control(){
  const bridge=useMemo(()=>new SimulatorBridge('publisher'),[]); useEffect(()=>()=>bridge.dispose(),[bridge]);
  const [cu,setCu]=useState('Ali'),[comment,setComment]=useState('hello'),[gu,setGu]=useState('Mustafa'),[gv,setGv]=useState(50);
  return <div className="panel"><Nav/><h1>CONTROL CENTER</h1><div className="grid">
    <div className="card"><h3>COMMENT SIMULATOR</h3><input className="input" value={cu} onChange={e=>setCu(e.target.value)}/><br/><br/><input className="input" value={comment} onChange={e=>setComment(e.target.value)}/><br/><br/><button className="btn" onClick={()=>bridge.publish({type:'comment',username:cu,comment})}>Send Comment</button></div>
    <div className="card"><h3>GIFT SIMULATOR</h3><input className="input" value={gu} onChange={e=>setGu(e.target.value)}/><br/><br/><input className="input" type="number" value={gv} onChange={e=>setGv(+e.target.value)}/><br/><br/><button className="btn" onClick={()=>bridge.publish({type:'gift',username:gu,giftName:'Test Gift',giftValue:gv})}>Send Gift</button></div>
  </div></div>
}

function Dev(){
  const bridge=useMemo(()=>new SimulatorBridge('publisher'),[]); useEffect(()=>()=>bridge.dispose(),[bridge]);
  return <div className="panel"><Nav/><h1>DEV LAB</h1><div className="card"><h3>Quick tests</h3><div className="row">
    <button className="btn" onClick={()=>bridge.publish({type:'spawn-zombie',count:1})}>Spawn 1 Zombie</button>
    <button className="btn" onClick={()=>bridge.publish({type:'spawn-zombie',count:10})}>Spawn 10 Zombies</button>
    <button className="btn" onClick={()=>bridge.publish({type:'spawn-zombie',count:30})}>Spawn 30 Zombies</button>
    {[1,5,10].map(level=><button className="btn alt" key={level} onClick={()=>bridge.publish({type:'spawn-hero',username:'DEV HERO',level})}>Hero LV{level}</button>)}
  </div><p className="muted">Production /live remains comment-driven. DEV buttons are manual diagnostics only.</p></div></div>
}

export default function App(){
  const p=location.pathname==='/'?'/live':location.pathname;
  if(p==='/control')return <Control/>;
  if(p==='/dev')return <Dev/>;
  return <Live/>;
}