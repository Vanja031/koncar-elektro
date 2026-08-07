/**
 * Server-only: reconcile a WooCommerce order's status against the
 * authoritative RaiAccept order status. Used by both the browser redirect-back
 * landing route and the RaiAccept webhook — both just call this, keyed by the
 * WC order id, so re-invoking it (e.g. webhook arrives after the browser
 * already reconciled) is idempotent and safe.
 */
import { getOrderMeta, getWcOrder, updateWcOrder, type WcOrderV3 } from '@/lib/api/wc-rest/orders';
import { getOrderDetails, type RaiAcceptOrderStatus } from '@/lib/payments/raiaccept';

export type ReconcileResult = {
  wcOrder: WcOrderV3;
  raiAcceptStatus: RaiAcceptOrderStatus;
  /** Simplified status for the frontend result page. */
  outcome: 'paid' | 'failed' | 'cancelled' | 'pending';
};

const RAIACCEPT_ORDER_META_KEY = '_raiaccept_order_id';

function mapStatus(status: RaiAcceptOrderStatus): {
  outcome: ReconcileResult['outcome'];
  wcStatus?: 'processing' | 'failed' | 'cancelled';
  setPaid?: boolean;
  note: string;
} {
  switch (status) {
    case 'PAID':
      return {
        outcome: 'paid',
        wcStatus: 'processing',
        setPaid: true,
        note: 'RaiAccept: plaćanje uspešno — porudžbina potvrđena.',
      };
    case 'FAILED':
      return { outcome: 'failed', wcStatus: 'failed', note: 'RaiAccept: plaćanje nije uspelo.' };
    case 'CANCELED':
    case 'ABANDONED':
      return { outcome: 'cancelled', wcStatus: 'cancelled', note: 'RaiAccept: kupac je otkazao/napustio plaćanje.' };
    case 'PARTIALLY_REFUNDED':
    case 'FULLY_REFUNDED':
      // Refunds are handled separately (Merchant portal) — don't touch order status here.
      return { outcome: 'paid', note: `RaiAccept: status ${status}.` };
    case 'DRAFT':
    case 'CHECKOUT':
    default:
      return { outcome: 'pending', note: `RaiAccept: status ${status} (plaćanje u toku ili nezavršeno).` };
  }
}

/**
 * Looks up the RaiAccept order for a given WC order id, checks its
 * authoritative status, and updates the WC order accordingly (skips the
 * write if the WC order is already in the target status).
 */
export async function reconcileRaiAcceptOrder(wcOrderId: string | number): Promise<ReconcileResult> {
  const wcOrder = await getWcOrder(wcOrderId);
  const raOrderId = getOrderMeta(wcOrder, RAIACCEPT_ORDER_META_KEY);

  if (!raOrderId) {
    throw new Error(`WC order ${wcOrderId} has no linked RaiAccept order id (${RAIACCEPT_ORDER_META_KEY}).`);
  }

  const raOrder = await getOrderDetails(raOrderId);
  const { outcome, wcStatus, setPaid, note } = mapStatus(raOrder.status);

  let finalOrder = wcOrder;
  if (wcStatus && wcOrder.status !== wcStatus) {
    finalOrder = await updateWcOrder(wcOrderId, {
      status: wcStatus,
      transaction_id: raOrderId,
      ...(setPaid ? { set_paid: true } : {}),
      note,
    });
  }

  return { wcOrder: finalOrder, raiAcceptStatus: raOrder.status, outcome };
}
