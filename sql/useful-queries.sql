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


