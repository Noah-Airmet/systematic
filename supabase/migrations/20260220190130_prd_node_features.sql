-- migration for PRD features (confidence, scripture refs, tags) on nodes

ALTER TABLE "public"."nodes"
ADD COLUMN "confidence" text,
ADD COLUMN "scripture_refs" jsonb,
ADD COLUMN "tags" text[];
