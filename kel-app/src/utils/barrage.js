import { Barrage } from 'vant';
import 'vant/es/barrage/style';

export function useBarrage(text, options = {}) {
  const {
    className = 'custom-barrage-wrapper',
    height = '46px',
    rows = 1,
    delay = 300,
    duration = 4000,
    color = 'red',
  } = options;

  const divEl = document.createElement('div');
  document.body.appendChild(divEl);
  divEl.style.position = 'fixed';
  divEl.style.zIndex = '99999';
  divEl.style.top = '0';
  divEl.style.width = 'calc(100vw - 120px)';
  divEl.style.margin = '0 60px';
  divEl.id = 'barrage-id01';

  divEl.classList.add(className);

  if (color) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .van-barrage__item {
            color: ${color};
        }
    `;
    document.head.appendChild(style);
  }

  let timer;

  createApp({
    components: {
      Barrage,
    },

    setup() {
      const list = ref([{ id: Math.random(), text }]);

      timer = setInterval(() => {
        list.value.push({ id: Math.random(), text });
      }, 3000);

      return () => {
        return h(
          Barrage,
          {
            modelValue: list.value,
            rows,
            delay,
            duration,
            'onUpdate:modelValue': data => {
              list.value = data;
            },
          },
          h('div', {
            class: 'custom-barrage',
            style: {
              height,
              width: '100%',
            },
          })
        );
      };
    },
  }).mount(divEl);

  return function clearBarrage() {
    timer && clearInterval(timer);
    document.body.removeChild(divEl);
  };
}

export function removeBarrage() {
  const barrageEl = document.getElementById('barrage-id01');
  if (barrageEl) {
    document.body.removeChild(barrageEl);
  }
}
