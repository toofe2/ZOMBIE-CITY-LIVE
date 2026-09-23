import { Color3, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { CityAssetLibrary } from './CityAssetLibrary';

export class WorldBuilder {
  readonly assets: CityAssetLibrary;
  constructor(private scene: Scene) { this.assets = new CityAssetLibrary(scene); }

  buildFallbackWorld() {
    this.scene.clearColor.set(0.025,0.035,0.05,1);
    const hemi = new HemisphericLight('ambient', new Vector3(0,1,0), this.scene);
    hemi.intensity = 1.15;

    const ground = MeshBuilder.CreateGround('ground',{width:64,height:64},this.scene);
    const gm = new StandardMaterial('groundMat',this.scene);
    gm.diffuseColor = new Color3(.17,.19,.22);
    ground.material=gm;

    const roadMat = new StandardMaterial('roadMat',this.scene);
    roadMat.diffuseColor = new Color3(.09,.1,.12);

    const roadA = MeshBuilder.CreateBox('roadA',{width:12,height:.05,depth:64},this.scene);
    roadA.position.y=.03;
    roadA.material=roadMat;

    const roadB = MeshBuilder.CreateBox('roadB',{width:64,height:.05,depth:12},this.scene);
    roadB.position.y=.031;
    roadB.material=roadMat;

    const sidewalkMat = new StandardMaterial('sidewalkMat',this.scene);
    sidewalkMat.diffuseColor = new Color3(.22,.24,.27);

    [-7,7].forEach(x=>{
      const s = MeshBuilder.CreateBox('sidewalk-x-'+x,{width:2,height:.12,depth:64},this.scene);
      s.position = new Vector3(x,.06,0);
      s.material = sidewalkMat;
    });

    [-7,7].forEach(z=>{
      const s = MeshBuilder.CreateBox('sidewalk-z-'+z,{width:64,height:.12,depth:2},this.scene);
      s.position = new Vector3(0,.061,z);
      s.material = sidewalkMat;
    });

    const buildingMat = new StandardMaterial('fallbackBuildingMat',this.scene);
    buildingMat.diffuseColor = new Color3(.24,.28,.33);

    const positions = [
      [-20,-20,8,8,7],[20,-20,9,8,9],[-20,20,8,10,8],[20,20,10,8,10],
      [-22,0,8,10,6],[22,0,8,10,7],[0,-22,10,8,8],[0,22,10,8,9],
      [-19,-8,6,6,5],[19,8,6,6,6],[-8,19,6,6,5],[8,-19,6,6,7]
    ];

    positions.forEach(([x,z,w,d,h],i)=>{
      const b=MeshBuilder.CreateBox('fallbackBuilding'+i,{width:w,height:h,depth:d},this.scene);
      b.position=new Vector3(x,h/2,z);
      b.material=buildingMat;
    });

    const safeMat = new StandardMaterial('safeZoneMat',this.scene);
    safeMat.diffuseColor = new Color3(.18,.38,.28);
    const safe = MeshBuilder.CreateCylinder('heroSafeEntry',{diameter:5,height:.08,tessellation:32},this.scene);
    safe.position = new Vector3(0,.05,0);
    safe.material = safeMat;

    const spawnMat = new StandardMaterial('spawnMarkerMat',this.scene);
    spawnMat.diffuseColor = new Color3(.4,.12,.12);
    [[0,-29],[29,0],[0,29],[-29,0]].forEach(([x,z],i)=>{
      const marker = MeshBuilder.CreateCylinder('zombieEntry'+i,{diameter:2,height:.05,tessellation:24},this.scene);
      marker.position = new Vector3(x,.04,z);
      marker.material = spawnMat;
    });
  }

  async enhanceWithAssets() {
    // Real city GLBs are loaded only when they actually exist in the external asset repository.
    // Keeping this method makes the runtime ready for Phase 4 without breaking StackBlitz.
    return;
  }

  setupFog() {
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = new Color3(.08,.09,.11);
    this.scene.fogDensity = .007;
  }
}