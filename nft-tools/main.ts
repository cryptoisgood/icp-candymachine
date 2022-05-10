import { ArweaveUploader } from '@arweave-cdn/uploader';


async function upload() {
    const arweaveUploader = new ArweaveUploader();
    await arweaveUploader.init('/home/daniel/Documents/experiments/candymachine/nft-tools/arweave-keyfile-iQy1EEaFqFJr7YsxVuCEtQk_DO3tzQ_h26OqXNmlTRQ.json');

    const filesToUpload = [
        '/home/daniel/Documents/experiments/candymachine/nft-tools/nfts/images/1.png'
    ];
    const result = await arweaveUploader.uploadAssets(filesToUpload, '/home/daniel/Documents/experiments/candymachine/nft-tools/nfts/images/');


    console.log(result);
}

upload().then();