-- Empreendimentos (lançamentos e construtoras) por empresa. A tabela existia só no banco antigo,
-- criada à mão; aqui ela entra nas migrations com a mesma estrutura e as mesmas regras dos imóveis.
create table if not exists crm.empreendimentos (
  id            uuid        primary key default gen_random_uuid(),
  empresa_id    uuid        not null default crm.minha_empresa() references crm.empresas on delete cascade,
  nome          text        not null check (length(btrim(nome)) > 0),
  construtora   text        not null default '',
  bairro        text        not null default '',
  endereco      text        not null default '',
  situacao      text        not null default '',
  tipologias    text        not null default '',
  lazer         text        not null default '',
  localizacao   text        not null default '',
  diferenciais  text        not null default '',
  observacoes   text        not null default '',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists empreendimentos_empresa on crm.empreendimentos (empresa_id, nome);

drop trigger if exists empreendimentos_atualizado_em on crm.empreendimentos;
create trigger empreendimentos_atualizado_em before update on crm.empreendimentos
  for each row execute function crm.tocar_atualizado_em();

alter table crm.empreendimentos enable row level security;
drop policy if exists empreendimentos_ler on crm.empreendimentos;
create policy empreendimentos_ler on crm.empreendimentos for select to authenticated
  using (empresa_id = (select crm.minha_empresa()));
drop policy if exists empreendimentos_mexer on crm.empreendimentos;
create policy empreendimentos_mexer on crm.empreendimentos for all to authenticated
  using (empresa_id = (select crm.minha_empresa()) and (select crm.sou('admin', 'gerente', 'corretor')))
  with check (empresa_id = (select crm.minha_empresa()) and (select crm.sou('admin', 'gerente', 'corretor')));

grant select, insert, update, delete on crm.empreendimentos to authenticated;
grant all on crm.empreendimentos to service_role;
