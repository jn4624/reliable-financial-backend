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

CREATE TABLE payout_status_history
(
    id          text PRIMARY KEY,
    payout_id   text        NOT NULL REFERENCES payouts (id),
    from_status text,
    to_status   text        NOT NULL,
    reason      text        NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE outbox_messages
(
    id             text PRIMARY KEY,
    aggregate_type text        NOT NULL,
    aggregate_id   text        NOT NULL REFERENCES payouts (id),
    type           text        NOT NULL,
    payload        jsonb       NOT NULL,
    status         text        NOT NULL DEFAULT 'PENDING',
    attempts       integer     NOT NULL DEFAULT 0,
    available_at   timestamptz NOT NULL DEFAULT NOW(),
    locked_by      text,
    published_at   timestamptz,
    last_error     text,
    created_at     timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE (aggregate_type, aggregate_id, type)
);
