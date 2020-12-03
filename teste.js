require('dotenv').config()
const fs = require('fs').promises;
const Lame = require("node-lame").Lame;
const SuperWorker = require('super-worker');

const listarArquivosDoDiretorio = async (diretorio) => {
    let listaDeArquivos = await fs.readdir(diretorio);
    return listaDeArquivos;
}

const converter = async (entrada, saida) => {
    return new Promise((resolve, reject) => {
        try {
            const encoder = new Lame({
                output: `${process.env.PATH_SAIDA}/${saida.replace('.wav', '.mp3')}`,
                bitrate: 8
            }).setFile(`${process.env.PATH_ENTRADA}/${entrada}`);
        
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
    });
}

//request 100 pages at the same time. 
//retry 3 times after fetch error.
//sleep 300ms before performing the next task
var superWorker = new SuperWorker(converter, 16, 3, 300);
//rename addJob
superWorker.converter = superWorker.addJob;
 
let startTime = new Date();
 
superWorker.on('finished', () => {
    let endTime = new Date()
    console.log('cost:', endTime - startTime, 'ms')
});

superWorker.on('retry', (job) => {
    console.log('【retry】', job.args, job.retry)
});

const executar = async () => {
    const lista = await listarArquivosDoDiretorio(`${process.env.PATH_ENTRADA}`);

    for (let i = 0; i < lista.length; i++) {
        superWorker.converter(lista[i], lista[i])
        .then(async ret => {
            console.log(`Gravação: ${lista[i]} convertida`);
            await fs.unlink(`${process.env.PATH_ENTRADA}/${lista[i]}`);
        }).catch(err => {
            console.log('【error】', err);
        })
    }
}

executar();