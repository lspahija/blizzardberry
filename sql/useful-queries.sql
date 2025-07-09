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
values ('83d476b1-1777-4b1d-8f07-28d7df584f25', 1000000);


drop table subscriptions;


select * from subscriptions;