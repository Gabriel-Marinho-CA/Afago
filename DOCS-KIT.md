# Como cadastrar um produto Kit

Um produto "kit" e um produto normal que, alem de si mesmo, leva outros produtos
para o carrinho. Na pagina do produto o cliente escolhe o tamanho/variante de cada
item do kit e, ao clicar em COMPRAR, todos os itens entram no carrinho de uma vez.

---

## Parte 1 - Criar o metacampo (faz uma vez so)

**Onde acessar:**
Painel Shopify > Configuracoes > Dados personalizados > Produtos > Adicionar definicao

Preencha exatamente assim:

- **Nome:** `Itens do kit`
- **Namespace e chave:** `custom.itens_do_kit`
- **Tipo:** Referencia de produto
- **Lista de valores:** ativado (marque "Lista de referencias de produto")

Salve. Esse metacampo passa a aparecer na pagina de cada produto.

> A nomenclatura `custom.itens_do_kit` e a mesma usada na loja Dona Gaveta.
> Se o nome for diferente, o bloco nao aparece.

---

## Parte 2 - Adicionar o bloco na pagina de produto (faz uma vez so)

**Onde acessar:**
Painel Shopify > Loja Online > Temas > Personalizar > (escolher um produto) > secao "Informacoes do produto"

1. Clique em **"Adicionar bloco"**.
2. Escolha **"Kit (itens do kit)"**.
3. Arraste o bloco para logo **abaixo do seletor de variantes** e **acima dos botoes de compra**.
4. Ajuste as opcoes do bloco:
   - **Titulo** - texto exibido acima da lista (ex: "Monte seu kit").
   - **Incluir o produto principal no carrinho** - deixe marcado quando o proprio
     produto do kit tambem deve ir para o carrinho. Desmarque quando ele for so
     um agrupador e apenas os itens devem ser vendidos.
   - **Permitir desmarcar o produto principal** - com essa opcao ligada, o
     cliente pode clicar de novo na opcao ja selecionada do produto principal
     (ex: no tamanho `M` que ja esta marcado) para tirar o produto principal da
     compra e levar somente os itens do kit. Os textos de dica, do aviso e do
     botao "Incluir novamente" tambem sao configuraveis logo abaixo.
   - **Atualizar o preco do produto com o total do kit** - soma os precos das
     pecas selecionadas e mostra o total no lugar do preco do produto.
   - **Mostrar o total do kit** / **Texto do total**.
   - **Texto do botao quando faltam selecoes** - o que aparece no botao enquanto
     o cliente ainda nao escolheu todos os tamanhos.
5. Salve.

O bloco fica invisivel em qualquer produto que nao tenha o metacampo preenchido,
entao pode ficar adicionado para todos os produtos sem problema.

---

## Parte 3 - Cadastrar cada kit

**Onde acessar:**
Painel Shopify > Produtos > (selecione o produto do kit)

1. Role ate a secao **Metacampos**.
2. No campo **Itens do kit**, clique em **Selecionar produtos**.
3. Escolha os produtos que compoem o kit, na ordem em que devem aparecer.
4. Salve.

Pronto. Na pagina do produto aparecera a lista dos itens, cada um com foto,
titulo, preco e os botoes de tamanho.

---

## Como funciona para o cliente

1. O cliente escolhe a variante do produto principal (se houver).
2. Escolhe a variante de **cada** item do kit.
3. Enquanto faltar alguma escolha, o botao de compra fica desabilitado com o
   texto configurado no bloco.
4. Com tudo selecionado, o preco exibido passa a ser a soma do kit e o botao
   adiciona todos os itens ao carrinho em uma unica acao.
5. Se quiser levar somente as pecas do kit, o cliente clica de novo na opcao ja
   marcada do produto principal. Ela e desmarcada, aparece o aviso "O produto
   principal nao sera incluido" com o botao "Incluir novamente", e o total passa
   a somar apenas os itens do kit.

---

## Resumo

```
[ ] Metacampo custom.itens_do_kit criado (lista de referencias de produto)
[ ] Bloco "Kit (itens do kit)" adicionado na secao de informacoes do produto
[ ] Produtos do kit selecionados no metacampo do produto
```

---

## Perguntas frequentes

**O bloco nao aparece na pagina do produto.**
Confira se o metacampo esta preenchido nesse produto e se a chave e exatamente
`custom.itens_do_kit`.

**Um item do kit ficou sem botoes de tamanho.**
Esse produto provavelmente nao tem variantes cadastradas. Nesse caso ele entra no
carrinho automaticamente, sem precisar de escolha.

**Tamanhos esgotados de um item do kit.**
Aparecem riscados e nao podem ser selecionados, igual ao seletor do produto normal.

**Nao quero que o cliente possa tirar o produto principal da compra.**
Desmarque "Permitir desmarcar o produto principal" nas opcoes do bloco.

---

## Referencia tecnica

- `sections/main-product.liquid` - bloco `variant_kits`
- `snippets/variant-kits.liquid` - marcacao do kit
- `snippets/kit-item-options.liquid` - opcoes de cada item
- `assets/variant-kits.js` - calculo do total e adicao ao carrinho
- `assets/component-variant-kits.css` - estilos
