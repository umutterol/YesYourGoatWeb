# YesYourGoat — Run Blueprint (Human‑Readable)

This is the human‑editable outline of how runs flow, what chains exist, and when they trigger. You can tweak order, triggers, and labels here without digging through JSON files. When you’re happy, share this file back and I’ll update the packs accordingly.

Editing tips
- Triggers use the same vocabulary as event tags we already support (require:* and meter thresholds).
- Event IDs are the exact JSON ids (existing or proposed). Proposed/new items are marked [NEW] — I will author them when you approve.
- Keep the “Ending” the same (AI #47 revelation and reset in Phase 5).

Legend
- trigger: conditions to surface the beat (run>=N, meter:funds<=3, require:choice:<id>:left|right, require:seen:event:<id>, etc.)
- effects focus: which meters are primarily affected (Funds / Reputation / Readiness)
- notes: cadence, cross‑arc links, or memory hooks

---

## Phase 1 (Run 1) — Onboarding and Early Asks

| order | trigger     | label                  | description                                      | event ids (pool)                                                                                      | effects focus | notes |
|------:|-------------|------------------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------|---------------|-------|
| 01    | always      | Run Intro              | New GM; optional quick brief                     | run_intro_01 • meta_moderator_intro_01                                                                 | none          | intro/tutorial are one‑shots |
| 02    | always      | Meet Crew (Core)       | Meet Tank/Healer/DPS/Support via DMs             | intro_tank_00/01 • intro_healer_00/01 • intro_dps_00/01 • intro_support_00/01                          | none          | one‑shots; portraits shown |
| 03    | always      | Checklist              | Ready‑check etiquette                            | lore_etiquette_01                                                                                      | none          | one‑shot tutorial flavor |
| 04    | always      | Early Asks             | Healer funds / DPS priority / Support trial / Tank minimums | healer_budget_01 • dps_priority_01 • support_exp_rotation_01 • tank_standards_01              | mixed         | light ±1..±2 |
| 05    | always      | Raid Night             | Low‑stakes authored raid check                    | raid_night_check_01                                                                                   | readiness     | authored copy only |
| 06    | funds<=3    | Council Intro          | Fees due; pay vs defer                           | meta_council_01                                                                                        | funds/rep     | appears once per run |
| 07    | rep<=3      | PR Nudge [NEW]         | Quiet tone post vs ignore                         | pr_tone_post_01 [NEW]                                                                                  | reputation    | one small PR lift |
| 08    | none        | Random Filler          | Server/logistics/economy small beats             | random_invite_midpull_01 • random_maintenance_extend_01 • random_bank_short_01 • random_latency_spike_01 | mixed         | pacing only |
| 09    | until loss  | Throw Chains           | Alternate asks, randoms, and council             | (pool selection)                                                                                       | mixed         | collapse when any meter 0 |

---

## Phase 1 (Run 2) — New Roles Join

| order | trigger     | label                 | description                                      | event ids (pool)                                                                                           | effects focus | notes |
|------:|-------------|-----------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------|---------------|-------|
| 01    | always      | Run Intro             | New GM; skip brief if desired                    | run_intro_01                                                                                              | none          | intros already seen persist |
| 02    | always      | Meet New Crew         | Recruiter/Treasurer/PR/Compliance/RDPS/OT/Bad Healer/Officer | intro_recruiter_* • intro_treasurer_* • intro_pr_* • intro_compliance_* • intro_rdps_* • intro_tank2_* • intro_healer_bad_* • intro_officer_* | none | one‑shots |
| 03    | always      | New Role Asks         | First asks from new roles                        | recruiter_fill_gap_01 • treasurer_bulk_buy_01 • compliance_logs_rule_01 • rdps_utility_shift_01 • tank2_role_ask_01 • healer_bad_slot_01 • pr_streamer_request_01 | mixed | introduces new levers |
| 04    | memory      | Memory Variants       | Roles react to your past choices                 | healer_gratitude_01 • dps_resentment_01 • support_trust_01 • tank_coop_01                                 | meta          | require:choice:* |
| 05    | thresholds  | Resource Chains       | Surface chain matching low meter                 | tank_bench_02 (readiness low, Run≥3) • pr_rumor_response_02 (rep low) • (random pool)                      | mixed         | avoid back‑to‑back meta |
| 06    | until loss  | Throw Chains          | Alternate arcs + randoms until collapse          | (pool selection)                                                                                          | mixed         | collapse → summary |

---

## Phase 2 (Runs 3–4) — Subtle Wrongness + Escalations

| order | trigger       | label                 | description                              | event ids (pool)                                                                                                         | effects focus | notes |
|------:|---------------|-----------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|---------------|-------|
| 01    | run>=3        | Wrongness Seeds       | Deniable anomalies appear                | healer_repeat_dm_03 • tank_mismatch_03 • rdps_log_preexists_03 • treasurer_receipt_glitch_03 • compliance_report_glitch_03 | reputation    | subtle, rare |
| 02    | run>=3        | Escalations           | Harder versions of role asks             | dps_parse_pressure_02 • support_trial_window_02 • tank_bench_02                                                          | mixed         | require:seen prior steps |
| 03    | memory bridge | Cross‑Arc Bridges     | Choices unlock bridge events             | campaign_logs_effect_01 • economy_pr_follow_01 • rival_after_priority_01                                                 | mixed         | require:choice:* |
| 04    | until loss    | Throw Chains          | Arcs + randoms + council                 | (pool selection)                                                                                                          | mixed         | collapse → summary |

---

## Phase 3 (Runs 5–6) — Major Arcs (Deeper)

### Compliance Doctrine (Religious Tension analog)
| step | trigger                     | description                | event id                    | effects focus | notes |
|-----:|-----------------------------|----------------------------|-----------------------------|---------------|-------|
| 1    | run>=3                      | Exploit rumor              | compliance_hook_01          | ready/rep     | Councilor speaker |
| 2    | seen:hook                   | Policy sweep               | compliance_sweep_02         | rep/funds     | announce vs quiet |
| 3    | seen:sweep                  | False accusation           | compliance_false_accuse_03  | rep/ready     | protect vs suspend |
| 4    | seen:hook                   | Logs vote                  | compliance_vote_04          | ready/rep     | policy:logs |
| 5    | run>=5 & seen:sweep,vote    | Public thread (climax)     | compliance_climax_05        | rep/funds     | Bard speaker |
| 6    | seen:climax                 | Culture epilogue           | compliance_epilogue_06      | rep/funds     | small payoff |

### Tier Campaign (Wars & Military analog)
| step | trigger               | description                     | event id                 | effects focus | notes |
|-----:|-----------------------|---------------------------------|--------------------------|---------------|-------|
| 1    | run>=3                | Campaign focus                  | arc_campaign_hook_01     | ready/rep     | Tank speaker |
| 2    | seen:hook             | Extra hours                     | arc_campaign_hours_02    | funds/ready   | Officer speaker |
| 3    | seen:hours            | Mid‑tier check (outcome)        | arc_campaign_outcome_03  | ready/rep     | authored check |

### Ledger Ethics (Ethical/Moral analog)
| step | trigger       | description           | event id               | effects focus | notes |
|-----:|---------------|-----------------------|------------------------|---------------|-------|
| 1    | run>=3        | Bank error            | arc_ethics_hook_01     | rep/funds     | Devil bridge if quiet split |
| 2    | seen:hook     | Small audit           | arc_ethics_audit_02    | funds/rep     |       |
| 3    | seen:audit    | Trust note (PR)       | arc_ethics_trust_03    | funds/rep     | Bard speaker |

### Economy & Charter (Economy/Trade analog)
| step | trigger       | description         | event id                | effects focus | notes |
|-----:|---------------|---------------------|-------------------------|---------------|-------|
| 1    | run>=3        | Dues talk           | arc_economy_hook_01     | funds/rep     | Treasurer |
| 2    | seen:hook     | Sponsor offer       | arc_economy_sponsor_02  | funds/rep     |           |
| 3    | seen:hook     | PR explainer        | arc_economy_post_03     | funds/rep     | Bard |

---

## Phase 4 (Runs 7–8) — Devil as GM (Pact)

| step | trigger                         | description               | event id              | effects focus | notes |
|-----:|---------------------------------|---------------------------|-----------------------|---------------|-------|
| 1    | run>=7                          | Helpful offer             | arc_devil_hook_01     | rep/ready     | rare, weight‑capped |
| 2    | choice:hook=right               | Marker (pay now/later)    | arc_devil_marker_02   | funds/rep     | early if ethics quiet split |
| 3    | run>=9                          | Memory line               | arc_devil_memory_03   | reputation    | meta flavor |

---

## Phase 5 (Run ≥ 9) — Revelation & Reset (Ending stays the same)

| step | trigger   | description                        | event id(s)                | notes |
|-----:|-----------|------------------------------------|----------------------------|-------|
| R    | run>=9    | Explicit system overlay + reset    | (narrative system overlay) | Reveals AI #47 and resets to “new GM” |

---

## Resource Threshold Matrix (Quick Routing)

| resource low | Prefer chain(s)                                                                 | fallback |
|--------------|----------------------------------------------------------------------------------|----------|
| Funds ≤ 3    | meta_council_01 • arc_economy_* • treasurer_bulk_buy_01                         | random:economy |
| Reputation ≤ 3 | pr_rumor_response_02 • compliance_climax_05 • lore_etiquette_01 (soft reset tone) | random:community |
| Readiness ≤ 3 | tank_bench_02 • raid_night_check_* • rdps_utility_shift_01                      | random:logistics |

---

## Memory & Cross‑Arc Bridges (Selected)

| trigger choice                        | bridge event id               | effect | link |
|---------------------------------------|-------------------------------|--------|------|
| healer_budget_01:left                 | healer_gratitude_01           | +Rep   | Healer thanks |
| dps_priority_01:left                  | dps_resentment_01             | ±Ready | Parse pressure |
| support_exp_rotation_01:right         | support_trust_01              | ±Ready | “I’ll clear it” |
| tank_standards_01:left                | tank_coop_01                  | +Rep   | Coaching vs bench |
| compliance_vote_04:left               | campaign_logs_effect_01       | ±Ready | Cleaner pulls |
| arc_economy_hook_01:left              | economy_pr_follow_01          | +Rep   | PR follow |
| dps_priority_01:right                 | rival_after_priority_01       | −Rep   | Rival taunt |
| arc_ethics_hook_01:right              | devil_marker_early_01         | −Rep   | Devil marker earlier |

---

## Run Loop Template (Pseudo)

1) Inject raid_night_check every 3rd event (authored outcome).  
2) If any `priority` chain step is eligible, draw from that pool.  
3) Else route by resource thresholds (see matrix).  
4) Else draw from `random_pool` with soft cooldown.  
5) Always respect require:* gates and one‑shot intros/tutorials.  

---

## Proposed New Beats ([NEW], pending authoring)

| phase | label                     | description                                    | proposed id              | trigger |
|------:|---------------------------|------------------------------------------------|--------------------------|---------|
| 1     | PR Nudge                 | Quiet tone post to reduce early friction       | pr_tone_post_01 [NEW]    | rep≤3   |
| 2     | Officer Politics         | Policy announce vs adjust, then mediation      | officer_policy_02 [NEW]  | run>=3  |
| 3     | Training & Burnout       | Break scheduling; cooldown audits; burnout ask | heal_break_03 [NEW]      | run>=5  |
| 3     | Recruitment Drive        | Borderline trials; +1 requests; standards note | recruiter_drive_03 [NEW] | run>=5  |

Approve any of the [NEW] items and I’ll add them to packs with portraits, tags, and effects.

