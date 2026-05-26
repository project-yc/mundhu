# Recruiter Report Detail Manual Verification Checklist

Use this checklist after loading a recruiter report detail page.

## Review Required State

- Load a report whose review policy is `requires_human_review`.
- Confirm the hero shows a prominent review-status badge before the overall score.
- Confirm the reasons list is visible and readable without expanding another section.
- Confirm the overall score remains visible but is visually secondary to the review-required state.
- Confirm there is no hire or no-hire banner.

## Clear State

- Load a report whose review policy is `clear`.
- Confirm the hero shows a clear-status badge.
- Confirm no warning reasons list is shown.
- Confirm the overall score remains the primary numeric summary when no review is required.

## Authorship Metric

- Load a report with `authorship_metrics.independent_authorship_ratio_net` present.
- Confirm the hero shows an `Independent Authorship` metric with a percentage label.
- Confirm the metric copy explains it as candidate-authored retained code vs accepted AI code.

## Narrative Separation

- Confirm deterministic review policy content appears in the hero and is not merged into the AI assessment cards.
- Confirm coding dimension cards appear under the `AI And Narrative Assessments` heading.
- Confirm behavioral evidence, growth edges, and interview probes still render below that section when present.