# Deploy da Agenda MãoNaRoda (Fase 1)

Guia pra colocar no ar: **Supabase em nuvem** (banco + login) e **Vercel** (site).
Conferido na documentação em 16/11/2026. Os nomes dos menus do painel podem mudar um pouco; o caminho é o mesmo.

> Nada de chave secreta no front: na Vercel vai **só a URL e a anon key** (ou "publishable key").
> A `service_role` / "secret key" nunca sai do painel do Supabase.

## Antes de começar: o que a documentação diz

| Ponto | O que vale hoje | O que fazemos |
|---|---|---|
| E-mail padrão do Supabase | Só envia pra **membros da organização no Supabase** e no máximo **2 e-mails por hora**. Não serve pra convidados. | Configurar **SMTP próprio** (passo 3). Sem isso, quem é convidado não recebe o link de confirmação. |
| SMTP próprio | Começa com limite de **30 e-mails/hora** (ajustável em Rate Limits). | Sobra pra 2 a 10 pessoas. |
| Plano gratuito | Projeto **pausa depois de 1 semana sem uso**. 2 projetos ativos por conta. | Se pausar, é só reativar no painel. Pra não pausar, só o plano pago. |
| Preview da Vercel | Cada deploy tem uma URL nova. O Supabase aceita curinga: `https://*-<seu-usuario>.vercel.app/**` | Passo 5. |

## 1. Criar o projeto no Supabase

1. Entre em https://supabase.com/dashboard e clique em **New project**.
2. Nome: `agenda-maonaroda`. Região: **South America (São Paulo)**.
3. Crie uma senha forte pro banco e guarde num gerenciador de senhas (não mande no chat).
4. Quando o projeto terminar de criar, anote o **Project ref**: é o código de 20 letras na URL do painel
   (`https://supabase.com/dashboard/project/<ref>`). Esse código pode me passar.

## 2. Aplicar as migrations (no seu terminal, nesta pasta)

```bash
npx supabase login
```

```bash
npx supabase link <ref>
```

```bash
npx supabase db push --remote
```

O `link` pede a senha do banco: digite você mesmo no terminal.
O `db push` aplica as 4 migrations de `supabase/migrations/` (tabelas, RLS, categorias padrão e e-mail do dono).

## 3. E-mail (SMTP próprio)

Escolha **um** dos dois. Pra equipe pequena, o Gmail é o mais simples.

**Opção A: Gmail da equipe (`maonaroda.gg@gmail.com`)**
1. Na conta Google, ative a **verificação em duas etapas**.
2. Crie uma **senha de app** (Conta Google → Segurança → Senhas de app).
3. No Supabase: **Authentication → Emails → SMTP Settings** → ative **Enable custom SMTP**:
   - Sender email: `maonaroda.gg@gmail.com` · Sender name: `Agenda MãoNaRoda`
   - Host: `smtp.gmail.com` · Port: `587`
   - Username: `maonaroda.gg@gmail.com` · Password: a senha de app (digite você, não me mande)

**Opção B: Brevo (gratuito, sem domínio próprio)**
1. Crie conta em brevo.com e verifique o e-mail remetente.
2. Em SMTP & API, gere uma chave SMTP e use host, porta, usuário e chave que eles mostrarem.

**Textos dos e-mails em português** (opcional, mas recomendado): em **Authentication → Emails → Templates**,
troque o assunto e o texto de **Confirm signup** e **Reset password**. Sugestão:

- Confirm signup — assunto `Confirme seu e-mail na Agenda MãoNaRoda`, corpo:
  `<p>Olá! Clique para confirmar seu e-mail e entrar na agenda da equipe:</p><p><a href="{{ .ConfirmationURL }}">Confirmar e-mail</a></p>`
- Reset password — assunto `Redefinir sua senha na Agenda MãoNaRoda`, corpo:
  `<p>Recebemos um pedido para trocar sua senha. Se foi você, clique abaixo:</p><p><a href="{{ .ConfirmationURL }}">Criar nova senha</a></p><p>Se não foi você, ignore este e-mail.</p>`

## 4. Ajustes de login no Supabase

Em **Authentication → Sign In / Providers**:
- **Email**: ligado. **Confirm email**: ligado. Senha mínima: **8**.
- Nenhum provedor social (Google etc.) ligado.

## 5. Criar o projeto na Vercel

1. Em https://vercel.com/new, importe o repositório `maonarodagg/Agenda-MaoNaRoda` do GitHub.
2. Framework: **Vite** (detecta sozinho). Build: `npm run build`. Output: `dist`.
3. Em **Environment Variables**, adicione (valores em Supabase → Project Settings → API):
   - `VITE_SUPABASE_URL` = a Project URL (`https://<ref>.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = a **anon** key (ou a **publishable** key). **Nunca a service_role/secret.**
4. Deploy. Anote a URL de produção (ex.: `https://agenda-maonaroda.vercel.app`) e o seu usuário/time na Vercel
   (aparece nas URLs de preview: `https://<projeto>-<hash>-<usuario>.vercel.app`).

Depois, de volta no Supabase, **Authentication → URL Configuration**:
- **Site URL**: a URL de produção da Vercel.
- **Redirect URLs** (adicione as três):
  - `https://<url-de-producao>/**`
  - `https://*-<usuario-ou-time-na-vercel>.vercel.app/**` (previews)
  - `http://localhost:5180/**` (desenvolvimento)

O `vercel.json` do repositório já faz as rotas (`/convite/...`, `/nova-senha` etc.) abrirem o app.

## 6. Primeiro acesso (dono)

1. Abra `https://<url>/criar-equipe`, cadastre-se com `maonaroda.gg@gmail.com` e confirme o e-mail.
2. Crie a equipe. Em **Equipe → Gerar convite**, gere os links e envie pra cada pessoa.

## 7. Checklist do teste final (2 contas)

- [ ] Dono cadastra, confirma e-mail, cria equipe.
- [ ] Conta sem convite cai em "Você precisa de um convite".
- [ ] Convite: segunda pessoa se cadastra pelo link, confirma e entra; o mesmo link não funciona de novo.
- [ ] Convite revogado mostra "cancelado".
- [ ] Evento pessoal do dono não aparece pra segunda conta; grupo só pra quem participa; equipe pra todos.
- [ ] "Esqueci minha senha" chega por e-mail e troca a senha.
- [ ] Modo claro/escuro e celular.
