/*
Game Loop
Danny Clyde
CS5410
*/


// DEFINITIONS

class GameLoopEvent {
  public name?: string;
  public interval?: number;
  public timesRemaining?: number;
  public timeElapsed?: number;
}

class GameLoopForm extends GameLoopEvent {
  public errorMsg?: string;
  public updateValidity() {
    this.errorMsg = undefined;
    if (!this.name) {
      this.errorMsg = 'Event name is required!';
    } else if (!this.interval || this.interval < 50) {
      this.errorMsg = 'Interval must be > 50ms!';
    } else if (!this.timesRemaining || this.timesRemaining < 1) {
      this.errorMsg = 'Number of Times must be > 1!';
    }
  }

  public toEvent(): GameLoopEvent {
    const event = new GameLoopEvent();
    event.name = this.name;
    event.interval = this.interval;
    event.timesRemaining = this.timesRemaining;
    return event;
  }
}

class GameLoopModel {
  public events: GameLoopEvent[] = [];
  public eventsToRender: GameLoopEvent[] = [];
  public addEvent(event: GameLoopEvent) {
    this.events[this.events.length] = event;
  }
  public update(elapsed: number) {
    this.eventsToRender.length = 0;
    for (let i = 0; i < this.events.length; i++) {
      this.checkShouldFireEvent(this.events[i], elapsed);
    }
    this.cleanupFinishedEvents();
  }

  public getEventsToRender() {
    return this.eventsToRender.map((event: GameLoopEvent) => {
      const el = document.createElement('div');
      el.classList.add('event');
      el.innerText = `Event "${event.name}" fired! ${event.timesRemaining} times remaining!`;
      return el;
    });
  }

  private checkShouldFireEvent(event: GameLoopEvent, elapsed: number) {
    event.timeElapsed = (event.timeElapsed || 0) + elapsed;
    if (event.interval && event.interval < event.timeElapsed) {
      this.eventsToRender[this.eventsToRender.length] = event;
      event.timesRemaining = (event.timesRemaining || 0) - 1;
      event.timeElapsed = 0;
    }
  }

  private cleanupFinishedEvents() {
    for (let i = 0; i < this.events.length; i++) {
      if ((this.events[i].timesRemaining || 0) <= 0) {
        this.events.splice(i, 1);
      }
    }
  }
}

// INITIALIZATION
const eventForm = new GameLoopForm();
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const eventContainer = document.getElementById('event-container') as HTMLDivElement;
const formEl = document.querySelector('form') as HTMLFormElement;
let elapsedTime: number = 0;
let prevTime: number = performance.now();
const gameModel = new GameLoopModel();
gameLoop(performance.now());


function onInputChange(event: KeyboardEvent, fieldName: keyof GameLoopEvent) {
  if (fieldName !== 'name') {
    const value: number | undefined = (event.target as HTMLInputElement)?.value ? +(event.target as HTMLInputElement)?.value : undefined;
    eventForm[fieldName] = value;
  } else if (fieldName === 'name') {
    const value: string | undefined = (event.target as HTMLInputElement)?.value || undefined;
    eventForm[fieldName] = value;
  }
  eventForm.updateValidity();
  updateFormDisabledState(eventForm.errorMsg);
}

function updateFormDisabledState(error?: string) {
  const existingError = submitBtn?.parentNode?.querySelector('.error-msg');
  if (existingError) {
    submitBtn?.parentNode?.removeChild(existingError);
  }
  if (submitBtn) {
    submitBtn.disabled = !!error;
  }
  if (error) {
    submitBtn?.parentNode?.appendChild(getErrorElement(error));
  }
}

function onSubmit(event: SubmitEvent) {
  event.preventDefault();
  gameModel.addEvent(eventForm.toEvent());
  formEl?.reset();
}

function getErrorElement(error: string): HTMLDivElement {
  const el = document.createElement('div');
  el.classList.add('error-msg');
  el.innerText = error;
  return el;
}

// GAME LOOP

function gameLoop(timestamp: number) {
  elapsedTime = timestamp - prevTime;
  update(elapsedTime);
  render();

  prevTime = timestamp;
  requestAnimationFrame(gameLoop);
}

function update(elapsedTime: number) {
  gameModel.update(elapsedTime);
}

function render() {
  const elements = gameModel.getEventsToRender();
  for (let i = 0; i < elements.length; i++) {
    eventContainer.appendChild(elements[i]);
    eventContainer.scrollTop = eventContainer.scrollHeight;
  }
}
