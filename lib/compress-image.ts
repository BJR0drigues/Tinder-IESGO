// Comprime imagem no browser antes de salvar como base64.
// Reduz fotos de celular de ~3MB para ~80-150KB — essencial para produção.

export async function compressImage(
  file: File,
  maxWidth  = 900,
  maxHeight = 1200,
  quality   = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();

      img.onload = () => {
        let w = img.width;
        let h = img.height;

        // Redimensionar mantendo proporção
        if (w > maxWidth) {
          h = Math.round(h * (maxWidth / w));
          w = maxWidth;
        }
        if (h > maxHeight) {
          w = Math.round(w * (maxHeight / h));
          h = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas não suportado')); return; }

        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = e.target!.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
