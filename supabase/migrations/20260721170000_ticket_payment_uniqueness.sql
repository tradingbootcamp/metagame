-- One ticket per payment. The confirm-payment route and the OpenNode webhook can
-- both be replayed (by a caller or by OpenNode's retries), so the database is the
-- last line of defense against minting duplicate tickets for one payment.
-- Partial indexes: admin-issued tickets have neither id set.
create unique index if not exists tickets_stripe_payment_id_key
  on public.tickets (stripe_payment_id)
  where stripe_payment_id is not null;

create unique index if not exists tickets_opennode_order_key
  on public.tickets (opennode_order)
  where opennode_order is not null;
