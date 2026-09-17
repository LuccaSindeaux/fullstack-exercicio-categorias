# Configurações

## Diretório Aula09-REST > Backend
Este diretório foi clonado do GitHub do professor Adalto. Nele há toda a configuração do servidor em si, com a api e o banco de dados, cruamente falando ela é o *backend* da aplicação. Para que a o servidor suba e toda aplicação funcione, são necessário aguns passos: 
* 1 - Ter o xampp com o apache e SQL em 'start';
* 2 - Ter o Node.js;
* 3 - Clicar com botão direito do mouse na pasta 'api', clicar em 'Open in Integrated Terminal';
* 4 - No terminal integrado: rodar o 'npm i' para instalar os 'node_modules';
* 5 - No terminal integrado: rodar o 'node index.js' para subir  o servidor;
* Extra: instalar cors com 'npm install cors' antes do passo 5, para garantir que nenhuma biblioteca esteja faltante deste projeto específico.

O diretório é o backend, na pasta ```api > index.js```, possui a api com os endpoints configurados, os verbos https, e as constantes que informam nome, host, hnome do banco, etc. 

```js
const express = require("express")
const knex = require("knex")
const http_errors = require("http-errors")
const cors = require("cors")

const PORT = 8001
const HOSTNAME = "localhost"

const api = express()
api.use( express.json() )
api.use( express.urlencoded( { extended : true } ) )
api.use(cors())

const conn = knex( {
    client : "mysql" ,
    connection : {
        host : HOSTNAME ,
        user : "root" ,
        password : "" ,
        database : "loja_26_1"
    }
} ) 
```

## Banco de dados 
O arquivo [banco.sql](C:\xampp\htdocs\2026_1_Desenvolvimento_Servicos_API\Aula09-REST\banco.sql) possui o script do banco de dados que será utilizado no ```http://localhost/phpmyadmin/```, seção SQL, colcar script e executar.

## Frontend
A novidade do projeto que não havia no repositório do professor Adalto é o diretório Frontend, a visão da nossa aplicação. Foi criada dentro dele uma pasta 'js' com o ```script.js```. Este arquivo possuirá as funções que dão funcionalidades de fato aos elementos da página como os botões, então quando há um clique num botão ele irá chamar os verbios https definidos no backend. 