import {fromEvent} from 'rxjs';
import style from './WholeGraphButton.css';
import wholeGraphButtonImage from './WholeGraphButton.svg';

/**
 * Render a button. Can be observed for when the button is clicked.
 */
export class WholeGraphButton {
  private readonly view = document.createElement('div');

  readonly click$ = fromEvent(this.view, 'click');

  /** Create a WholeGraphButton. */
  constructor() {
    this.view.className = style.wholeGraphButton;
    this.view.innerHTML = `<img src="${wholeGraphButtonImage}"
      alt="Resize to fit"
      title="Resize to fit" />`;
  }

  /** Render the button. */
  render() {
    return this.view;
  }
}
