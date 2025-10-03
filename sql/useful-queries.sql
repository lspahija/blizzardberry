-- add credits to a user
insert into credit_batches(user_id, quantity_remaining)
values ('83d476b1-1777-4b1d-8f07-28d7df584f25', 1000000);

-- make some user pro tier
update subscriptions set tier = 'pro' where user_id = 'f3352267-77a4-45d7-a9c4-155afbc55979';

-- copy actions from one agent to another
INSERT INTO actions (agent_id, created_at, execution_model, name, description, execution_context)
SELECT
    'b53516b4-48d8-4563-8059-ead022a794f0'::uuid,  -- destination agent
    created_at,
    execution_model,
    name,
    description,
    execution_context
FROM actions
WHERE agent_id = '6a2ae59c-26da-4b01-913d-f014ea7cdbd9'; -- source agent