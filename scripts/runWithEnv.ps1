param(
  [Parameter(Mandatory=$true)]
  [string]$Script,
  [string[]]$Arguments
)

$env:VITE_SUPABASE_URL = 'https://xvizgfeiuqabdditcbbj.supabase.co'
$env:VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXpnZmVpdXFhYmRkaXRjYmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTg0MzEsImV4cCI6MjA3MjEzNDQzMX0.Dq2YnKTt2BeDaa9DCksk8275K7gyv64S4cit4PEHBUs'

node $Script @Arguments
