# Registrar Gasto 2.0

## Recursos incluídos

- Dashboard mensal
- Meta e saldo disponível
- Média diária e previsão do mês
- Gráficos por cartão e categoria
- Cadastro de cartões, limite, fechamento e vencimento
- Cadastro, edição e exclusão de gastos
- Busca e filtros
- Modo claro e escuro
- Exportação para CSV
- Funcionamento offline
- Sincronização com Google Sheets
- Proteção contra duplicidade por ID

## Preparar a planilha

Na aba `Gastos`, use estes cabeçalhos:

A1 Data  
B1 Cartão  
C1 Descrição  
D1 Categoria  
E1 Valor  
F1 Observação  
G1 ID  
H1 Atualizado em  

## Google Apps Script

1. Abra a planilha no Google Sheets.
2. Vá em `Extensões > Apps Script`.
3. Cole o conteúdo de `AppsScript.gs`.
4. Clique em `Implantar > Nova implantação`.
5. Escolha `Aplicativo da Web`.
6. Execute como você.
7. Permita acesso a qualquer pessoa.
8. Copie a URL terminada em `/exec`.
9. No app, vá em `Ajustes` e cole a URL.

## Publicação no GitHub Pages

1. Crie um repositório chamado `registrar-gasto-v2`.
2. Envie:
   - index.html
   - app.js
   - manifest.webmanifest
   - sw.js
   - icon.svg
3. Vá em `Settings > Pages`.
4. Selecione a branch `main` e a pasta `/root`.
5. Abra o endereço gerado no Safari.
6. Use `Compartilhar > Adicionar à Tela de Início`.

## Observações importantes

Esta versão não inclui leitura automática de notificações bancárias, OCR de comprovantes ou IA. Esses recursos exigem serviços externos e permissões adicionais.
