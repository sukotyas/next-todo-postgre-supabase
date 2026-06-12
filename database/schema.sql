create table if not exists todos (
  id bigserial primary key,
  title varchar(255) not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_todos_created_at on todos (created_at, id);

-- Postgres has no "on update" clause, so a trigger keeps updated_at current.
create or replace function set_todos_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists todos_set_updated_at on todos;

create trigger todos_set_updated_at
  before update on todos
  for each row
  execute function set_todos_updated_at();
