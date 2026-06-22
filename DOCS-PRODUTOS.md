# Como Cadastrar Produtos com Cores

Este guia e para voce cadastrar produtos com variantes de cor no painel da Shopify.
Nao e necessario mexer em nenhum codigo.

---

## Antes de comecar

Certifique-se de que a sua loja ja tem a secao de cores configurada pela equipe tecnica.
Se nao tiver certeza, entre em contato antes de seguir os passos abaixo.

---

## Parte 1 — Registrar as cores da loja (faz uma vez so)

Esta etapa configura a aparencia das bolinhas de cor que aparecem nos cards de produto.
Voce faz isso uma unica vez e depois so adiciona cores novas quando precisar.

**Onde acessar:**
Painel Shopify > Loja Online > Temas > Personalizar

**Passos:**

1. No personalizador do tema, clique em **"Secoes"** no menu lateral esquerdo.
2. Procure a secao chamada **"Cores de Variantes"**.
3. Clique em **"Adicionar bloco"** e escolha **"Cor"**.
4. Preencha os campos:

   - **Nome da variante:** escreva o nome da cor exatamente como aparece no produto.
     Ex: `Preto`, `Branco`, `Azul Marinho`, `Off White`
   - **Cor:** escolha a cor no seletor de cores.
   - **Imagem da cor:** (opcional) use apenas para texturas especiais como mesclado, xadrez ou estampado. Quando preenchido, substitui o campo "Cor".

5. Repita o processo para cada cor que voce vender na loja.
6. Clique em **"Salvar"**.

> **Importante:** o nome que voce digita aqui precisa ser identico ao nome cadastrado na variante do produto. Se no produto esta `Azul Marinho`, aqui tambem precisa ser `Azul Marinho`.

---

## Parte 2 — Cadastrar um produto com variantes de cor

### 2.1 — Criar as variantes de cor

**Onde acessar:**
Painel Shopify > Produtos > (selecione o produto) > Variantes

1. Na secao de variantes, certifique-se de que uma das opcoes se chama **"Cor"**.
   - Se estiver com outro nome (como "Opcao 1"), clique no lapizinho para editar e renomeie para `Cor`.
2. Adicione os valores de cada cor disponivel para esse produto.
   Ex: `Preto`, `Branco`, `Azul Marinho`

---

### 2.2 — Fazer upload das imagens

1. Ainda na pagina do produto, suba todas as fotos do produto.
2. Inclua as fotos de cada cor (frente, costas, detalhe etc.).

---

### 2.3 — Definir o texto alternativo de cada imagem (passo mais importante)

O texto alternativo (tambem chamado de "alt") e o que o sistema usa para saber qual imagem pertence a qual cor. Sem isso, a galeria nao vai filtrar as fotos ao trocar a cor.

**Como fazer:**

1. Na pagina do produto, clique em uma das imagens da galeria.
2. Vai abrir uma janela. Clique em **"Editar texto alternativo"** (ou "Alt text").
3. Escreva o nome da cor exatamente como esta cadastrado na variante.
4. Clique em **"Salvar texto alternativo"**.
5. Repita para todas as imagens.

**Exemplo:**

| Foto | O que escrever no alt |
|---|---|
| Camiseta preta de frente | `Preto` |
| Camiseta preta de costas | `Preto` |
| Camiseta azul de frente | `Azul Marinho` |
| Camiseta azul detalhe gola | `Azul Marinho` |

> **Dica:** Se voce tiver uma foto generica (de modelo, por exemplo) que serve para todas as cores, deixe o alt em branco. Ela vai aparecer para qualquer cor selecionada.

---

### 2.4 — Vincular a imagem principal de cada cor

1. Na pagina do produto, va ate a secao de **variantes**.
2. Clique em uma variante (ex: `Preto`).
3. No campo **"Imagem da variante"**, selecione a foto principal daquela cor.
4. Repita para cada variante de cor.

Isso garante que, ao entrar na pagina do produto, a foto certa ja apareca selecionada.

---

## Resumo do que fazer para cada produto

```
[ ] Opcao de variante nomeada como "Cor"
[ ] Valores das cores adicionados (Preto, Branco, Azul Marinho...)
[ ] Imagens de cada cor enviadas
[ ] Alt de cada imagem preenchido com o nome da cor correspondente
[ ] Imagem principal vinculada a cada variante
```

---

## Perguntas frequentes

**A galeria nao esta filtrando as fotos ao trocar a cor. O que fazer?**
Verifique se o alt de cada imagem foi preenchido com o nome exato da cor. Um espaco a mais ou letra diferente ja causa o problema.

**As bolinhas de cor nao aparecem ou estao cinzas.**
Verifique se a cor foi adicionada na secao "Cores de Variantes" no personalizador do tema e se o nome e identico ao da variante do produto.

**Preciso cadastrar uma cor nova que nao existe ainda.**
Va em Loja Online > Temas > Personalizar > Cores de Variantes e adicione um novo bloco para essa cor antes de cadastrar o produto.
