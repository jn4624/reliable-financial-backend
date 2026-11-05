CREATE TABLE payouts
(
    id                  text PRIMARY KEY,
    idempotency_key     text           NOT NULL UNIQUE,
    merchant_id         text           NOT NULL,
    recipient_address   text           NOT NULL,
    amount_atomic       numeric(78, 0) NOT NULL CHECK (amount_atomic > 0),
    request_fingerprint text           NOT NULL,
    status              text           NOT NULL CHECK (status IN
                                                       ('REQUESTED', 'AWAITING_CONFIRMATION', 'SETTLED', 'FAILED',
                                                        'REQUIRES_REVIEW')),
    created_at          timestamptz    NOT NULL DEFAULT NOW()
);
