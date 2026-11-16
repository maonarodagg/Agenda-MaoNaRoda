# Agenda da Equipe (MãoNaRoda)

Sistema web de agenda interna para uma equipe de 2 a 10 pessoas. Calendário + tarefas.
Requisitos completos em `docs/REQUISITOS.md`. Esse arquivo é a fonte da verdade:
se algo conflitar com o que eu pedir no chat, me avise antes de seguir.

## Stack

- React + TypeScript (Vite), modo `strict` ligado
- Supabase: Postgres + Auth (login Google) + Realtime
- Hospedagem: Vercel
- UI em pt-BR, fuso `America/Sao_Paulo`, datas guardadas em UTC

## Regras que valem sempre

1. **Segurança fica no banco.** Toda tabela com RLS ligado. Visibilidade (pessoal/grupo/equipe)
   é decidida por policy, nunca só escondendo no front.
2. **Nada de chave secreta no front.** Só a anon key vai pro cliente. Service role nunca.
3. **Mudança de banco = arquivo de migration SQL** em `supabase/migrations/`. Nunca alterar na mão.
4. **Não invente API.** Antes de usar função de lib (Supabase, FullCalendar, rrule, etc.),
   confira na documentação da versão instalada. Se não tiver certeza, me diga.
5. **Separar camadas:** componentes de UI não falam com o Supabase direto.
   Acesso a dados em `src/services/` ou hooks em `src/hooks/`. Isso é pra reaproveitar no Expo depois.
6. **Só o que a fase pede.** Não adiantar funcionalidade de fase futura.
7. Visual segue a identidade do MãoNaRoda, com modo claro e escuro. Cores via variáveis/tokens, nada hardcoded.

## Convenções

- Código e nomes de variável em inglês; textos da interface em português.
- Comentários curtos, simples e diretos, em português.
- Componentes pequenos, um por arquivo. Sem `any`.
- Commits pequenos, mensagem em português no imperativo ("adiciona login com Google").

## Antes de dar uma tarefa por pronta

- `npm run build` e `npm run lint` passando.
- Testar o fluxo na mão e me dizer o que testou.
- Para qualquer policy de RLS nova: testar com pelo menos 2 usuários diferentes
  e confirmar que o segundo NÃO vê o que não deveria.

## Decisões já fechadas (não reabrir sem me perguntar)

- Login só com Google. Entrada de membros só por convite (link, 7 dias, uso único).
- Um único papel (membro). Existe só um "dono" (quem criou a equipe), apenas pra remover membros.
- Participante entra no evento direto (sem aceitar) e pode sair.
- Conflito de horário só avisa. Dependência de tarefa só avisa.
- Anexos: só links, sem upload.
- Uma equipe só, sem multi-tenant.
