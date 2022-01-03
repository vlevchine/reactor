const icons = {
    success: 'check-circle',
    info: 'info',
    danger: 'exclamation-triangle',
    warning: 'exclamation-circle',
  },
  icon = (t) => icons[t] || icons.info;

const init = () => {
    const node = document.createElement('section');
    node.classList.add('toast-group');

    document.firstElementChild.insertBefore(node, document.body);
    return node;
  },
  Toaster = init(),
  options = {
    duration: 1150,
    easing: 'ease-out',
  },
  makeToast = () => {
    const template = document.createElement('template');
    template.innerHTML = `<div class="toast" role="status"><svg class="icon"><use href="#"></use></svg><span></span></div>`;
    return template.content.firstElementChild;
  },
  template = makeToast(),
  createToast = (text, type) => {
    const toast = template.cloneNode(true);
    toast.classList.add(`toast-${type}`);
    toast.childNodes[0].childNodes[0].setAttribute(
      'href',
      `#${icon(type)}-r`
    );
    toast.childNodes[1].innerText = text;
    return toast;
  };

// https://aerotwist.com/blog/flip-your-animations/
const flip = (container, fn) => {
  // FIRST
  const first = container.offsetHeight;
  // add new child to change container size
  fn();
  // LAST
  const last = container.offsetHeight;
  // INVERT
  const invert = first - last;
  // PLAY
  const animation = container.animate(
    [
      { transform: `translateY(${invert}px)` },
      { transform: 'translateY(0)' },
    ],
    options
  );
  animation.startTime = document.timeline.currentTime;
};

const addToast = (text, type) => {
    const node = createToast(text, type);

    Toaster.children.length
      ? flip(Toaster, () => Toaster.prepend(node))
      : Toaster.appendChild(node);
    return node;
  },
  showToast = (toast) => async (resolve) => {
    await Promise.allSettled(
      toast.getAnimations().map((animation) => animation.finished)
    );
    Toaster.removeChild(toast);
    resolve();
  };

const Toast = (text, type = 'info') => {
  let toast = addToast(text, type);

  return new Promise(showToast(toast));
};
const toaster = {
  info: (txt) => Toast(txt, 'info'),
  danger: (txt) => Toast(txt, 'danger'),
  warning: (txt) => Toast(txt, 'warning'),
  success: (txt) => Toast(txt, 'success'),
};

export { toaster, Toast, flip };
