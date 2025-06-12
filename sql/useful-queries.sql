select * from chatbots;
select * from actions;
select * from documents;

select * from next_auth.accounts;
select * from next_auth.users;


delete FROM chatbots;
delete from actions;
delete from documents;

drop table if exists actions;
drop type if exists execution_context;
drop table if exists documents;
drop table if exists chatbots;
drop function if exists search_documents;

drop table if exists domain_events;
drop table if exists credit_holds;
drop materialized view user_credit_summary;
drop table if exists credit_batches;


insert into credit_batches(user_id, quantity_remaining)
values ('b39364e1-dd7a-4c43-a07d-ab8bc1945bf2', 1000000)

