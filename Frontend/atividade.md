# Atividade — CRUD de Produtos vinculados a Categorias

Este documento explica as atualizações realizadas no Frontend para atender à atividade: **permitir a criação de produtos que podem ser atrelados às categorias existentes** no repositório `fullstack-exercicio-categorias` (disciplina Fullstack).

Os arquivos alterados foram:

- `Frontend/catergoria.html`
- `Frontend/js/script.js`

O Backend (`Backend/api/index.js`) e o banco de dados (`Backend/banco.sql`) **já possuíam** toda a estrutura necessária (endpoints de produto e a coluna `codCategoria` com chave estrangeira), portanto não precisaram de alterações.

---

## 1. Visão geral da solução

A interface passou a exibir, além do CRUD de categorias, uma seção de **Produtos** com:

- Listagem de todos os produtos, incluindo o nome da categoria de cada um;
- Criação de produto em um **modal** com um **dropdown** (lista suspensa) para escolher a categoria existente;
- Edição e exclusão de produto.

A regra adotada foi: o dropdown (elemento `<select>`) é o controle natural para "vincular produto a uma categoria", pois as categorias são carregadas da API (`GET /category`) e o valor selecionado vira a chave estrangeira `codCategoria` do produto.

---

## 2. `Frontend/catergoria.html`

### 2.1 Seção "Produtos" com botão de cadastro

```html
<hr>

<div class="d-flex flex-nowrap justify-content-between align-items-center">
  <h2 class="mb-0">Produtos</h2>
  <button class="btn btn-primary" onclick="abrirModalProduto()">Cadastrar Produto</button>
</div>
```

- O `<hr>` separa visualmente o bloco de categorias do bloco de produtos.
- As classes `d-flex`, `justify-content-between` e `align-items-center` posicionam o título à esquerda e o botão à direita na mesma linha.
- O botão "Cadastrar Produto" chama a função `abrirModalProduto()`, que abre o modal no modo de criação.

### 2.2 Tabela de produtos

```html
<table class="table table-striped table-hover" id="tbProdutos">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody id="listaProdutos"></tbody>
</table>
```

- Estrutura idêntica à tabela de categorias, mas com duas colunas extras (**Preço** e **Categoria**), refletindo os campos da tabela `produto` do banco.
- O `<tbody id="listaProdutos">` é preenchido dinamicamente pelo `loadProdutos()` do JavaScript. A coluna **Categoria** mostra o nome da categoria obtido pelo `leftJoin` feito pela API (`GET /product`).

### 2.3 Modal Bootstrap para criação/edição de produtos

```html
<div class="modal fade" id="modalProduto" tabindex="-1" aria-labelledby="modalProdutoLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form action="" id="formProduto">
        <input type="hidden" id="idProd">
        ...
      </form>
    </div>
  </div>
</div>
```

- `<div class="modal fade" id="modalProduto">`: a camada que cobre a tela quando aberta. O CSS do Bootstrap a deixa oculta (`display: none`) por padrão.
- `id="modalProduto"` é usado pelo JavaScript para abrir e fechar o modal.
- O formulário `formProduto` contém os campos do produto:
  - `<input type="hidden" id="idProd">` — identifica se é **edição** (valor preenchido) ou **criação** (vazio), seguindo o mesmo padrão do `idCat` usado nas categorias.
  - `txtNomeProd` — nome do produto (texto).
  - `txtPreco` — preço (`type="number"`, `step="0.01"`, `min="0"` para aceitar casas decimais).
  - `selCategoria` — o **dropdown de categorias**:

    ```html
    <select id="selCategoria" class="form-select">
      <option value="">Selecione a categoria</option>
    </select>
    ```

    As opções são preenchidas dinamicamente com as categorias vindas de `GET /category`. A primeira opção vazia representa o estado "nenhuma categoria selecionada".
- Botões do rodapé:
  - **Cancelar** — fecha o modal.
  - **Salvar** — `type="submit"`; dispara o listener de submit do formulário no JavaScript, que decide entre criar (POST) ou editar (PUT).

### 2.4 Alteração nos botões de fechar

```html
<button type="button" class="btn-close" onclick="fecharModalProduto()" aria-label="Fechar"></button>
...
<button type="button" class="btn btn-secondary" onclick="fecharModalProduto()">Cancelar</button>
```

- Antes os botões usavam `data-bs-dismiss="modal"`, atributo que **só funciona se o JavaScript do Bootstrap carregar**.
- Foram trocados por `onclick="fecharModalProduto()"`, chamando uma função própria do `script.js` que fecha o modal funcionando **com ou sem** o Bootstrap carregado.

---

## 3. `Frontend/js/script.js`

### 3.1 Referências aos novos elementos

```js
const listaProdutos = document.getElementById("listaProdutos");
const formProduto = document.getElementById("formProduto");
const campoIdProd = document.getElementById("idProd");
const campoNomeProd = document.getElementById("txtNomeProd");
const campoPreco = document.getElementById("txtPreco");
const selCategoria = document.getElementById("selCategoria");
const modalProduto = document.getElementById("modalProduto");
const modalProdutoLabel = document.getElementById("modalProdutoLabel");
```

Capturam, uma única vez, os elementos da página que serão manipulados. O endpoint de produto (`endPointProduto`) já existia e passou a ser utilizado.

### 3.2 Bloco de categorias (não alterado)

Todas as funções originais de categoria foram mantidas:

- `loadCategorias()` — busca e lista categorias;
- `excluirCategoria(id)` — confirma e exclui;
- `preencherForm(idCat, nomeCat)` — preenche o formulário para edição;
- `editarCategoria(idCat, categoria)` — PUT;
- `addCategoria(categoria)` — POST;
- listener de submit do `formCategoria`.

### 3.3 `loadProdutos()` — listar produtos

```js
async function loadProdutos(){
    const resposta = await fetch(endPointProduto) // GET /product
    const produtos = await resposta.json()
    ...
}
```

- Faz `GET /product`. A API faz `leftJoin` com `categoria`, retornando por produto: `id`, `nome`, `preco`, `codCategoria` e `cat` (nome da categoria).
- Monta as linhas da tabela; `prod.cat ?? "—"` exibe "—" quando o produto não possui categoria.
- Os botões «Editar» e «Excluir» chamam `preencherFormProduto(...)` e `excluirProduto(id)`.

### 3.4 `loadCategoriasSelect()` — popular o dropdown do modal

```js
async function loadCategoriasSelect(){
    const resposta = await fetch(endPointCategoria) // GET /category
    const categorias = await resposta.json()
    selCategoria.innerHTML = '<option value="">Selecione a categoria</option>'
    categorias.forEach(cat => {
        selCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`
    })
}
```

- Busca todas as categorias e preenche o `<select>` do modal.
- É chamada **a cada abertura** do modal, então categorias criadas/editadas aparecem no dropdown automaticamente, sem recarregar a página.

### 3.5 Controle do modal (com ou sem Bootstrap)

O modal era controlado pelo JavaScript do Bootstrap (`bootstrap.Modal.getOrCreateInstance(...).show()`). Se esse script não carregasse (por exemplo, por bloqueio do CDN), os botões não faziam nada. Para tornar o código resiliente:

```js
function getModalBootstrap(){
    if( typeof bootstrap !== "undefined" && bootstrap.Modal ){
        return bootstrap.Modal.getOrCreateInstance( modalProduto )
    }
    return null
}
```

- `getModalBootstrap()` devolve a instância do modal do Bootstrap quando a biblioteca existe; caso contrário, retorna `null`.

```js
function mostrarModalProduto(){
    const bs = getModalBootstrap()
    if( bs ){ bs.show(); return }

    modalProduto.classList.add("show")
    modalProduto.style.display = "block"
    document.body.classList.add("modal-open")
    // cria um backdrop próprio (escurece o fundo e fecha ao clicar)
    ...
}
```

- `mostrarModalProduto()`: com Bootstrap usa `bs.show()`; **sem Bootstrap** abre manualmente adicionando a classe `.show` e `display: block` (que faz o CSS exibir o modal), além de um backdrop próprio (`modal-backdrop fade show`) que também fecha o modal ao clicar fora.

```js
function fecharModalProduto(){
    const bs = getModalBootstrap()
    if( bs ){ bs.hide(); return }

    modalProduto.classList.remove("show")
    modalProduto.style.display = ""
    document.body.classList.remove("modal-open")
    ...
}
```

- `fecharModalProduto()`: oposto — usa `bs.hide()` com Bootstrap, ou remove as classes/estilos e o backdrop no caminho manual.

### 3.6 Abertura do modal nos dois modos

**Criar** (botão "Cadastrar Produto"):

```js
function abrirModalProduto(){
    campoIdProd.value = ""
    campoNomeProd.value = ""
    campoPreco.value = ""
    selCategoria.innerHTML = '<option value="">Carregando categorias...</option>'
    modalProdutoLabel.textContent = "Cadastrar Produto"
    mostrarModalProduto()
    loadCategoriasSelect()
    campoNomeProd.focus()
}
```

- Zera os campos, define o título do modal, abre o modal e carrega as categorias do dropdown. O foco vai para o campo Nome para facilitar a digitação.

**Editar** (botão «Editar» da tabela):

```js
async function preencherFormProduto(idProd, nomeProd, precoProd, codCategoria){
    campoIdProd.value = idProd
    campoNomeProd.value = nomeProd
    campoPreco.value = precoProd
    modalProdutoLabel.textContent = "Editar Produto"
    await loadCategoriasSelect()
    selCategoria.value = codCategoria || ""
    mostrarModalProduto()
    campoNomeProd.focus()
}
```

- Preenche os dados do produto, carrega as categorias e seleciona no dropdown a categoria atual do produto (via `codCategoria`). `|| ""` garante que, se o produto não tiver categoria, o dropdown volte ao estado vazio.

### 3.7 Excluir produto

```js
async function excluirProduto(id){
    const confirma = confirm( "Confirma exclusão?" );
    if( !confirma ) return
    const resposta = await fetch( `${endPointProduto}/${id}`, { method: 'DELETE' } )
    ...
    loadProdutos();
}
```

- Segue o mesmo padrão de `excluirCategoria`: pede confirmação, chama `DELETE /product/:id` e recarrega a lista.

### 3.8 Criar e editar produto (addProduto / editarProduto)

```js
async function addProduto(produto) {
    // POST /product
}

async function editarProduto(idProd, produto){
    // PUT /product/:idProd
}
```

- `addProduto` envia o produto novo (POST) e `editarProduto` atualiza (PUT). Ambos recarregam a lista ao sucesso.

### 3.9 Listener do formulário de produto — onde acontece a vinculação

```js
formProduto.addEventListener("submit", async function(evento){
    evento.preventDefault();
    const idProd = campoIdProd.value;
    const produto = {
        nome : campoNomeProd.value,
        preco : Number(campoPreco.value),
        codCategoria : selCategoria.value ? Number(selCategoria.value) : null
    }
    ...
});
```

- `evento.preventDefault()` impede o envio tradicional (recarregamento) do formulário.
- `preco` e `codCategoria` são convertidos com `Number()` para ir como **número** ao banco.
- `codCategoria` recebe o valor do `<select>`: se houve seleção, vira o `id` da categoria (FK); se não, vira `null` (produto sem categoria).
- Se `campoIdProd` está preenchido → `editarProduto` (PUT); senão → `addProduto` (POST). Ao final, o modal é fechado.

> Importante: o corpo enviado é apenas `{ nome, preco, codCategoria }`. O campo `cat` (nome da categoria) retornado pela API no GET é apenas informativo e **não** deve ir no corpo do POST/PUT, pois não existe como coluna na tabela `produto`.

### 3.10 Inicialização

```js
loadCategorias();
loadProdutos();
```

- Ao abrir a página, as duas tabelas já são preenchidas com os dados vindos da API.

---

## 4. Como testar

1. Com o XAMPP rodando (Apache e MySQL) e o banco `loja_26_1` criado via `Backend/banco.sql`:
   - abrir um terminal na pasta `Backend/api`;
   - executar `npm i` (se necessário) e depois `node index.js` para subir a API na porta `8001`.
2. Abrir `Frontend/catergoria.html` no navegador.
3. Fluxos a validar:
   - **Criar**: botão "Cadastrar Produto" → preencher nome/preço → escolher uma categoria no dropdown → Salvar → o produto aparece na tabela com o nome da categoria;
   - **Editar**: botão «Editar» do produto → modal já preenchido com a categoria selecionada → alterar e Salvar;
   - **Excluir**: botão «Excluir» → confirmar.
4. Conferir no phpMyAdmin que a tabela `produto` está com a coluna `codCategoria` preenchida de forma consistente.

---

## 5. Limitações conhecidas

- A interpolação direta do nome no atributo `onclick` (ex.: `onclick="preencherFormProduto(${prod.id}, '${prod.nome}', ...)"`) pode quebrar se o texto do nome contiver aspas simples. Esse mesmo padrão já era utilizado no código original de categorias e foi mantido por consistência.