document.addEventListener('DOMContentLoaded', () => {
  const popupOverlay = document.getElementById('independent-popup-overlay');
  if (!popupOverlay) {
    return;
  }

  const form = document.getElementById('independent-popup-form');

  // Prevent attaching listener multiple times if script is loaded more than once
  if (form.dataset.listenerAttached === 'true') {
    return;
  }
  form.dataset.listenerAttached = 'true';

  const closeButton = document.querySelector('.independent-popup-close');
  const successMessage = document.getElementById('independent-popup-success-message');
  const container = document.querySelector('.independent-popup-container');
  const bgImage = document.querySelector('.independent-popup-bg');
  const isDesignMode = typeof Shopify !== 'undefined' && Shopify.designMode;

  // Adjust container aspect ratio based on image dimensions
  if (bgImage) {
    bgImage.onload = () => {
      const aspectRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      container.style.aspectRatio = aspectRatio;
    };
    if (bgImage.complete && bgImage.naturalWidth > 0) {
      const aspectRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      container.style.aspectRatio = aspectRatio;
    }
  }

  const showPopup = () => {
    popupOverlay.style.display = 'flex';
    setTimeout(() => {
        popupOverlay.classList.add('is-visible');
    }, 10);
  };

  const hidePopup = () => {
    popupOverlay.classList.remove('is-visible');
    setTimeout(() => {
        popupOverlay.style.display = 'none';
    }, 300);
  };

  if (isDesignMode) {
    // In the theme editor, always show the popup immediately so the admin can see changes.
    showPopup();
  } else {
    // On the live site, use delay and session storage.
    const delay = parseInt(popupOverlay.dataset.popupDelay || '5', 10) * 1000;
    if (delay >= 0) {
      setTimeout(() => {
        if (!sessionStorage.getItem('independentPopupShown')) {
            showPopup();
            sessionStorage.setItem('independentPopupShown', 'true');
        }
      }, delay);
    }
  }

  // Event listeners
  closeButton.addEventListener('click', hidePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      hidePopup();
    }
  });

  // Copy button logic
  const copyButton = document.getElementById('independent-popup-copy-button');
  if (copyButton) {
    const originalButtonText = copyButton.textContent;
    copyButton.addEventListener('click', () => {
        const valueToCopy = copyButton.dataset.copyValue;
        if (valueToCopy && navigator.clipboard) {
            navigator.clipboard.writeText(valueToCopy).then(() => {
                copyButton.textContent = 'ĐÃ SAO CHÉP!';
                setTimeout(() => {
                    copyButton.textContent = originalButtonText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    });
  }

  // Form submission logic
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isDesignMode) {
      alert('Gửi form đã được vô hiệu hóa trong trình tùy chỉnh theme.');
      return;
    }
    const nameInput = document.getElementById('independent-popup-name');
    const phoneInput = document.getElementById('independent-popup-phone');
    const submitButton = form.querySelector('button[type="submit"]');

    const webhookUrl = window.independentPopupWebhook;
    if (!webhookUrl) {
      console.error('Independent Popup: Webhook URL is not defined.');
      return;
    }

    if (nameInput.value.trim() === '' || phoneInput.value.trim() === '') {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    const data = {
      "user_name": nameInput.value,
      "user_phone": phoneInput.value,
    };
    
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'no-cors' 
    })
    .then(() => {
      form.style.display = 'none';
      successMessage.style.display = 'block'; 

    })
    .catch((error) => {
      console.error('Independent Popup Form Error:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      submitButton.disabled = false;
      submitButton.textContent = form.dataset.originalButtonText || 'Gửi';
    });
  });

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    form.dataset.originalButtonText = submitButton.textContent;
  }
}); 