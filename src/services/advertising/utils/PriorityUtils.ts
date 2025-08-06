
export class PriorityUtils {
  static getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  static sortByPriority<T extends { priority: string }>(items: T[]): T[] {
    return items.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }
}
