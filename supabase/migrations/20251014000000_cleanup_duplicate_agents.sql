-- Clean up duplicate agents before adding unique constraint
-- This migration runs before 20251014000001 (alphabetically)

-- For each (name, created_by) pair that has duplicates, keep only the most recent one
-- and update all references to point to it, then delete the older duplicates

DO $$
DECLARE
    duplicate_record RECORD;
    keep_id UUID;
    delete_ids UUID[];
BEGIN
    -- Find all duplicate (name, created_by) combinations
    FOR duplicate_record IN
        SELECT name, created_by, array_agg(id ORDER BY created_at DESC) as ids
        FROM agents
        GROUP BY name, created_by
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first ID (most recent), delete the rest
        keep_id := duplicate_record.ids[1];
        delete_ids := duplicate_record.ids[2:];

        -- Update all actions to point to the agent we're keeping
        UPDATE actions
        SET agent_id = keep_id
        WHERE agent_id = ANY(delete_ids);

        -- Update all prompts to point to the agent we're keeping
        UPDATE prompts
        SET agent_id = keep_id
        WHERE agent_id = ANY(delete_ids);

        -- Update all conversations to point to the agent we're keeping
        UPDATE conversations
        SET agent_id = keep_id
        WHERE agent_id = ANY(delete_ids);

        -- Delete the duplicate agents
        DELETE FROM agents
        WHERE id = ANY(delete_ids);

        RAISE NOTICE 'Cleaned up duplicates for agent "%" (user %), kept ID %, deleted %',
            duplicate_record.name, duplicate_record.created_by, keep_id, delete_ids;
    END LOOP;
END $$;
