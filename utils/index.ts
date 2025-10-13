export async function resizeImage(file: File, maxWidth = 512, maxHeight = 512) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const resized = new Image();
      resized.onload = () => resolve(resized);
      resized.src = canvas.toDataURL("image/jpeg", 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}
