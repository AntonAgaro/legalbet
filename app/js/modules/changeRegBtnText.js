const changeRegBtnText = () => {
  const min = window.matchMedia('(min-width: 769px)');
  const max = window.matchMedia('(max-width: 1400px)');
  const regBtn = document.querySelector('.modal__reg-btn');

  const changeTextContent = () => {
    if (min.matches && max.matches) {
        regBtn.textContent = 'Регистрация через почту';
      } else {
        regBtn.textContent = 'Регистрация';
      }
  };

  min.addEventListener('change', changeTextContent);
  max.addEventListener('change', changeTextContent);
  
};

export default changeRegBtnText;
