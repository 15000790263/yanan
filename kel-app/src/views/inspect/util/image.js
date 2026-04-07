export async function addWatermarkToImage(blob, text1, text2, text3) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置Canvas大小与图片相同
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原始图片
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // 设置水印文字样式
        ctx.fillStyle = 'white';
        const minDimension = Math.min(img.width, img.height) / 30;
        ctx.font = `${minDimension > 12 ? minDimension : 12}px Arial`;

        // 设置文字透明度
        const opacity = 0.7;
        ctx.globalAlpha = opacity;

        // 计算每行文本的最大宽度
        const texts = [text1, text2, text3];
        const maxWidth = Math.max(...texts.map(t => ctx.measureText(t).width));

        // 计算每行文本的高度
        const lineHeight = ctx.measureText('M').width * 1.5; // 1.5 是一个经验值，可以根据需要调整

        // 设置文本起始坐标
        const x = canvas.width - maxWidth - 10;
        let y = canvas.height - (texts.length * lineHeight + 10); // 保证所有文字有足够的空间显示

        // 绘制每行文本
        texts.filter(Boolean).forEach(text => {
          ctx.fillText(text, x, y);
          y += lineHeight;
        });

        // 将Canvas转换为新的Blob
        canvas.toBlob(
          function (newBlob) {
            resolve(newBlob);
          },
          'image/jpeg',
          0.4
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(blob);
  });
}
