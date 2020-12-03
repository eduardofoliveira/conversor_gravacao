require('dotenv').config()
const fs = require('fs').promises;
const Lame = require("node-lame").Lame;

const listarArquivosDoDiretorio = async (diretorio) => {
    let listaDeArquivos = await fs.readdir(diretorio);
    return listaDeArquivos;
}

const converter = async (entrada, saida) => {
    return new Promise((resolve, reject) => {
        try {
            const encoder = new Lame({
                output: `../../MP3/${saida.replace('.wav', '.mp3')}`,
                bitrate: 8
            }).setFile(`../../Gravacoes/${entrada}`);
        
            encoder
                .encode()
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    })
}

const executar = async () => {
    const lista = await listarArquivosDoDiretorio('../../Gravacoes');

    for (let i = 0; i < lista.length; i++) {
        console.log(`${i+1} de ${lista.length}`);
        const item = lista[i];
        
        try {
            if(i%16 === 0){
                await converter(item, item);
            }else{
                converter(item, item);
            }
            
            await fs.unlink(`../../Gravacoes/${item}`)
        } catch (error) {
            console.log(`arquivo ${item} não convertido`)
        }
    }
}

executar()