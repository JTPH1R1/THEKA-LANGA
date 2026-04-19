CREATE TABLE sacco.group_rules (
  group_id                      uuid         PRIMARY KEY REFERENCES sacco.groups(id) ON DELETE CASCADE,
  contribution_amount           bigint       NOT NULL CHECK (contribution_amount > 0),
  contribution_frequency        text         NOT NULL CHECK (contribution_frequency IN ('weekly','biweekly','monthly')),
  contribution_day              smallint,
  grace_period_days             smallint     NOT NULL DEFAULT 3 CHECK (grace_period_days >= 0),
  late_fine_flat                bigint       NOT NULL DEFAULT 0 CHECK (late_fine_flat >= 0),
  late_fine_interest_rate_daily numeric(6,4) NOT NULL DEFAULT 0,
  initiation_fee                bigint       NOT NULL DEFAULT 0,
  late_joining_fee              bigint       NOT NULL DEFAULT 0,
  mid_join_allowed              boolean      NOT NULL DEFAULT true,
  mid_join_deadline_weeks       smallint     NOT NULL DEFAULT 4 CHECK (mid_join_deadline_weeks > 0),
  max_members                   smallint,
  min_kyc_level                 smallint     NOT NULL DEFAULT 1 CHECK (min_kyc_level IN (0,1,2,3)),
  loan_enabled                  boolean      NOT NULL DEFAULT true,
  max_loan_multiplier           numeric(5,2) NOT NULL DEFAULT 3.00 CHECK (max_loan_multiplier > 0),
  loan_interest_rate            numeric(6,3) NOT NULL DEFAULT 10.000,
  loan_interest_type            text         NOT NULL DEFAULT 'flat'
                                             CHECK (loan_interest_type IN ('flat','reducing_balance')),
  loan_repayment_periods        smallint     NOT NULL DEFAULT 3 CHECK (loan_repayment_periods > 0),
  loan_processing_fee_rate      numeric(5,2) NOT NULL DEFAULT 2.00,
  max_active_loans_per_member   smallint     NOT NULL DEFAULT 1,
  guarantor_required            boolean      NOT NULL DEFAULT true,
  guarantors_required_count     smallint     NOT NULL DEFAULT 2,
  min_guarantor_credit_score    smallint     DEFAULT 500,
  default_threshold_days        smallint     NOT NULL DEFAULT 30,
  default_penalty_rate          numeric(5,2) NOT NULL DEFAULT 5.00,
  blacklist_recommendation_after smallint   NOT NULL DEFAULT 3,
  dividend_distribution         text         NOT NULL DEFAULT 'proportional'
                                             CHECK (dividend_distribution IN ('equal','proportional','none')),
  rules_version                 smallint     NOT NULL DEFAULT 1,
  last_changed_by               uuid         REFERENCES core.profiles(id),
  created_at                    timestamptz  NOT NULL DEFAULT now(),
  updated_at                    timestamptz  NOT NULL DEFAULT now()
);

CREATE TRIGGER set_sacco_group_rules_updated_at
  BEFORE UPDATE ON sacco.group_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
