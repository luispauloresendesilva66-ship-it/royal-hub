// A chave anon é pública por natureza: quem protege os dados é o RLS do banco.
// Nunca coloque a service_role aqui — ela iria para o navegador.
export const environment = {
  supabaseUrl: 'https://ntligarirvohzrhrpqrp.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bGlnYXJpcnZvaHpyaHJwcXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTM2MDIsImV4cCI6MjEwNjM2OTYwMn0.paCoA49CXZPZxcFWGEe2GtxNjR-L-9S49ESrJTgKp8M',
};
