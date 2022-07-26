import {isEscape, buttonActive} from './util.js';
import {
  validateHashTagCount,
  validateHashTagText,
  validateHashTagRepeat,
  validateComment,
  validateHashTagSize
} from './validation-functions.js';
import {decreasePictureScale, increasePictureScale} from './publication-scaling.js';
import {changeEffect} from './publication-effects.js';
import {sendForm} from './api.js';

const bodyElement = document.querySelector('body');
const formElement = bodyElement.querySelector('.img-upload__form');
const publicationEditorElement = formElement.querySelector('.img-upload__overlay');
const fileUploaderElement = formElement.querySelector('#upload-file');
const picturePreviewElement = formElement.querySelector('.img-upload__preview').querySelector('img');
const buttonCancelElement = formElement.querySelector('#upload-cancel');
const effectsPreviewElements = formElement.querySelectorAll('.effects__preview');
const hashTagInputElement = formElement.querySelector('.text__hashtags');
const commentInputElement = formElement.querySelector('.text__description');
const formSubmitButtonElement = formElement.querySelector('.img-upload__submit');
const inputContainersElements = formElement.querySelectorAll('.img-upload__field-wrapper');
const pristine = new Pristine(formElement, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--error',
  successClass: 'img-upload__field-wrapper--valid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'span',
  errorTextClass: 'img-upload__field-error-text'
});

const buttonMinusScaleElement = formElement.querySelector('.scale__control--smaller');
const buttonPlusScaleElement = formElement.querySelector('.scale__control--bigger');
const inputScaleElement = formElement.querySelector('.scale__control--value');
const effectInputElement = formElement.querySelector('.effect-level__value');
const effectSliderContainerElement = formElement.querySelector('.img-upload__effect-level');
const effectSliderElement = effectSliderContainerElement.querySelector('.effect-level__slider');
const effectRadiosElement = formElement.querySelector('.effects__list');
const effectRadioNoneElement = formElement.querySelector('#effect-none');
noUiSlider.create(effectSliderElement, {
  range: {
    min: 0,
    max: 100,
  },
  start: 0,
  step: 1,
  connect: 'lower',
  format: {
    to: function (value) {
      if (Number.isInteger(value)) {
        return value.toFixed(0);
      }
      return value.toFixed(1);
    },
    from: function (value) {
      return parseFloat(value);
    },
  },
});

const onFormSubmit = (evt) => {
  evt.preventDefault();
  if (pristine.validate()) {
    const formData = new FormData(evt.target);
    sendForm(formData);
  }
};

const closeFormWindow = () => {
  publicationEditorElement.classList.add('hidden');
  bodyElement.classList.remove('modal-open');
  fileUploaderElement.value = '';
  hashTagInputElement.removeEventListener('focusout', addEscListenerOnHashTag);
  commentInputElement.removeEventListener('focusout', addEscListenerOnComment);
  hashTagInputElement.removeEventListener('focus', removeEscListenerOnHashTag);
  commentInputElement.removeEventListener('focus', removeEscListenerOnComment);
  buttonCancelElement.removeEventListener('click', onButtonClose);
  buttonCancelElement.removeEventListener('click', onEscapeClose);
  buttonMinusScaleElement.removeEventListener('click', decreasePictureScale);
  buttonMinusScaleElement.removeEventListener('click', increasePictureScale);
  inputScaleElement.value = '100%';
  hashTagInputElement.value = '';
  commentInputElement.value = '';
  picturePreviewElement.classList = '';
  picturePreviewElement.style = '';
  effectRadioNoneElement.checked = true;
  effectSliderElement.noUiSlider.reset();
  inputContainersElements.forEach((container) => {
    container.classList.remove('img-upload__field-wrapper--error');
  });
  buttonActive(formSubmitButtonElement, 'Опубликовать');
  formElement.removeEventListener('submit', onFormSubmit);
  const allErrorSpan = formElement.querySelectorAll('.pristine-error');
  allErrorSpan.forEach((errorSpan) => {
    errorSpan.textContent = '';
  });
};

function onButtonClose() {
  closeFormWindow();
}

function onEscapeClose(evt) {
  if (isEscape(evt)) {
    closeFormWindow();
  }
}

function removeEscListenerOnHashTag() {
  window.removeEventListener('keydown', onEscapeClose);
}

function addEscListenerOnHashTag() {
  window.addEventListener('keydown', onEscapeClose);
}

function removeEscListenerOnComment() {
  window.removeEventListener('keydown', onEscapeClose);
}

function addEscListenerOnComment() {
  window.addEventListener('keydown', onEscapeClose);
}

pristine.addValidator(hashTagInputElement, validateHashTagCount, 'Максимальное количество хэш-тегов 5');
pristine.addValidator(hashTagInputElement, validateHashTagRepeat, 'Хэш-теги не должны повторяться');
pristine.addValidator(hashTagInputElement, validateHashTagText, 'Хэш-тег должен начинаться с # и содержать только буквы и символы');
pristine.addValidator(commentInputElement, validateComment, 'Максимальное количество символов 140');
pristine.addValidator(hashTagInputElement, validateHashTagSize, 'Максимальный размер хэштега 20 символов');

const addFormListener = () => {
  fileUploaderElement.addEventListener('change', () => {

    publicationEditorElement.classList.remove('hidden');
    bodyElement.classList.add('modal-open');

    const fileReader = new FileReader();
    fileReader.onload = (evt) => {
      picturePreviewElement.src = evt.target.result;

      effectsPreviewElements.forEach((effectPreview) => {
        effectPreview.style.backgroundImage = `url(${picturePreviewElement.src})`;
      });
    };
    fileReader.readAsDataURL(fileUploaderElement.files[0]);
    picturePreviewElement.style = '';

    buttonCancelElement.addEventListener('click', onButtonClose);
    window.addEventListener('keydown', onEscapeClose);

    inputScaleElement.value = '100%';
    picturePreviewElement.style.transform = 'scale(100%)';
    buttonMinusScaleElement.addEventListener('click', decreasePictureScale);
    buttonPlusScaleElement.addEventListener('click', increasePictureScale);

    picturePreviewElement.classList.add('effects__preview--none');
    effectSliderContainerElement.classList.add('hidden');
    effectSliderElement.noUiSlider.on('update', () => {
      effectInputElement.value = effectSliderElement.noUiSlider.get();
    });

    effectRadiosElement.addEventListener('change', changeEffect);

    hashTagInputElement.addEventListener('focus', removeEscListenerOnHashTag);
    commentInputElement.addEventListener('focus', removeEscListenerOnComment);
    hashTagInputElement.addEventListener('focusout', addEscListenerOnHashTag);
    commentInputElement.addEventListener('focusout', addEscListenerOnComment);

    formElement.addEventListener('submit', onFormSubmit);
  });
};

export {
  addFormListener,
  effectSliderElement,
  picturePreviewElement,
  effectSliderContainerElement,
  inputScaleElement,
  closeFormWindow,
  formSubmitButtonElement
};
