export function showMyDialog(options = { title: '', message: '' }) {
  const dialogEl = document.createElement('dialog');
  document.body.appendChild(dialogEl);

  dialogEl.style.width = '300px';
  dialogEl.style.padding = '20px';
  dialogEl.style.borderRadius = '14px';
  dialogEl.style.fontSize = '12px';
  dialogEl.showModal();

  const { title, message } = options;

  createApp({
    render() {
      return h('div', null, [
        title &&
          h(
            'h2',
            {
              style: {
                color: '#323233',
                fontWeight: 600,
                fontSize: '18px',
                height: '24px',
                marginBottom: '20px',
                textAlign: 'center',
              },
            },
            title
          ),
        h('p', null, message),
      ]);
    },
  }).mount(dialogEl);

  dialogEl.onclick = function () {
    this.remove();
  };
}
