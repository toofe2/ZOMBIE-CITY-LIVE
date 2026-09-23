export type GameEvent =
  | { type: 'comment'; username: string; comment: string }
  | { type: 'gift'; username: string; giftName: string; giftValue: number }
  | { type: 'toggle-day-night' }
  | { type: 'spawn-zombie'; username?: string; count?: number }
  | { type: 'spawn-hero'; username?: string; level: number };

type Handler = (event: GameEvent) => void;

class EventBusImpl {
  private handlers = new Set<Handler>();
  on(handler: Handler) { this.handlers.add(handler); return () => this.handlers.delete(handler); }
  emit(event: GameEvent) { for (const h of [...this.handlers]) h(event); }
}
export const EventBus = new EventBusImpl();