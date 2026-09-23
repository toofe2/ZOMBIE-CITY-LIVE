import { EventBus, type GameEvent } from './EventBus';

const CHANNEL = 'zombie-city-live';
const STORAGE_KEY = '__zombie_city_live_event__';

export class SimulatorBridge {
  private bc?: BroadcastChannel;
  private storageHandler?: (e: StorageEvent) => void;

  constructor(private mode: 'publisher' | 'receiver') {
    if ('BroadcastChannel' in window) {
      this.bc = new BroadcastChannel(CHANNEL);
      if (mode === 'receiver') {
        this.bc.onmessage = (e) => EventBus.emit(e.data as GameEvent);
      }
    } else if (mode === 'receiver') {
      this.storageHandler = (e) => {
        if (e.key !== STORAGE_KEY || !e.newValue) return;
        try { EventBus.emit(JSON.parse(e.newValue) as GameEvent); } catch {}
      };
      window.addEventListener('storage', this.storageHandler);
    }
  }

  publish(event: GameEvent) {
    if (this.mode !== 'publisher') return;
    EventBus.emit(event);
    if (this.bc) this.bc.postMessage(event);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...event, _t: Date.now() }));
  }

  dispose() {
    this.bc?.close();
    if (this.storageHandler) window.removeEventListener('storage', this.storageHandler);
  }
}