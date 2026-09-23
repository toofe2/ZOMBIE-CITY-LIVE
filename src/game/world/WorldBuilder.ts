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
    roadA.position.y=.03; roadA.material=roadMat;

    const roadB = MeshBuilder.CreateBox('roadB',{width:64,height:.05,depth:12},this.scene);
    roadB.position.y=.031; roadB.material=roadMat;

    const sidewalkMat = new StandardMaterial('sidewalkMat',this.scene);
    sidewalkMat.diffuseColor = new Color3(.22,.24,.27);

    [-7,7].forEach(x=>{
      const s = MeshBuilder.CreateBox('sidewalk-x-'+x,{width:2,height:.12,depth:64},this.scene);
      s.position = new Vector3(x,.06,0); s.material = sidewalkMat;
    });
    [-7,7].forEach(z=>{
      const s = MeshBuilder.CreateBox('sidewalk-z-'+z,{width:64,height:.12,depth:2},this.scene);
      s.position = new Vector3(0,.061,z); s.material = sidewalkMat;
    });

    const buildingMat = new StandardMaterial('fallbackBuildingMat',this.scene);
    buildingMat.diffuseColor = new Color3(.24,.28,.33);

    const positions = [
      [-20,-20,8,8,7],[20,-20,9,8,9],[-20,20,8,10,8],[20,20,10,8,10],
      [-22,0,8,10,6],[22,0,8,10,7],[0,-22,10,8,8],[0,22,10,8,9]
    ];

    positions.forEach(([x,z,w,d,h],i)=>{
      const b=MeshBuilder.CreateBox('fallbackBuilding'+i,{width:w,height:h,depth:d},this.scene);
      b.position=new Vector3(x,h/2,z);
      b.material=buildingMat;
      b.metadata = { fallbackCity: true };
    });

    const safeMat = new StandardMaterial('safeZoneMat',this.scene);
    safeMat.diffuseColor = new Color3(.18,.38,.28);
    const safe = MeshBuilder.CreateCylinder('heroSafeEntry',{diameter:5,height:.08,tessellation:32},this.scene);
    safe.position = new Vector3(0,.05,0); safe.material = safeMat;

    const spawnMat = new StandardMaterial('spawnMarkerMat',this.scene);
    spawnMat.diffuseColor = new Color3(.4,.12,.12);
    [[0,-29],[29,0],[0,29],[-29,0]].forEach(([x,z],i)=>{
      const marker = MeshBuilder.CreateCylinder('zombieEntry'+i,{diameter:2,height:.05,tessellation:24},this.scene);
      marker.position = new Vector3(x,.04,z); marker.material = spawnMat;
    });
  }

  async enhanceWithAssets() {
    const specs = [
      ['industrial-a','city/industrial/building-a.glb'],
      ['industrial-d','city/industrial/building-d.glb'],
      ['industrial-l','city/industrial/building-l.glb'],
      ['container-a','city/industrial/shipping-container-a.glb'],
      ['water-tower','city/industrial/water-tower.glb'],
      ['suburban-a','city/suburban/building-type-a.glb'],
      ['suburban-d','city/suburban/building-type-d.glb'],
      ['suburban-h','city/suburban/building-type-h.glb'],
      ['tree-large','city/suburban/tree-large.glb'],
      ['fence','city/suburban/fence-1x3.glb']
    ] as const;

    await Promise.all(specs.map(([key,path])=>this.assets.load(key,path)));

    if (this.assets.loaded < 3) return;

    for (const mesh of this.scene.meshes) {
      if (mesh.metadata?.fallbackCity) mesh.setEnabled(false);
    }

    const place = (key:string,name:string,x:number,z:number,rot=0,scale=1)=>{
      const node = this.assets.createInstance(key,name);
      if (!node) return;
      node.position = new Vector3(x,0,z);
      node.rotation.y = rot;
      node.scaling.setAll(scale);
    };

    place('suburban-a','suburban-a-1',-20,-20,Math.PI/2,1);
    place('suburban-d','suburban-d-1',20,-20,-Math.PI/2,1);
    place('suburban-h','suburban-h-1',-20,20,Math.PI,1);
    place('suburban-a','suburban-a-2',20,20,0,1);

    place('industrial-a','industrial-a-1',22,1,-Math.PI/2,1);
    place('industrial-d','industrial-d-1',22,13,-Math.PI/2,1);
    place('industrial-l','industrial-l-1',18,-12,Math.PI,1);
    place('water-tower','water-tower-1',27,22,0,1);

    place('container-a','container-a-1',15,7,0,1);
    place('container-a','container-a-2',17,7,0,1);
    place('container-a','container-a-3',19,7,0,1);

    place('tree-large','tree-1',-14,14,0,1);
    place('tree-large','tree-2',-25,10,0,1);
    place('tree-large','tree-3',-12,-15,0,1);

    place('fence','fence-1',12,13,0,1);
    place('fence','fence-2',15,13,0,1);
    place('fence','fence-3',18,13,0,1);
  }

  setupFog() {
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = new Color3(.08,.09,.11);
    this.scene.fogDensity = .007;
  }
}