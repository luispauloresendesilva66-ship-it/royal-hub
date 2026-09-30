-- Terceiro canal de WhatsApp: 'evolution' (uma instância da Evolution API por empresa, ligada por QR code no painel).
-- Reaproveita ponte_qr / ponte_qr_em / ponte_numero / ponte_visto_em (QR, número conectado e "conectada desde").
alter table crm.config drop constraint if exists config_wa_canal_check;
alter table crm.config add constraint config_wa_canal_check check (wa_canal in ('oficial', 'ponte', 'evolution'));

-- a tabela da fila (migration anterior) ficou sem permissão para o service_role
grant all on crm.fila_whatsapp to service_role;
grant usage, select on all sequences in schema crm to service_role;
