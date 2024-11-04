// import seoApi from 'api/seoApi';
import { Buffer } from 'buffer';

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(async (file: File) => {
      let response = await seoApi.uploadMedia({ files: file });
      // debugger;
      let url = '';
      if (
        response?.result === 'success' &&
        response?.media &&
        response?.media.length > 0 &&
        response?.media[0]?.url
      ) {
        url = response?.media[0]?.url;
      }
      let base64 = Buffer.from(await file.arrayBuffer(), 'binary').toString('base64');
      return {
        default: url ? url : `data:${file.type.toLowerCase()};base64,${base64}`,
      };
    });
  }
}

export default function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}
