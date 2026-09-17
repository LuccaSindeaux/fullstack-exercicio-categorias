const listaCategorias = document.getElementById("listaCategorias");

const URL = "http://localhost:8001"
const endPointCategoria = URL + "/category"
const endPointProduto = URL + "/product"

const formulario = document.getElementById("formCategoria");
const campoId = document.getElementById("idCat");
const campoNome = document.getElementById("txtNome");

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
                        <button class = "btn btn-info" onclick = "preencherForm( ${cat.id}, ${cat.nome} )">
                            Editar
                        </button>
                        <button class = "btn btn-danger" onclick = "excluirCategoria( ${cat.id} )">
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

loadCategorias();

async function excluirCategoria(id){
    const confirma = confirm( "Confirma exclusão?" );

    if( !confirma ) return

    try {
        const resposta = await fetch(
            `${endPointCategoria}/${id}`,
            {method: 'DELETE'}
        )
        if( resposta.ok ){
            alert("Categoria excluída cokm sucesso!")
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