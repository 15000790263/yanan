// 阿拉伯转罗马
export function intToRoman(num) {
  // 定义一个映射表
  const map = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let roman = '';
  for (let s in map) {
    while (num >= map[s]) {
      roman += s;
      num -= map[s];
    }
  }

  return roman;
}

// 从多个数字中随机获取几个
export function getRandomNumbers(numbers, count) {
  const result = [];
  const totalNumbers = numbers.length;

  // 确保要选择的数量不超过数组中的元素数量
  if (count > totalNumbers) {
    console.error('要选择的数量超过了数组中的元素数量');
    return result;
  }

  // 生成随机索引，直到获取到指定数量的不重复索引
  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * totalNumbers);
    if (!result.includes(numbers[randomIndex])) {
      result.push(numbers[randomIndex]);
    }
  }

  return result;
}

/***
 * @param 视频dataUrl数据 videoDataUrl
 * @return Promise 封面dataUrl
 */
export function getVideoCover(videoDataUrl) {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.src = videoDataUrl;
    video.autoplay = true;

    // 当视频可以播放时
    video.oncanplay = function () {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg'); // 或者 'image/png'，取决于你需要的格式
      resolve(imageData);
    };

    // 加载视频
    video.load();
    setTimeout(() => {
      video.pause();
    });
  });
}

/********************************************************/

const defaultPassword = 123456;

// 生成密钥函数
async function generateKey(password) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  return crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// 加密函数
export async function encryptMessage(message, password = defaultPassword) {
  const enc = new TextEncoder();
  const encodedMessage = enc.encode(message);
  const key = await generateKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedMessage = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedMessage
  );
  return {
    iv: bufferToBase64(iv),
    encryptedMessage: bufferToBase64(new Uint8Array(encryptedMessage)),
  };
}

// 解密函数
export async function decryptMessage(encryptedData, password = defaultPassword) {
  const iv = base64ToBuffer(encryptedData.iv);
  const encryptedMessage = base64ToBuffer(encryptedData.encryptedMessage);
  const key = await generateKey(password);
  const decryptedMessage = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedMessage
  );
  return new TextDecoder().decode(decryptedMessage);
}

// buffer 转 base64
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// base64 转 buffer
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// 图片 base64 转 blob
export function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

// blob 转 base64
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = reject;
  });
}

export async function addWatermarkToImage(blob, text1, color = 'white') {
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
        ctx.fillStyle = color;
        const minDimension = Math.min(img.width, img.height) / 30;
        ctx.font = `${minDimension > 12 ? minDimension : 12}px Arial`;

        // 设置文字透明度
        const opacity = 0.7;
        ctx.globalAlpha = opacity;

        // 计算每行文本的最大宽度
        // const texts = [text1, text2, text3];
        const texts = [text1];
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
          'image/png',
          0.4
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(blob);
  });
}

// 解析 POLYGON 字符串为坐标数组
export function parseWKTPolygon(wkt) {
  // 提取坐标部分
  const coordsText = wkt.match(/\(\((.*?)\)\)/)[1];

  // 转换为坐标数组
  const coordinates = coordsText.split(',').map(point => {
    const [lng, lat] = point.trim().split(' ').map(Number);
    return [lng, lat]; // 经度在前，纬度在后（符合 GeoJSON 规范）
  });

  return coordinates;
}
