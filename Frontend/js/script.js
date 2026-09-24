const listaCategorias = document.getElementById("listaCategorias");
const listaProdutos = document.getElementById("listaProdutos");

const URL = "http://localhost:8001"
const endPointCategoria = URL + "/category"
const endPointProduto = URL + "/product"

const formulario = document.getElementById("formCategoria");
const campoId = document.getElementById("idCat");
const campoNome = document.getElementById("txtNome");

const formProduto = document.getElementById("formProduto");
const campoIdProd = document.getElementById("idProd");
const campoNomeProd = document.getElementById("txtNomeProd");
const campoPreco = document.getElementById("txtPreco");
const selCategoria = document.getElementById("selCategoria");
const modalProduto = document.getElementById("modalProduto");
const modalProdutoLabel = document.getElementById("modalProdutoLabel");

// carregar todas as categorias, será usada em outras funções
async function loadCategorias(){
    try{
        const resposta = await fetch(endPointCategoria)
        if(!resposta.ok){
            alert("Erro!")
            return
        }
        const categorias = await resposta.json()
        listaCategorias.innerHTML = ""

        categorias.forEach(cat => {
            listaCategorias.innerHTML += 
            `
                <tr>
                    <td>${cat.id}</td>
                    <td>${cat.nome}</td>
                    <td>
                        <button class="btn btn-info" onclick="preencherForm('${cat.id}', '${cat.nome}')">
                            Editar
                        </button>
                        <button class="btn btn-danger" onclick="excluirCategoria(${cat.id})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `
        });
    }catch(erro){
        console.error(erro)
        alert("Erro ao carregar categorias.")
    } 
}

async function excluirCategoria(id){
    const confirma = confirm( "Confirma exclusão?" );

    if( !confirma ) return

    try {
        const resposta = await fetch(
            `${endPointCategoria}/${id}`,
            {method: 'DELETE'}
        )
        if( resposta.ok ){
            alert("Categoria excluída com sucesso!")
            loadCategorias();
        }
    } catch (erro){
        console.log(erro);
        alert( "Erro ao excluir categoria" );
    }
}

function preencherForm(idCat, nomeCat){
    campoId.value = idCat;
    campoNome.value = nomeCat;
}

async function editarCategoria(idCat, categoria){
    try{
        const response = await fetch(
            `${endPointCategoria}/${idCat}`,
            {
                method: "PUT", 
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(categoria)
            }
        );
        if(response.ok){
            alert("Categoria atualizada com sucesso!");
            loadCategorias();
        }
    } catch(erro){
        console.error(erro);
        alert("Erro ao editar categoria");
    }
}

async function addCategoria(categoria) {
    const response = await fetch(
        endPointCategoria,
        {
            method: "POST", 
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(categoria)
        }
    );
    if(response.ok){
        alert("Categoria adicionada com sucesso!");
        loadCategorias();
    }
    return await response.json();
}

formulario.addEventListener("submit", async function(evento){
    evento.preventDefault();
    const idCat = campoId.value;
    const categoria = {nome : campoNome.value}

    try{
        if(idCat){
            await editarCategoria(idCat, categoria);
        } else{
            await addCategoria(categoria);
        }
    } catch(erro){
        console.error(erro);
        alert("Erro ao adicionar ou editar categoria")
    }
});

async function loadProdutos(){
    try{
        const resposta = await fetch(endPointProduto)
        if(!resposta.ok){
            alert("Erro!")
            return
        }
        const produtos = await resposta.json()
        listaProdutos.innerHTML = ""

        produtos.forEach(prod => {
            listaProdutos.innerHTML += 
            `
                <tr>
                    <td>${prod.id}</td>
                    <td>${prod.nome}</td>
                    <td>${prod.preco}</td>
                    <td>${prod.cat ?? "—"}</td>
                    <td>
                        <button class="btn btn-info" onclick="preencherFormProduto(${prod.id}, '${prod.nome}', ${prod.preco}, ${prod.codCategoria ?? 0})">
                            Editar
                        </button>
                        <button class="btn btn-danger" onclick="excluirProduto(${prod.id})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `
        });
    }catch(erro){
        console.error(erro)
        alert("Erro ao carregar produtos.")
    } 
}

async function loadCategoriasSelect(){
    try{
        const resposta = await fetch(endPointCategoria)
        if(!resposta.ok){
            alert("Erro ao carregar categorias!")
            return
        }
        const categorias = await resposta.json()
        selCategoria.innerHTML = '<option value="">Selecione a categoria</option>'
        categorias.forEach(cat => {
            selCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`
        })
    }catch(erro){
        console.error(erro)
        alert("Erro ao carregar categorias para o formulário.")
    }
}

function getModalBootstrap(){
    if( typeof bootstrap !== "undefined" && bootstrap.Modal ){
        return bootstrap.Modal.getOrCreateInstance( modalProduto )
    }
    return null
}

function mostrarModalProduto(){
    const bs = getModalBootstrap()
    if( bs ){
        bs.show()
        return
    }
    modalProduto.classList.add("show")
    modalProduto.style.display = "block"
    document.body.classList.add("modal-open")
    const backdrop = document.createElement("div")
    backdrop.className = "modal-backdrop fade show"
    backdrop.id = "modalBackdropProduto"
    backdrop.addEventListener("click", fecharModalProduto)
    document.body.appendChild(backdrop)
}

function fecharModalProduto(){
    const bs = getModalBootstrap()
    if( bs ){
        bs.hide()
        return
    }
    modalProduto.classList.remove("show")
    modalProduto.style.display = ""
    document.body.classList.remove("modal-open")
    const backdrop = document.getElementById("modalBackdropProduto")
    if( backdrop ) backdrop.remove()
}

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

async function excluirProduto(id){
    const confirma = confirm( "Confirma exclusão?" );

    if( !confirma ) return

    try {
        const resposta = await fetch(
            `${endPointProduto}/${id}`,
            {method: 'DELETE'}
        )
        if( resposta.ok ){
            alert("Produto excluído com sucesso!")
            loadProdutos();
        }
    } catch (erro){
        console.log(erro);
        alert( "Erro ao excluir produto" );
    }
}

async function addProduto(produto) {
    const response = await fetch(
        endPointProduto,
        {
            method: "POST", 
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(produto)
        }
    );
    if(response.ok){
        alert("Produto adicionado com sucesso!");
        loadProdutos();
    }
    return await response.json();
}

async function editarProduto(idProd, produto){
    try{
        const response = await fetch(
            `${endPointProduto}/${idProd}`,
            {
                method: "PUT", 
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(produto)
            }
        );
        if(response.ok){
            alert("Produto atualizado com sucesso!");
            loadProdutos();
        }
    } catch(erro){
        console.error(erro);
        alert("Erro ao editar produto");
    }
}

formProduto.addEventListener("submit", async function(evento){
    evento.preventDefault();
    const idProd = campoIdProd.value;
    const produto = {
        nome : campoNomeProd.value,
        preco : Number(campoPreco.value),
        codCategoria : selCategoria.value ? Number(selCategoria.value) : null
    }

    try{
        if(idProd){
            await editarProduto(idProd, produto);
        } else{
            await addProduto(produto);
        }
        fecharModalProduto();
    } catch(erro){
        console.error(erro);
        alert("Erro ao adicionar ou editar produto")
    }
});

loadCategorias();
loadProdutos();