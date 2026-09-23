export interface PendingZombie { username: string; comment: string; }
export class CommentSpawnQueue {
  private q: PendingZombie[] = [];
  enqueue(item: PendingZombie) { this.q.push(item); }
  get size() { return this.q.length; }
  drain(max: number) { return this.q.splice(0, Math.max(0, max)); }
  clear() { this.q.length = 0; }
}