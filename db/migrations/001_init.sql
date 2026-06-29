
create table if not exists nutzer (
    user_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(20),
    pw varchar(30)
);

create table if not exists topmenu (
    tm_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(30)
);

create table if not exists sidemenu (
    sm_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(30),
    tm_id int,
    inhalt varchar(500)
);