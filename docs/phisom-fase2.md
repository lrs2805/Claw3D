# Phisom Office — Fase 2 (spec para o Cursor)

> Escritório 3D dos agentes Phisom, construído sobre o **Claw3D**
> (Next.js + React Three Fiber). O escritório "ao vivo" é o componente
> **`RetroOffice3D`** — NÃO o builder `/office/builder`.

## Contexto (Fase 1 — já feita, não mexer)

O ficheiro `src/features/retro-office/core/phisomOffice.ts` já acrescenta:

- 8 salas (paredes + porta) num grid 4×2 na parte de baixo do canvas
  (`COL_X = [40,470,900,1330]`, `ROW_Y = [780,1270]`, sala `380×400`).
- 1 secretária por agente, com uid determinístico `phi_desk_<agentId>`
  (usadas em `deskAssignments` para sentar os 17 agentes).
- Recepção da SARA.
- `PHISOM_ROOM_LABELS` desenha as etiquetas das salas (overlay `<Html>`).

`ensureOfficePhisomDepartments()` é **aditivo e idempotente** e é chamado na
cadeia `buildInitialFurnitureLayout()` em `RetroOffice3D.tsx`, junto de outros
helpers `ensureOfficeX()` (gym, server room, kanban, ping-pong, atm, jukebox…).

## Regras gerais (obrigatórias)

1. **Tudo client-side.** A planta vive em `localStorage`
   (`openclaw-office-furniture-v9:<namespace>`); os defaults em
   `core/furnitureDefaults.ts` (`materializeDefaults`). Não mexer no backend.
2. **Aditivo e idempotente.** Segue o padrão dos `ensureOfficeX()`: se o item já
   existir, não duplicar. Usa uids determinísticos com prefixo `phi_`.
3. **TypeScript estrito.** Antes de cada commit corre `npm run build` (ou
   `npx tsc --noEmit`) e **corrige todos os erros**. Nunca deixar o repo a não
   compilar.
4. **Não tocar** em: `Dockerfile`, `server/gateway-proxy.js`, settings/tokens,
   nem no que já existe da Fase 1.
5. **Ficheiros-chave:** `src/features/retro-office/RetroOffice3D.tsx`,
   `core/furnitureDefaults.ts`, `core/geometry.ts` (catálogo de móveis +
   footprints), `core/types.ts` (`FurnitureItem`, estados de agente),
   `overlays/MonitorImmersiveContent.tsx` (ecrãs com `<iframe>`),
   `src/lib/office/deskMonitor.ts`.
6. **Referência de mecânica de "brincadeira":** já existe **ping-pong**
   (`ensureOfficePingPongTable`, e no `RenderAgent` os campos `pingPongUntil`,
   `pingPongPartnerId`, `pingPongTableUid`, `pingPongSide`). Usa isto como
   modelo para a nova atividade de jogo.
7. Entrega num **branch `phisom/fase2`** e faz **push** para `origin`.
   Commits separados por feature (A, B, C). No fim, resume o que fizeste e o
   hash de cada commit.

---

## Feature A — Sala de Jogos: mesa de bilhar + avatares a atirar papéis 🎱

Objetivo (tom leve/divertido, não sério):

- Adicionar uma **mesa de bilhar** ao escritório (zona nova ou dentro de uma
  sala existente, à tua escolha — sugere-se uma "Sala de Jogos" num canto livre
  do topo do canvas, acima das salas da Fase 1, i.e. `y < 780`).
- Os **avatares dos agentes** devem poder ir até à mesa e **brincar**: fazer
  tacadas e, em tom de brincadeira, **atirar bolinhas de papel / aviões de papel**
  uns aos outros (pequenas animações/projéteis desenhados no canvas 3D).
- Deve acontecer **espontaneamente com moderação** (ex.: quando um agente está
  `idle`, com probabilidade baixa e cooldown), sem travar o resto do escritório.
- Reutiliza a máquina de estados do ping-pong (estados `standing`/`working`,
  holds por agente) — não inventes um sistema paralelo se puderes estender o
  existente.

Critério de aceitação:

- Existe uma mesa de bilhar visível e identificável.
- Vês, de vez em quando, 1–3 agentes junto dela a interagir, com pelo menos uma
  animação de "atirar papel" (uma bolinha/avião pequeno a voar).
- O comportamento é **limitado** (cooldown) — não pode ser caos permanente.

---

## Feature B — Ecrãs de parede: Daily (reunião) + Google Agenda 📅

- Numa parede da sala de reunião, adicionar **1–2 ecrãs** que renderizam
  `<iframe>` (o `MonitorImmersiveContent` já suporta isso via `browserUrl`).
- Ecrã 1: **Daily.co** (sala de reunião embutida).
- Ecrã 2: **Google Calendar** (embed oficial:
  `https://calendar.google.com/calendar/embed?src=<ID>&ctz=Europe/Lisbon`).
- Os URLs devem ser **constantes no topo** do ficheiro, com valores
  placeholder claros para o Léo preencher:
  - `PHISOM_MEETING_DAILY_URL` (default: `https://partiuportugal.daily.co/escritorio`)
  - `PHISOM_AGENDA_EMBED_URL` (default: `https://calendar.google.com/calendar/embed?src=phisom&ctz=Europe/Lisbon`)
- Não rebentar se o iframe falhar (X-Frame-Options): mostrar fallback estático.

Critério de aceitação:

- Os ecrãs aparecem na parede e tentam carregar o iframe; se bloqueado, mostram
  um fallback (não uma caixa partida).

---

## Feature C — Sala "Aquário" do Léo (só dele) 🐠⛳

- Uma sala separada (sugere-se canto superior do canvas), com **paredes de vidro
  translúcidas** (efeito "aquário"), marcada como **só do Léo**.
- Dentro: **sofá** (`loungeSofa.glb` / tipo `couch`) + **mini-golfe**
  (pelo menos 2–3 buracos com bandeirinhas e um "putter" decorativo).
- Deixa a sala **visualmente distinta** (cor/piso diferente) e com uma etiqueta
  própria ("Aquário do Léo").

Critério de aceitação:

- A sala existe, é claramente separada, tem sofá + mini-golfe visíveis.

---

## Entrega

- Branch `phisom/fase2`, 3 commits (A, B, C), `git push -u origin phisom/fase2`.
- `npm run build` a passar no fim.
- Resumo final: hash de cada commit + o que ficou pendente/placeholder.
