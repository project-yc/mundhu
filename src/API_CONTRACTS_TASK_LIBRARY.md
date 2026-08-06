# Task Library — API Contracts

## Overview

Two libraries exist:

| Library | `org` field | Who manages | How to access |
|---|---|---|---|
| **Trudev Library** | `org = null` | Admin | `GET /v1/library/trudev` |
| **My Library** | `org = <org_id>` | Recruiter | `GET /v1/library/my` |

All items are `AssessmentItem` records. The `content_type` determines what subtype data is nested:

| `content_type` | Nested key | Description |
|---|---|---|
| `mcq` | `.mcq` / `.type_data` | Multiple choice with options |
| `free_text` | `.free_text` / `.type_data` | Open-ended text response |
| `ranking` | `.ranking` / `.type_data` | Rank items in correct order |
| `technical_task` | `.technical_task` / `.type_data` | Coding task (local zip or git) |

**Authentication**: All endpoints require `Authorization: Bearer <JWT>`. The JWT contains `org_id` and `role`.

---

## Common Enums

```
difficulty:    easy | medium | hard
seniority:     junior | mid | senior | staff | principal
domain:        backend | frontend | fullstack | devops | data | data_science |
               ai_ml | llm_engineering | mlops | mobile | security
content_type:  mcq | free_text | ranking | technical_task
```

---

## 1. Trudev Library (Public Curated)

Browse admin-published items available to all orgs.

### 1.1 Browse Trudev Library

```
GET /api/v1/library/trudev
```

**Query Parameters** (all optional):

| Param | Type | Example | Notes |
|---|---|---|---|
| `content_type` | string | `mcq` | Filter by question type |
| `difficulty` | string | `medium` | |
| `seniority` | string | `senior` | |
| `domain` | string | `backend` | |
| `language` | string | `python` | Case-insensitive |
| `tag` | string | `simulation` | Matches tags array (use for scenario/simulation filter) |
| `estimated_time_min` | int | `15` | Minimum time in minutes |
| `estimated_time_max` | int | `60` | Maximum time in minutes |
| `search` | string | `reverse` | Searches title |

**Response** `200`:

```json
{
  "success": true,
  "message": "Trudev library tasks",
  "data": [
    {
      "id": "uuid",
      "content_type": "mcq",
      "title": "Python List Comprehensions",
      "difficulty": "medium",
      "seniority": "mid",
      "domain": "backend",
      "language": "python",
      "tags": ["python", "basics"],
      "estimated_time_minutes": 10,
      "type_data": {
        "prompt": "What does [x*2 for x in range(5)] return?",
        "selection_mode": "single",
        "explanation": null,
        "shuffle_options": false,
        "show_explanation_after": false,
        "options": [
          { "id": "uuid", "text": "[0,2,4,6,8]", "order_index": 0, "is_correct": true, "points": "1.00" },
          { "id": "uuid", "text": "[1,2,3,4,5]", "order_index": 1, "is_correct": false, "points": "0.00" }
        ]
      },
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**When to use**: Recruiter browses available tasks to attach to their assessment. Filter by `tag=simulation` to show scenario-based questions.

---

### 1.2 View Trudev Item Detail

```
GET /api/v1/library/trudev/<item_id>
```

**Response** `200` — Same shape as browse but full detail:

```json
{
  "success": true,
  "message": "Trudev library item",
  "data": {
    "id": "uuid",
    "content_type": "mcq",
    "title": "...",
    "difficulty": "medium",
    "seniority": "mid",
    "domain": "backend",
    "language": "python",
    "tags": ["..."],
    "visibility": "public",
    "grading_strategy": "auto",
    "is_published": true,
    "is_locked": false,
    "is_system_published": true,
    "estimated_time_minutes": 10,
    "org_id": null,
    "type_data": { /* same as browse */ },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**When to use**: View full details before cloning or attaching.

---

### 1.3 Clone to My Library

```
POST /api/v1/library/trudev/<item_id>/clone
```

Takes a Trudev item and creates a copy in the recruiter's org library. Optionally override fields during copy.

**Request Body** (all optional):

```json
{
  "title": "Custom Title Override",
  "difficulty": "hard",
  "seniority": "senior",
  "tags": ["simulation", "custom-tag"],
  "estimated_time_minutes": 20
}
```

**Response** `201`:

```json
{
  "success": true,
  "message": "Item cloned to My Library",
  "data": { /* full LibraryItemReadSerializer output */ }
}
```

**Validation**: Returns `404` if source item not found or not system-published.

**When to use**: Recruiter wants to customize a Trudev item before attaching it. Clone first, then edit the clone in My Library.

---

## 2. My Library (Org-Scoped)

Full CRUD for the org's custom task library.

### 2.1 List My Library

```
GET /api/v1/library/my
```

Same query parameters as Trudev browse (Section 1.1). Scoped to `org_id` from JWT.

**Response** `200` — Same shape as Trudev browse.

**When to use**: Recruiter views their org's saved tasks.

---

### 2.2 Create Item

```
POST /api/v1/library/my
```

Creates a new item in the org's library. **Request body varies by `content_type`.**

#### MCQ Request:

```json
{
  "content_type": "mcq",
  "title": "Python List Comprehensions",
  "difficulty": "medium",
  "seniority": "mid",
  "domain": "backend",
  "language": "python",
  "tags": ["python", "basics"],
  "estimated_time_minutes": 10,
  "mcq": {
    "prompt": "What does [x*2 for x in range(5)] return?",
    "selection_mode": "single",
    "explanation": "List comprehension iterates over range(5) giving 0,1,2,3,4, doubling each.",
    "shuffle_options": false,
    "show_explanation_after": false,
    "options": [
      { "text": "[0,2,4,6,8]", "is_correct": true, "points": 1 },
      { "text": "[1,2,3,4,5]", "is_correct": false, "points": 0 },
      { "text": "[0,1,2,3,4]", "is_correct": false, "points": 0 },
      { "text": "[2,4,6,8,10]", "is_correct": false, "points": 0 }
    ]
  }
}
```

**Validation**: `mcq.prompt` required, `mcq.selection_mode` defaults to `"single"`.

---

#### Free Text Request:

```json
{
  "content_type": "free_text",
  "title": "Explain Dependency Injection",
  "difficulty": "medium",
  "seniority": "mid",
  "domain": "backend",
  "language": "",
  "tags": ["architecture"],
  "estimated_time_minutes": 15,
  "free_text": {
    "prompt": "Explain the Dependency Injection pattern and its benefits in a microservice architecture.",
    "word_limit": 500,
    "grading_hints": "Look for: inversion of control, testability, decoupling"
  }
}
```

**Validation**: `free_text.prompt` required.

---

#### Ranking Request:

```json
{
  "content_type": "ranking",
  "title": "Sort Algorithms by Complexity",
  "difficulty": "easy",
  "seniority": "junior",
  "domain": "backend",
  "language": "",
  "tags": ["algorithms"],
  "estimated_time_minutes": 5,
  "ranking": {
    "prompt": "Rank these sorting algorithms from best to worst average time complexity.",
    "scoring_mode": "exact_match",
    "items": [
      { "text": "Quick Sort" },
      { "text": "Bubble Sort" },
      { "text": "Merge Sort" },
      { "text": "Insertion Sort" }
    ]
  }
}
```

**Validation**: `ranking.prompt` required. `scoring_mode`: `"exact_match"` or `"weighted_partial"`. Items auto-assigned `correct_rank` by order in array (first = rank 1).

---

#### Technical Task Request:

```json
{
  "content_type": "technical_task",
  "title": "Build a REST API",
  "difficulty": "medium",
  "seniority": "mid",
  "domain": "backend",
  "language": "python",
  "tags": ["api", "flask"],
  "estimated_time_minutes": 45,
  "technical_task": {
    "source_type": "git",
    "git_repo_url": "https://github.com/example/task-repo",
    "git_branch": "main",
    "runtime_config_json": { "port": 8080 }
  }
}
```

**Validation**: If `source_type` is `"git"`, `git_repo_url` and `git_branch` are required. URL must match `https://github.com/[owner]/[repo]`.

---

**Response** `201` for all create operations:

```json
{
  "success": true,
  "message": "Item created in My Library",
  "data": { /* full LibraryItemReadSerializer output */ }
}
```

---

### 2.3 Edit Item

```
PATCH /api/v1/library/my/<item_id>
```

Same request body structure as create, but all fields optional. Send only what you want to change.

```json
{
  "title": "Updated Title",
  "difficulty": "hard",
  "tags": ["updated-tag"],
  "mcq": {
    "prompt": "Updated question text",
    "options": [
      { "text": "New option A", "is_correct": true, "points": 2 },
      { "text": "New option B", "is_correct": false, "points": 0 }
    ]
  }
}
```

**Notes**:
- Updating `options` on MCQ **replaces** all existing options (deletes old, creates new)
- Updating `items` on Ranking **replaces** all existing items
- Only send the `content_type` sub-object if you want to update type-specific data

**Response** `200`:

```json
{
  "success": true,
  "message": "Item updated",
  "data": { /* full updated item */ }
}
```

---

### 2.4 Delete Item

```
DELETE /api/v1/library/my/<item_id>
```

Soft delete. Item is no longer visible in lists.

**Response** `204`:

```json
{
  "success": true,
  "message": "Item deleted",
  "data": null
}
```

---

## 3. Attach Items to Assessment

Link library items (from either Trudev or My Library) to an assessment.

### 3.1 Attach Item

```
POST /api/v1/assessments/<assessment_id>/library-items
```

**Request Body**:

```json
{
  "assessment_item_id": "uuid-of-the-item",
  "section_id": "uuid-of-section (optional)",
  "order": 0,
  "points": 100
}
```

| Field | Required | Default | Notes |
|---|---|---|---|
| `assessment_item_id` | Yes | — | UUID of the `AssessmentItem` |
| `section_id` | No | auto-resolved | Which section to attach to. If omitted, uses the default section (auto-creates one if none exists) |
| `order` | No | `0` | Display order within the section |
| `points` | No | resolved from item | Score value for this item. If omitted, auto-resolves from item metadata, defaults to 100 |

**Response** `201`:

```json
{
  "success": true,
  "message": "Library item attached to assessment",
  "data": {
    "id": "section-item-uuid",
    "section_id": "section-uuid",
    "assessment_item_id": "item-uuid",
    "order": 0,
    "points": 100
  }
}
```

**Errors**:
- `400` — `assessment_item_id` missing, invalid order/points, or item already attached to that section
- `404` — Assessment or item not found / not in same org

---

### 3.2 List Attached Items

```
GET /api/v1/assessments/<assessment_id>/library-items
```

**Response** `200`:

```json
{
  "success": true,
  "message": "Attached items",
  "data": [
    {
      "id": "section-item-uuid",
      "section_id": "section-uuid",
      "assessment_item_id": "item-uuid",
      "order": 0,
      "points": 100,
      "assessment_item": {
        "id": "item-uuid",
        "content_type": "mcq",
        "title": "Python List Comprehensions",
        "difficulty": "medium",
        "tags": ["python"]
      }
    }
  ]
}
```

---

### 3.3 Detach Item

```
DELETE /api/v1/assessments/<assessment_id>/library-items/<section_item_id>
```

Note: `<section_item_id>` is the ID from the attach response, **not** the `assessment_item_id`.

**Response** `204`:

```json
{
  "success": true,
  "message": "Item detached",
  "data": null
}
```

---

## 4. Filter Options (Dropdown Values)

```
GET /api/v1/library/filter-options
```

Returns available values for building filter dropdowns.

**Response** `200`:

```json
{
  "success": true,
  "message": "Filter options",
  "data": {
    "content_types": [
      { "value": "mcq", "label": "MCQ" },
      { "value": "free_text", "label": "Free Text" },
      { "value": "ranking", "label": "Ranking" },
      { "value": "technical_task", "label": "Technical Task" }
    ],
    "difficulties": [
      { "value": "easy", "label": "Easy" },
      { "value": "medium", "label": "Medium" },
      { "value": "hard", "label": "Hard" }
    ],
    "seniorities": [
      { "value": "junior", "label": "Junior" },
      { "value": "mid", "label": "Mid" },
      { "value": "senior", "label": "Senior" },
      { "value": "staff", "label": "Staff" },
      { "value": "principal", "label": "Principal" }
    ],
    "domains": [
      { "value": "backend", "label": "Backend" },
      { "value": "frontend", "label": "Frontend" },
      { "value": "fullstack", "label": "Full Stack" },
      { "value": "devops", "label": "DevOps" },
      { "value": "data", "label": "Data" },
      { "value": "data_science", "label": "Data Science" },
      { "value": "ai_ml", "label": "ML Engineering" },
      { "value": "llm_engineering", "label": "LLM Engineering" },
      { "value": "mlops", "label": "MLOps" },
      { "value": "mobile", "label": "Mobile" },
      { "value": "security", "label": "Security" }
    ]
  }
}
```

**When to use**: On page load to populate filter dropdowns. No auth required beyond being a recruiter/admin.

---

## 4b. Technical Task Files (Code Viewer)

```
GET /api/v1/library/items/<item_id>/files
```

Returns the **candidate-visible starter files** of a `technical_task`, so the UI can
show the repo read-only without provisioning a sandbox. Resolves items that are either
system-published (Trudev) or owned by the caller's org.

> Hidden tests, the reference solution and the internal `TASK_SPEC.md` live in the
> grader bundle and are **never** returned by this endpoint.

**Response** `200`:

```json
{
  "success": true,
  "message": "Task files",
  "data": {
    "entry_file": "TICKET.md",
    "truncated": false,
    "source": { "type": "local", "bundle_key": "tasks/<uuid>/<task>-starter.zip" },
    "files": [
      {
        "path": "app/api.py",
        "size": 1042,
        "language": "python",
        "content": "def get_at_risk_page(...):\n    ...",
        "skipped": null
      },
      {
        "path": "assets/logo.png",
        "size": 20481,
        "language": "text",
        "content": null,
        "skipped": "binary"
      }
    ],
    "item": { /* full LibraryItemReadSerializer output */ }
  }
}
```

| Field | Notes |
|---|---|
| `entry_file` | Best file to open first — prefers `TICKET.md`, then `README.md`, `WORLD_BRIEF.md`, `DECISIONS.md` |
| `truncated` | `true` when the repo exceeded the file-count or total-size budget |
| `files[].content` | `null` when `skipped` is set |
| `files[].skipped` | `binary` \| `too_large` (>256 KB) \| `budget_exceeded` (>12 MB total) \| `null` |
| `source.type` | `local` (zip bundle) or `git` — for `git`, `files` is empty and `source` carries the repo ref |

**Errors**: `400` if the item isn't a technical task; `404` if not found, not in the
caller's org, or no starter bundle is attached.

**When to use**: The "View code" action on a technical task row, which opens
`/recruiter/library/tasks/<item_id>/view` in a new tab.

---

## 5. Admin Endpoints (IsAdminOnly)

Used by platform admins to manage the Trudev library.

### 5.1 List All System Items

```
GET /api/admin/library/items
```

**Query Parameters**: `content_type`, `is_system_published` (true/false), `search`

**Response** `200` — Same list shape as browse.

### 5.2 Create System Item

```
POST /api/admin/library/items
```

Same request body as `POST /api/v1/library/my` (Section 2.2). Item is created with `org = null`.

### 5.3 Publish / Unpublish

```
PATCH /api/admin/library/items/<item_id>
```

**Request Body**:

```json
{
  "is_system_published": true
}
```

Also supports updating: `title`, `tags`, `difficulty`, `seniority`, `domain`, `language`.

### 5.4 Delete

```
DELETE /api/admin/library/items/<item_id>
```

Soft delete.

---

## 6. Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error",
  "data": null,
  "errors": {
    "field_name": ["validation error detail"]
  }
}
```

Common HTTP statuses:
- `400` — Validation error, duplicate attachment, bad params
- `401` — Missing/invalid JWT
- `403` — Wrong role (e.g., candidate hitting recruiter endpoints)
- `404` — Item/assessment not found or not in user's org
- `409` — Conflict (item already attached)

---

## 7. Frontend Flow Guide

### Flow A: Browse & Attach a Trudev Item

1. `GET /v1/library/filter-options` → populate dropdowns
2. `GET /v1/library/trudev?content_type=mcq&difficulty=medium&tag=simulation` → show browseable list
3. User clicks item → `GET /v1/library/trudev/<id>` → show detail panel
4. User clicks "Use this task" → `POST /v1/assessments/<id>/library-items` → attached

### Flow B: Customize a Trudev Item

1. Steps 1-3 from Flow A
2. User clicks "Customize & Save" → show edit form pre-filled with Trudev item data
3. User edits fields → `POST /v1/library/trudev/<id>/clone` with overrides → item cloned to My Library
4. Auto-attach or let user attach separately

### Flow C: Create Custom Item from Scratch

1. `GET /v1/library/filter-options` → populate dropdowns
2. User selects type (MCQ/FreeText/Ranking/Coding) → show appropriate form
3. User fills form → `POST /v1/library/my` → created in My Library
4. Optionally attach: `POST /v1/assessments/<id>/library-items`

### Flow D: Edit an Item in My Library

1. `GET /v1/library/my` → show org's saved items
2. User clicks edit → `GET /v1/library/my/<id>` → show form
3. User modifies → `PATCH /v1/library/my/<id>` → updated
4. If already attached to an assessment, changes reflect immediately

### Flow E: Simulation/Scenario Filter

- Add `?tag=simulation` to any browse endpoint
- No special endpoint needed; tags are freeform
- Suggested tag values: `simulation`, `scenario`, `real-world`, `case-study`
