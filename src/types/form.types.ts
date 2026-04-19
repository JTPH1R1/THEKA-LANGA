// Form types are always inferred from Zod schemas — never written by hand.
// This file documents the pattern. Actual types live co-located with their schemas
// in src/lib/validators/ and are imported directly from there.
//
// Pattern:
//   import type { z } from 'zod'
//   import { groupRulesSchema } from '@/lib/validators/group-rules.schema'
//   type GroupRulesFormValues = z.infer<typeof groupRulesSchema>
//
// This file is intentionally empty — do not add manual form type definitions here.

export {}
