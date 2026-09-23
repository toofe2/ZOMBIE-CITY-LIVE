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
    const gm = new StandardMaterial('groundMat',this.scene); gm.diffuseColor = new Color3(.17,.19,.22); ground.material=gm;

    const roadMat = new StandardMaterial('roadMat',this.scene); roadMat.diffuseColor = new Color3(.09,.1,.12);
    const roadA = MeshBuilder.CreateBox('roadA',{width:12,height:.05,depth:64},this.scene); roadA.position.y=.03; roadA.material=roadMat;
    const roadB = MeshBuilder.CreateBox('roadB',{width:64,height:.05,depth:12},this.scene); roadB.position.y=.031; roadB.material=roadMat;

    const buildingMat = new StandardMaterial('fallbackBuildingMat',this.scene); buildingMat.diffuseColor = new Color3(.24,.28,.33);
    const positions = [[-20,-20],[20,-20],[-20,20],[20,20],[-22,0],[22,0],[0,-22],[0,22]];
    positions.forEach(([x,z],i)=>{const b=MeshBuilder.CreateBox('fallbackBuilding'+i,{width:8,height:6+(i%3)*2,depth:8},this.scene);b.position=new Vector3(x,(6+(i%3)*2)/2,z);b.material=buildingMat;});
  }

  async enhanceWithAssets() {
    await Promise.allSettled([
      this.assets.load('industrial-a','city/industrial/building-a.glb'),
      this.assets.load('industrial-b','city/industrial/building-b.glb'),
      this.assets.load('suburban-a','city/suburban/building-type-a.glb')
    ]);
  }

  setupFog() {
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = new Color3(.08,.09,.11);
    this.scene.fogDensity = .007;
  }
}