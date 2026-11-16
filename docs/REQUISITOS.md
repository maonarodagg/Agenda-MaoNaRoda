# Agenda da Equipe: Documento de Requisitos

> Versão 1.0 · 16/11/2026 · Status: **aguardando aprovação antes de começar a produzir**
>
> Legenda: **[DEFINIDO]** = você respondeu · **[PADRÃO]** = assumi o padrão de mercado, confirme ou mude · **[?]** = ponto em aberto

---

## 1. Visão geral

Sistema web de agenda **interno** para a equipe do MãoNaRoda (2 a 10 pessoas), separado do app. Junta **calendário de compromissos** e **gestão de tarefas** (com setores do projeto e dependências) num lugar só, com lembretes dentro do sistema e por notificação no navegador.

**Fora do escopo:** agendamento cliente↔profissional do app, integração com Google Agenda, WhatsApp/e-mail como canal de lembrete, app mobile (fica pro futuro), múltiplas equipes, upload de arquivos.

## 2. Decisões já tomadas

| Tema                     | Decisão                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| Uso                      | Interno da equipe, uma única equipe [DEFINIDO]                                    |
| Plataforma               | Web agora; mobile (Expo) talvez depois [DEFINIDO]                                 |
| Usuários                 | 2 a 10, todos com o mesmo nível de acesso [DEFINIDO]                              |
| Login                    | Google [DEFINIDO]                                                                 |
| Entrada de novos membros | Convite por link: qualquer membro gera, expira em 7 dias, uso único [DEFINIDO]    |
| Stack                    | React + TypeScript + Supabase [DEFINIDO]                                          |
| Lembretes                | Push no navegador + dentro do sistema; cada evento/tarefa define o seu [DEFINIDO] |
| Convites de evento       | Participante entra direto e pode sair [DEFINIDO]                                  |
| Conflito de horário      | Só avisa, não bloqueia [DEFINIDO]                                                 |
| Edição/exclusão          | Criador + participantes [DEFINIDO]                                                |
| Privacidade              | Compromisso pessoal aparece como "Ocupado" na disponibilidade [DEFINIDO]          |
| Setores                  | Lista editável por qualquer membro [DEFINIDO]                                     |
| Dependências             | Avisa ao tentar iniciar, não bloqueia [DEFINIDO]                                  |
| Tarefas no calendário    | Sim, com marcação visual diferente e filtro [DEFINIDO]                            |
| Anexos                   | Só links [DEFINIDO]                                                               |
| Visual                   | Identidade do MãoNaRoda, modo claro e escuro [DEFINIDO]                           |
| Entrega                  | Em 4 fases [DEFINIDO]                                                             |

## 3. Perfis de usuário

Só existe um papel: **Membro**. Todos têm as mesmas permissões gerais; o que muda é a relação com cada item:

- **Criador**: quem criou o evento/tarefa.
- **Participante**: convidado do evento, ou responsável da tarefa.
- **Equipe**: qualquer membro logado.

**[?]** Quem pode **remover um membro** da equipe? Como todos são iguais, sugiro que quem criou a equipe (primeiro usuário) seja o "dono" só pra isso (remover membros). Se preferir sem dono, qualquer membro remove qualquer um, o que é arriscado.

---

## 4. Requisitos funcionais

### Fase 1: Base (login, calendário, eventos)

**Autenticação e equipe**

- **RF-01** Login com conta Google (Supabase Auth). Sem senha própria.
- **RF-02** O primeiro usuário cria a equipe; os demais só entram por convite.
- **RF-03** Qualquer membro gera link de convite: expira em 7 dias, uso único, e pode ser revogado antes de usar.
- **RF-04** Quem abre o convite válido e loga com Google entra na equipe. Link expirado ou já usado mostra mensagem clara.
- **RF-05** Sem convite válido, um login Google novo **não** acessa nenhum dado.
- **RF-06** Tela de membros: lista (nome, foto, e-mail) e convites pendentes.

**Calendário**

- **RF-07** Visões de **dia, semana e mês**, com botão "hoje" e navegação anterior/próximo.
- **RF-08** Filtros: meus / equipe toda / por pessoa / por categoria.
- **RF-09** Clicar num horário vazio cria evento; clicar num evento abre os detalhes.

**Eventos**

- **RF-10** Criar, editar e excluir evento com: título, descrição, data/hora de início e fim, "dia inteiro", local/link, categoria, visibilidade e participantes.
- **RF-11** **Três níveis de visibilidade:** (a) **Pessoal**, só eu; (b) **Grupo**, eu + pessoas escolhidas; (c) **Equipe**, todos os membros.
- **RF-12** Eventos de equipe valem para todos os membros atuais **e futuros** **[PADRÃO]**.
- **RF-13** Categorias com cor (ex.: Reunião, Estudo, Entrega, Pessoal), criáveis e editáveis por qualquer membro. Já vem com algumas padrão.
- **RF-14** Campo de **links** no evento (Meet, Drive etc.), com título opcional. Sem upload.

### Fase 2: Colaboração e lembretes

- **RF-15** Participante adicionado **entra direto** (sem aceitar/recusar) e vê o evento na agenda dele.
- **RF-16** Participante pode **sair** do evento. O evento continua pros demais, e o criador e os outros veem quem saiu.
- **RF-17** Criador + participantes podem editar e excluir o evento (ver regras RN-04 e RN-05).
- **RF-18** **Aviso de conflito:** ao salvar um evento, se algum participante já tiver compromisso no mesmo horário, mostra alerta listando os conflitos, mas permite salvar.
- **RF-19** **Eventos recorrentes:** diário, semanal (escolhendo dias da semana), mensal e anual; término em "nunca", numa data ou após N ocorrências.
- **RF-20** Ao editar/excluir um evento recorrente, perguntar: **só este**, **este e os próximos** ou **todos** **[PADRÃO]**.
- **RF-21** **Lembretes:** cada evento aceita **um ou mais** lembretes com antecedência escolhida (ex.: 10 min, 1 h, 1 dia). Vale pra cada ocorrência de eventos recorrentes.
- **RF-22** Entrega do lembrete por (a) **push no navegador** e (b) **notificação dentro do sistema** (sino com contador, lista, marcar como lida).
- **RF-23** Se o usuário não permitiu push, o lembrete chega só dentro do sistema, e a tela avisa isso.
- **RF-24** Gerenciar dispositivos/navegadores com push ativo (ativar e desativar).

### Fase 3: Tarefas

- **RF-25** Criar, editar e excluir tarefa com: título, descrição, prazo (data, hora opcional), **status** (A fazer / Fazendo / Feito), **prioridade** (Baixa / Média / Alta), **setor**, **responsáveis** (0 a N) e lembretes (mesma mecânica do RF-21).
- **RF-26** **Setores do projeto** (ex.: Front-end, Back-end, Design, IA, Pagamento, Divulgação): lista editável por qualquer membro. Setor é do **projeto**, não da pessoa. **[?]** Uma tarefa tem **um** setor ou pode ter vários? Assumi **um** (mais simples).
- **RF-27** **Subtarefas/checklist:** itens marcáveis dentro da tarefa, com indicador de progresso (ex.: 3/5).
- **RF-28** **Comentários** na tarefa (autor, data/hora), editáveis e apagáveis só pelo próprio autor.
- **RF-29** **Dependências:** uma tarefa pode depender de outras. Ao mudar pra "Fazendo", se houver dependência não concluída, mostra **aviso** listando-as e permite continuar.
- **RF-30** O sistema **impede ciclos** (A depende de B, B depende de A, direto ou indireto).
- **RF-31** Visualizações de tarefas: **lista** (com filtros e ordenação) e **quadro kanban** por status. Filtros: setor, responsável, prioridade, prazo.
- **RF-32** Tarefas com prazo aparecem no **calendário** com marcação diferente dos eventos, com filtro pra mostrar ou esconder.

### Fase 4: Visão da equipe

- **RF-33** **Tela de disponibilidade:** grade por pessoa × horário mostrando livre/ocupado, pra achar horário em comum.
- **RF-34** Na disponibilidade, compromisso pessoal e eventos de grupo dos quais a pessoa participa (e que o visualizador não vê) aparecem só como **"Ocupado"**, sem título nem detalhes.
- **RF-35** **Histórico de alterações** em eventos e tarefas: quem mudou o quê e quando (criação, edição de campos, mudança de status, exclusão).
- **RF-36** Lixeira com exclusão lógica (itens apagados ficam recuperáveis por um período) **[PADRÃO]**.

---

## 5. Regras de negócio

- **RN-01** Evento **Pessoal** só é visível ao criador; na disponibilidade aparece como "Ocupado".
- **RN-02** Evento de **Grupo** só mostra detalhes para criador e participantes; os demais membros o veem apenas como "Ocupado" na disponibilidade dos envolvidos **[PADRÃO]**.
- **RN-03** Evento de **Equipe** mostra detalhes para todos.
- **RN-04** Quem é criador ou participante pode editar e excluir. Quem saiu do evento perde esse direito.
- **RN-05** **[?] Ponto de atenção:** como participantes também podem excluir, um deles pode apagar o evento de todo mundo. Pra mitigar, mantive a **lixeira (RF-36)** e o **histórico (RF-35)**. Se quiser mais seguro, a alternativa é "participante edita, só criador exclui", mas isso contraria o que você definiu, então só mudo se você quiser.
- **RN-06** Conflito é calculado **por participante** e só gera aviso. Evento de dia inteiro não gera conflito com eventos com hora **[PADRÃO]**.
- **RN-07** Todos os horários são guardados em UTC e exibidos em `America/Sao_Paulo` **[PADRÃO]**.
- **RN-08** Convite: uso único, validade 7 dias, e deixa de valer ao ser usado ou revogado.
- **RN-09** Dependência não concluída gera aviso, nunca bloqueio.
- **RN-10** Tarefa concluída ("Feito") guarda a data/hora de conclusão **[PADRÃO]**.
- **RN-11** Lembrete já enviado não é reenviado, e mudar horário do evento reprograma os lembretes pendentes.

## 6. Requisitos não funcionais

**Segurança e privacidade**

- **RNF-01** Segurança por **Row Level Security** no Supabase: a regra de quem vê o quê (RN-01 a RN-03) fica **no banco**, não só no front. Isso é essencial: sem isso, "Pessoal" seria só esconder no visual.
- **RNF-02** Só dados mínimos do Google: nome, e-mail e foto.
- **RNF-03** **LGPD:** a equipe é de alunos, e se houver menores de 18, vale cuidado extra e um aviso de privacidade simples. **Não tenho certeza** de qual o enquadramento ideal pro caso de vocês, vale conferir com a escola/orientador.
- **RNF-04** HTTPS obrigatório (padrão da hospedagem).

**Usabilidade**

- **RNF-05** Interface em **português (pt-BR)**, datas no formato brasileiro **[PADRÃO]**.
- **RNF-06** Responsivo: funciona bem em celular e desktop **[PADRÃO]**.
- **RNF-07** Modo claro e escuro, com a identidade visual do MãoNaRoda.
- **RNF-08** Acessibilidade básica: navegação por teclado, contraste adequado, rótulos nos campos **[PADRÃO]**.

**Desempenho e confiabilidade**

- **RNF-09** Carga baixa (≤10 usuários), então o foco é simplicidade, não escala. Calendário abrindo em menos de ~2 s em conexão normal **[PADRÃO]**.
- **RNF-10** Atualização em tempo real (Supabase Realtime) quando outro membro altera algo **[PADRÃO, opcional]**.
- **RNF-11** Lembretes com tolerância de ~1 minuto de atraso **[PADRÃO]**.
- **RNF-12** Backups: conferir o que o plano do Supabase oferece, e fazer um export periódico manual pra garantir **[?]**.

**Portabilidade**

- **RNF-13** Regras de negócio e acesso a dados em camada separada da UI (hooks/serviços), pra reaproveitar no Expo depois.
- **RNF-14** Instalável como **PWA** (necessário pro push no iOS, que na minha lembrança só funciona com o app instalado na tela inicial; **verificar na documentação atual**).

## 7. Stack e arquitetura (proposta)

| Camada              | Escolha                                          | Observação                                                                                           |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Front               | React + TypeScript (Vite)                        | Mesma base do MãoNaRoda                                                                              |
| Banco/Auth/Realtime | Supabase (Postgres + RLS)                        | Login Google via Supabase Auth                                                                       |
| Calendário (UI)     | FullCalendar ou react-big-calendar               | **Verificar** na hora qual encaixa melhor e a licença (algumas funções do FullCalendar são pagas)    |
| Recorrência         | Padrão RRULE (RFC 5545) + biblioteca             | **Verificar** a lib atual                                                                            |
| Lembretes           | Web Push (VAPID) + service worker + job agendado | Job via Supabase (Edge Function + agendador). **Verificar** na doc atual como agendar no plano usado |
| Hospedagem          | Vercel (vocês já usam no protótipo)              |                                                                                                      |

**Mobile no futuro:** o Supabase tem cliente que funciona em React Native, então o banco e as regras se reaproveitam. O que muda é a UI e o push, que passa a ser nativo.

## 8. Modelo de dados (rascunho)

`profiles` · `team` · `team_members` · `invites` · `categories` · `events` (inclui `rrule`, `visibility`) · `event_participants` (inclui `left_at`) · `event_exceptions` (ocorrências alteradas/canceladas) · `event_links` · `reminders` (alvo: evento ou tarefa) · `sectors` · `tasks` · `task_assignees` · `task_dependencies` · `task_checklist_items` · `task_comments` · `activity_log` · `push_subscriptions` · `notifications`

## 9. Plano de entrega

| Fase  | Entrega                                                                                                              | Pronto quando                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **1** | Login Google, equipe, convite por link, calendário (dia/semana/mês), eventos pessoal/grupo/equipe, categorias, links | A equipe consegue entrar, criar e ver eventos respeitando a visibilidade      |
| **2** | Participantes (entrar/sair), aviso de conflito, recorrência, lembretes (push + sino)                                 | Lembrete chega no horário certo, inclusive em recorrentes                     |
| **3** | Tarefas, setores, subtarefas, comentários, dependências, kanban, tarefas no calendário                               | Fluxo completo de uma tarefa do "A fazer" ao "Feito" com aviso de dependência |
| **4** | Disponibilidade da equipe, histórico, lixeira                                                                        | Dá pra achar um horário livre em comum e rastrear mudanças                    |

> **Ajuste que fiz no seu plano:** coloquei o **convite por link** e as **3 visibilidades** na Fase 1 (e não na 2), porque sem outros membros na equipe não dá pra usar nem testar eventos de grupo/equipe.

## 10. Riscos e pontos de atenção

- **Push no iOS** depende de instalar como PWA, e pode frustrar quem usa iPhone. Por isso o lembrete dentro do sistema não é só um extra, é o plano B.
- **Lembretes confiáveis** são a parte mais traiçoeira: precisa de job agendado rodando e tratamento de assinaturas push expiradas.
- **Recorrência com exceções** (editar só uma ocorrência) é a parte que mais costuma dar bug. Vale tempo extra de teste.
- **Escopo:** o conjunto todo é grande pra equipe pequena. Por isso as fases: a Fase 1 já tem que ser usável sozinha.
- **Plano gratuito do Supabase** tem limites e, se não me engano, pode pausar projetos inativos. **Não tenho certeza dos limites atuais, confira na página de preços/documentação.**

## 11. Pontos em aberto (preciso da sua resposta ou confirmação)

1. **Quem remove membros?** (sugestão: criador da equipe como "dono" só pra isso)
2. **Excluir:** manter "criador + participantes excluem" (RN-05) ou só o criador exclui?
3. **Setor por tarefa:** um só (assumido) ou vários?
4. **Comentários em eventos**, ou só em tarefas (assumido: só tarefas)?
5. **Tarefas são sempre da equipe**, ou pode haver tarefa pessoal (assumido: da equipe, com 0 a N responsáveis)?
6. **Primeiro dia da semana** no calendário: domingo (assumido) ou segunda?
7. **Lixeira:** por quantos dias guardar itens apagados (sugestão: 30)?
8. **Nome e domínio** do sistema (ex.: "Agenda MãoNaRoda" em subdomínio do Vercel?).
9. **Fuso e idioma** fixos em Brasília / pt-BR, ok?

---

_Depois de você aprovar (ou ajustar) este documento, o próximo passo é a Fase 1._
