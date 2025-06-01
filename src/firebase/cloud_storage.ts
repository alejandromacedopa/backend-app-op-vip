// src/firebase/cloud_storage.ts
import { Storage } from '@google-cloud/storage';
import { format } from 'util';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: 'notenest-3c0e9',
  keyFilename: './apikeyfirebase.json',
});

const bucket = storage.bucket('notenest-3c0e9.appspot.com');

// 🚀 Subir archivo
export const uploadFile = (file: Express.Multer.File, folder = 'general'): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject('No se recibió archivo');

    const uuid = uuidv4();
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype || 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
      resumable: false,
    });

    blobStream.on('error', error => {
      console.error('Error al subir archivo a Firebase:', error);
      reject('No se pudo subir la imagen');
    });

    blobStream.on('finish', () => {
      const url = format(
        `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${uuid}`
      );
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
};

// 🧹 Eliminar archivo
export const deleteFileByUrl = async (publicUrl: string): Promise<void> => {
  try {
    const pathEncoded = publicUrl.split('/o/')[1]?.split('?alt=media')[0];
    if (!pathEncoded) throw new Error('URL inválida');
    const filePath = decodeURIComponent(pathEncoded);
    await bucket.file(filePath).delete();
    console.log('Imagen anterior eliminada:', filePath);
  } catch (error) {
    console.warn('No se pudo eliminar la imagen anterior:', error.message);
  }
};
