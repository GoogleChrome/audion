import {Observer} from '../../utils/Observer';

import style from './WholeGraphButton.css';
import wholeGraphButtonImage from './WholeGraphButton.svg';

/**
 * Render a button. Can be observed for when the button is clicked.
 */
export class WholeGraphButton {
  /** Create a WholeGraphButton. */
  constructor() {
    this.view = null;

    this._clickNext = null;
    this._clickObserver = new Observer((onNext) => {
      this._clickNext = onNext;
      return () => {
        this._clickNext = null;
      };
    });

    this.click = this.click.bind(this);
  }

  /**
   * @param {function({event: 'resizeView'}): void} onNext
   * @param {function(): void} [onComplete]
   * @param {function(Error): void} [onError]
   * @return {function(): void}
   */
  observe(onNext, onComplete, onError) {
    return this._clickObserver.observe(() => {
      onNext({event: 'resizeView'});
    });
  }

  /** Send a click event through the button. */
  click() {
    if (this._clickNext) {
      this._clickNext();
    }
  }

  /**
   * Render the button.
   * @return {WholeGraphButton}
   */
  render() {
    if (this.view === null) {
      this.view = document.createElement('div');
      this.view.className = style.wholeGraphButton;
      this.view.addEventListener('click', this.click);
      this.view.innerHTML = `<img src="${wholeGraphButtonImage}"
        alt="Resize to fit"
        title="Resize to fit" />`;
    }
    return this;
  }
}
