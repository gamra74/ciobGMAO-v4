// ✅ ملف: src/core/domain/services/IncrementalStockIndex.ts

export interface StockMovementItem {
  itemId?: string;
  ref?: string;
  type: 'IN' | 'OUT' | 'Entrée' | 'Sortie' | string;
  quantity?: number;
  quantite?: number;
  [key: string]: any;
}

/**
 * Incremental Stock Index
 * ✅ فهرسة تزايدية عالية الأداء للمخزون بـ O(1) للقراءة والتحديث و O(N) للبناء الأولي
 */
export class IncrementalStockIndex {
  private stockMap: Map<string, number> = new Map();
  private movementIndex: Map<string, Array<StockMovementItem>> = new Map();

  /**
   * بناء الفهرس الأولي (O(N))
   */
  buildIndex(
    movements: Array<StockMovementItem>,
    initialStocks: Map<string, number> | Record<string, number> = new Map()
  ): void {
    // تهيئة المخزون الأولي
    if (initialStocks instanceof Map) {
      this.stockMap = new Map(initialStocks);
    } else if (typeof initialStocks === 'object' && initialStocks !== null) {
      this.stockMap = new Map(
        Object.entries(initialStocks).map(([k, v]) => [k, Number(v) || 0])
      );
    } else {
      this.stockMap = new Map();
    }

    // بناء فهرس الحركات
    this.movementIndex.clear();

    if (!Array.isArray(movements)) return;

    for (let i = 0; i < movements.length; i++) {
      const movement = movements[i];
      if (!movement) continue;

      const itemId = String(movement.itemId ?? movement.ref ?? '').trim();
      if (!itemId) continue;

      if (!this.movementIndex.has(itemId)) {
        this.movementIndex.set(itemId, []);
      }

      this.movementIndex.get(itemId)!.push(movement);

      const qty = Number(movement.quantity ?? movement.quantite ?? 0);
      if (!Number.isFinite(qty) || qty === 0) continue;

      const currentStock = this.stockMap.get(itemId) || 0;
      const typeStr = String(movement.type || '').toUpperCase();
      const isEntry = typeStr === 'IN' || typeStr.includes('ENTR') || typeStr === 'RECEPTION' || typeStr === 'RETOUR';

      const newStock = isEntry ? currentStock + qty : currentStock - qty;
      this.stockMap.set(itemId, Math.max(0, newStock));
    }
  }

  /**
   * الحصول على المخزون الحالي لعنصر معين (O(1))
   */
  getStock(itemId: string): number {
    if (!itemId) return 0;
    return this.stockMap.get(String(itemId).trim()) || 0;
  }

  /**
   * الحصول على نسخة من جميع المخزونات
   */
  getAllStocks(): Map<string, number> {
    return new Map(this.stockMap);
  }

  /**
   * إضافة حركة جديدة تزايدياً بـ O(1)
   */
  addMovement(movement: StockMovementItem): void {
    if (!movement) return;
    const itemId = String(movement.itemId ?? movement.ref ?? '').trim();
    if (!itemId) return;

    if (!this.movementIndex.has(itemId)) {
      this.movementIndex.set(itemId, []);
    }

    this.movementIndex.get(itemId)!.push(movement);

    const qty = Number(movement.quantity ?? movement.quantite ?? 0);
    if (!Number.isFinite(qty) || qty === 0) return;

    const currentStock = this.stockMap.get(itemId) || 0;
    const typeStr = String(movement.type || '').toUpperCase();
    const isEntry = typeStr === 'IN' || typeStr.includes('ENTR') || typeStr === 'RECEPTION' || typeStr === 'RETOUR';

    const newStock = isEntry ? currentStock + qty : currentStock - qty;
    this.stockMap.set(itemId, Math.max(0, newStock));
  }

  /**
   * الحصول على حركات عنصر معين بـ O(1)
   */
  getMovements(itemId: string): Array<StockMovementItem> {
    if (!itemId) return [];
    return this.movementIndex.get(String(itemId).trim()) || [];
  }

  /**
   * تفريغ الفهرس
   */
  clear(): void {
    this.stockMap.clear();
    this.movementIndex.clear();
  }
}

export default IncrementalStockIndex;
