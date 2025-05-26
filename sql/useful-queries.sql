select * from chatbots;
select * from actions;
select * from documents;


delete FROM chatbots;
delete from actions;
delete from documents;

drop table if exists actions;
drop table if exists documents;
drop table if exists chatbots;