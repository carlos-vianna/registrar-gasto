# Meus Gastos v5 — Sincronização em nuvem

## O que mudou

- O histórico é baixado automaticamente da planilha ao abrir o aplicativo.
- Cada novo gasto é enviado automaticamente ao Google Sheets.
- Gastos editados são atualizados na mesma linha pelo ID.
- Gastos excluídos são removidos da planilha.
- Linhas vazias da planilha são ignoradas.
- Ao trocar de navegador ou aparelho, o histórico volta automaticamente.
- Se estiver sem internet, o gasto fica pendente e é enviado quando a conexão voltar.

## Atualização obrigatória do Apps Script

1. Na planilha, abra `Extensões > Apps Script`.
2. Substitua o código pelo conteúdo de `AppsScript.gs`.
3. Clique em `Implantar > Gerenciar implantações`.
4. Edite a implantação existente.
5. Em **Versão**, escolha `Nova versão`.
6. Confirme que o acesso está como `Qualquer pessoa`.
7. Clique em `Implantar`.

A URL já está configurada no aplicativo.

## Publicação no GitHub

Substitua:

- index.html
- app.js
- AppsScript.gs
- manifest.webmanifest
- sw.js
- icon.svg
- README.md

Commit sugerido:

`feat: adicionar sincronizacao automatica com Google Sheets`
