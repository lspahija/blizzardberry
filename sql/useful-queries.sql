select * from agents;
select * from actions;
select * from documents;

select * from next_auth.accounts;
select * from next_auth.users;


delete FROM agents;
delete from actions;
delete from documents;

drop table if exists actions;
drop type if exists execution_context;
drop table if exists documents;
drop table if exists agents;
drop function if exists search_documents;

drop table if exists domain_events;
drop table if exists credit_holds;
drop materialized view user_credit_summary;
drop table if exists credit_batches;


insert into credit_batches(user_id, quantity_remaining)
values ('83d476b1-1777-4b1d-8f07-28d7df584f25', 1000000)

-- Team Management Queries and Examples

-- 1. Get all teams for a specific user
SELECT * FROM get_user_teams('user-uuid-here');

-- 2. Get team members for a specific team
SELECT * FROM team_members_with_details WHERE team_id = 'team-uuid-here';

-- 3. Check if user has access to a team
SELECT user_has_team_access('user-uuid-here', 'team-uuid-here');

-- 4. Check if user is admin of a team
SELECT user_is_team_admin('user-uuid-here', 'team-uuid-here');

-- 5. Get all agents for a specific team
SELECT * FROM agents WHERE team_id = 'team-uuid-here';

-- 6. Create a new team manually (if needed)
INSERT INTO teams (name, slug, created_by) 
VALUES ('My New Team', 'my-new-team', 'user-uuid-here')
RETURNING id;

-- 7. Add a user to a team
INSERT INTO team_members (team_id, user_id, role)
VALUES ('team-uuid-here', 'user-uuid-here', 'USER');

-- 8. Promote a user to admin
UPDATE team_members 
SET role = 'ADMIN' 
WHERE team_id = 'team-uuid-here' AND user_id = 'user-uuid-here';

-- 9. Remove a user from a team
DELETE FROM team_members 
WHERE team_id = 'team-uuid-here' AND user_id = 'user-uuid-here';

-- 10. Get teams where user is admin
SELECT t.* FROM teams t
JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = 'user-uuid-here' AND tm.role = 'ADMIN';

-- 11. Count team members per team
SELECT 
    t.name as team_name,
    COUNT(tm.user_id) as member_count,
    COUNT(CASE WHEN tm.role = 'ADMIN' THEN 1 END) as admin_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name;

-- 12. Get all agents with team information
SELECT 
    a.*,
    t.name as team_name,
    t.slug as team_slug,
    u.name as created_by_name
FROM agents a
JOIN teams t ON a.team_id = t.id
JOIN next_auth.users u ON a.created_by = u.id;

-- 13. Find teams with no members (orphaned teams)
SELECT t.* FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE tm.team_id IS NULL;

-- 14. Get user's default team (first team they created)
SELECT t.* FROM teams t
WHERE t.created_by = 'user-uuid-here'
ORDER BY t.created_at ASC
LIMIT 1;

-- 15. Generate a unique team slug manually
SELECT generate_team_slug('John Smith');

-- 16. Update team name and regenerate slug
UPDATE teams 
SET 
    name = 'New Team Name',
    slug = generate_team_slug('New Team Name')
WHERE id = 'team-uuid-here';

-- 17. Get all users who can access a specific agent
SELECT DISTINCT u.name, u.email, tm.role
FROM next_auth.users u
JOIN team_members tm ON u.id = tm.user_id
JOIN agents a ON tm.team_id = a.team_id
WHERE a.id = 'agent-uuid-here';

-- 18. Find teams with most agents
SELECT 
    t.name as team_name,
    COUNT(a.id) as agent_count
FROM teams t
LEFT JOIN agents a ON t.id = a.team_id
GROUP BY t.id, t.name
ORDER BY agent_count DESC;

-- 19. Get recent team activity (teams created in last 30 days)
SELECT 
    t.name,
    t.slug,
    u.name as created_by,
    t.created_at
FROM teams t
JOIN next_auth.users u ON t.created_by = u.id
WHERE t.created_at > NOW() - INTERVAL '30 days'
ORDER BY t.created_at DESC;

-- 20. Clean up orphaned team members (if a user is deleted)
-- This would typically be handled by CASCADE, but here's a manual cleanup:
DELETE FROM team_members 
WHERE user_id NOT IN (SELECT id FROM next_auth.users);

