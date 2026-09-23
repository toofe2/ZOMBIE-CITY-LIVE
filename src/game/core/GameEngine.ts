import { ArcRotateCamera, Color3, Engine, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { EventBus, type GameEvent } from './EventBus';
import { CommentSpawnQueue } from './CommentSpawnQueue';
import { WorldBuilder } from '../world/WorldBuilder';
import { HERO_LEVELS } from '../config/gameBalance';

type Unit = { id:string; kind:'zombie'|'hero'; username:string; level:number; hp:number; mesh:any; target?:string; lastAttack:number };

export class GameEngine {
  engine: Engine;
  scene: Scene;
  world: WorldBuilder;
  queue = new CommentSpawnQueue();
  units = new Map<string,Unit>();
  feed: string[] = [];
  counters = { totalCommentsAccepted:0,totalZombiesSpawned:0,zombiesAlive:0,zombiesKilled:0,pendingZombieSpawns:0,humansAlive:0 };
  private unsubscribe?:()=>void;
  private resize=()=>this.engine.resize();
  private lastTime=performance.now();

  constructor(private canvas: HTMLCanvasElement, private onUpdate?:()=>void) {
    this.engine = new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
    this.scene = new Scene(this.engine);
    this.scene.clearColor.set(.02,.025,.035,1);
    const camera = new ArcRotateCamera('camera', -Math.PI/4, 1.02, 48, new Vector3(0,0,0), this.scene);
    camera.lowerRadiusLimit=30; camera.upperRadiusLimit=60; camera.attachControl(canvas,false);
    this.world = new WorldBuilder(this.scene);
    this.world.buildFallbackWorld();
    this.world.setupFog();
    void this.world.enhanceWithAssets();
    this.unsubscribe = EventBus.on(e=>this.handle(e));
    window.addEventListener('resize',this.resize);
    this.engine.runRenderLoop(()=>this.tick());
  }

  private handle(e:GameEvent) {
    if(e.type==='comment'){ this.counters.totalCommentsAccepted++; this.queue.enqueue({username:e.username,comment:e.comment}); this.feed.unshift(`${e.username.toUpperCase()} entered the infected army`); }
    if(e.type==='gift'){ const lvl=Math.max(1,Math.min(10,Math.ceil(e.giftValue/10))); this.spawnOrUpgradeHero(e.username,lvl); this.feed.unshift(`${e.username.toUpperCase()} reinforced LV.${lvl}`); }
    if(e.type==='spawn-zombie') for(let i=0;i<(e.count??1);i++) this.spawnZombie(e.username??`DEV-${i+1}`);
    if(e.type==='spawn-hero') this.spawnOrUpgradeHero(e.username??'DEV HERO',e.level);
    this.onUpdate?.();
  }

  private spawnZombie(username:string){
    const id='z-'+crypto.randomUUID();
    const m=MeshBuilder.CreateCapsule(id,{height:1.8,radius:.34},this.scene);
    const mat=new StandardMaterial(id+'m',this.scene);mat.diffuseColor=new Color3(.25,.52,.24);m.material=mat;
    const angle=Math.random()*Math.PI*2; const r=20+Math.random()*8; m.position=new Vector3(Math.cos(angle)*r,.9,Math.sin(angle)*r);
    this.units.set(id,{id,kind:'zombie',username,level:0,hp:100,mesh:m,lastAttack:0});
    this.counters.totalZombiesSpawned++; this.counters.zombiesAlive++;
  }

  private spawnOrUpgradeHero(username:string,level:number){
    const existing=[...this.units.values()].find(u=>u.kind==='hero'&&u.username.toLowerCase()===username.toLowerCase());
    const cfg=HERO_LEVELS[level as keyof typeof HERO_LEVELS];
    if(existing){existing.level=Math.max(existing.level,level);existing.hp=Math.min(HERO_LEVELS[existing.level as keyof typeof HERO_LEVELS].maxHP,existing.hp+cfg.maxHP*.2);return;}
    const id='h-'+crypto.randomUUID();const m=MeshBuilder.CreateCapsule(id,{height:1.9,radius:.38},this.scene);
    const mat=new StandardMaterial(id+'m',this.scene);mat.diffuseColor=new Color3(.2,.48,.9);m.material=mat;m.position=new Vector3(0,.95,0);
    this.units.set(id,{id,kind:'hero',username,level,hp:cfg.maxHP,mesh:m,lastAttack:0});this.counters.humansAlive++;
  }

  private tick(){
    const now=performance.now(); const dt=Math.min(.05,(now-this.lastTime)/1000); this.lastTime=now;
    for(const item of this.queue.drain(3)) this.spawnZombie(item.username);
    this.counters.pendingZombieSpawns=this.queue.size;

    const heroes=[...this.units.values()].filter(u=>u.kind==='hero'&&u.hp>0);
    const zombies=[...this.units.values()].filter(u=>u.kind==='zombie'&&u.hp>0);
    for(const z of zombies){
      let target=heroes[0]; let best=Infinity;
      for(const h of heroes){const d=Vector3.DistanceSquared(z.mesh.position,h.mesh.position);if(d<best){best=d;target=h;}}
      if(!target) continue;
      const dir=target.mesh.position.subtract(z.mesh.position); const d=dir.length();
      if(d>1.65) z.mesh.position.addInPlace(dir.normalize().scale(1.75*dt));
      else if(now-z.lastAttack>1200){z.lastAttack=now;target.hp-=6;if(target.hp<=0){target.hp=0;target.mesh.setEnabled(false);this.counters.humansAlive--;}}
    }

    for(const h of heroes){
      const cfg=HERO_LEVELS[h.level as keyof typeof HERO_LEVELS];
      let target=zombies[0];let best=Infinity;
      for(const z of zombies){const d=Vector3.DistanceSquared(h.mesh.position,z.mesh.position);if(d<best){best=d;target=z;}}
      if(!target) continue; const d=Math.sqrt(best);
      if(d<=cfg.engagement && now-h.lastAttack>Math.max(70,550/h.level)){
        h.lastAttack=now;target.hp-=20*cfg.damageMultiplier;
        if(target.hp<=0){target.hp=0;target.mesh.dispose();this.units.delete(target.id);this.counters.zombiesAlive--;this.counters.zombiesKilled++;}
      }
    }
    this.scene.render(); this.onUpdate?.();
  }

  dispose(){
    this.unsubscribe?.(); window.removeEventListener('resize',this.resize); this.queue.clear();
    this.engine.stopRenderLoop(); this.scene.dispose(); this.engine.dispose();
  }
}