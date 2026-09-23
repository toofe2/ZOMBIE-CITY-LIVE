import '@babylonjs/loaders/glTF';
import { SceneLoader, TransformNode, type Scene } from '@babylonjs/core';

export const ASSET_BASE = 'https://cdn.jsdelivr.net/gh/toofe2/ZOMBIE-CITY-LIVE-ASSETS@main/assets/';

export class CityAssetLibrary {
  private templates = new Map<string, TransformNode>();
  loaded = 0;
  failed = 0;

  constructor(private scene: Scene) {}

  async load(key: string, path: string) {
    if (this.templates.has(key)) return this.templates.get(key)!;
    try {
      const result = await SceneLoader.ImportMeshAsync('', ASSET_BASE, path, this.scene);
      const root = new TransformNode(`tpl-${key}`, this.scene);
      for (const mesh of result.meshes) if (mesh.parent == null) mesh.parent = root;
      root.setEnabled(false);
      this.templates.set(key, root);
      this.loaded++;
      return root;
    } catch (err) {
      this.failed++;
      console.warn('[CityAssetLibrary] asset failed:', path, err);
      return null;
    }
  }

  createInstance(key: string, name: string) {
    const tpl = this.templates.get(key);
    if (!tpl) return null;
    const clone = tpl.clone(name, null);
    clone?.setEnabled(true);
    return clone;
  }
}