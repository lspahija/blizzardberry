-- Clean up duplicate actions before adding unique constraint
-- For each (name, agent_id) pair that has duplicates, keep only the most recent one

DO $$
DECLARE
    duplicate_record RECORD;
    keep_id UUID;
    delete_ids UUID[];
BEGIN
    -- Find all duplicate (name, agent_id) combinations
    FOR duplicate_record IN
        SELECT name, agent_id, array_agg(id ORDER BY created_at DESC) as ids
        FROM actions
        GROUP BY name, agent_id
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first ID (most recent), delete the rest
        keep_id := duplicate_record.ids[1];
        delete_ids := duplicate_record.ids[2:];

        -- Delete the duplicate actions
        DELETE FROM actions
        WHERE id = ANY(delete_ids);

        RAISE NOTICE 'Cleaned up duplicates for action "%" (agent %), kept ID %, deleted %',
            duplicate_record.name, duplicate_record.agent_id, keep_id, delete_ids;
    END LOOP;
END $$;
