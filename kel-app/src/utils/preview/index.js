import { h, createApp } from 'vue';
import previewVideo from './vue/preview-video.vue';

export function videoPreview(url) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.style.position = 'absolute';
  div.style.zIndex = '9999';
  div.onclick = () => {
    document.body.removeChild(div);
  };

  createApp({
    render: () => h(previewVideo, { url }),
  }).mount(div);
}
