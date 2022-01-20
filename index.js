"use strict";
/*
Game Loop
Danny Clyde
CS5410
*/
// DEFINITIONS
class GameLoopEvent {
}
class GameLoopForm extends GameLoopEvent {
    updateValidity() {
        this.errorMsg = undefined;
        if (!this.name) {
            this.errorMsg = 'Event name is required!';
        }
        else if (!this.interval || this.interval < 50) {
            this.errorMsg = 'Interval must be > 50ms!';
        }
        else if (!this.timesRemaining || this.timesRemaining < 1) {
            this.errorMsg = 'Number of Times must be > 1!';
        }
    }
    toEvent() {
        const event = new GameLoopEvent();
        event.name = this.name;
        event.interval = this.interval;
        event.timesRemaining = this.timesRemaining;
        return event;
    }
}
class GameLoopModel {
    constructor() {
        this.events = [];
        this.eventsToRender = [];
    }
    addEvent(event) {
        this.events[this.events.length] = event;
    }
    update(elapsed) {
        this.eventsToRender.length = 0;
        for (let i = 0; i < this.events.length; i++) {
            this.checkShouldFireEvent(this.events[i], elapsed);
        }
        this.cleanupFinishedEvents();
    }
    getEventsToRender() {
        return this.eventsToRender.map((event) => {
            const el = document.createElement('div');
            el.classList.add('event');
            el.innerText = `Event "${event.name}" fired! ${event.timesRemaining} times remaining!`;
            return el;
        });
    }
    checkShouldFireEvent(event, elapsed) {
        event.timeElapsed = (event.timeElapsed || 0) + elapsed;
        if (event.interval && event.interval < event.timeElapsed) {
            this.eventsToRender[this.eventsToRender.length] = event;
            event.timesRemaining = (event.timesRemaining || 0) - 1;
            event.timeElapsed = 0;
        }
    }
    cleanupFinishedEvents() {
        for (let i = 0; i < this.events.length; i++) {
            if ((this.events[i].timesRemaining || 0) <= 0) {
                this.events.splice(i, 1);
            }
        }
    }
}
// INITIALIZATION
const eventForm = new GameLoopForm();
const submitBtn = document.getElementById('submit-btn');
const eventContainer = document.getElementById('event-container');
const formEl = document.querySelector('form');
let elapsedTime = 0;
let prevTime = performance.now();
const gameModel = new GameLoopModel();
gameLoop(performance.now());
function onInputChange(event, fieldName) {
    var _a, _b, _c;
    if (fieldName !== 'name') {
        const value = ((_a = event.target) === null || _a === void 0 ? void 0 : _a.value) ? +((_b = event.target) === null || _b === void 0 ? void 0 : _b.value) : undefined;
        eventForm[fieldName] = value;
    }
    else if (fieldName === 'name') {
        const value = ((_c = event.target) === null || _c === void 0 ? void 0 : _c.value) || undefined;
        eventForm[fieldName] = value;
    }
    eventForm.updateValidity();
    updateFormDisabledState(eventForm.errorMsg);
}
function updateFormDisabledState(error) {
    var _a, _b, _c;
    const existingError = (_a = submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.parentNode) === null || _a === void 0 ? void 0 : _a.querySelector('.error-msg');
    if (existingError) {
        (_b = submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(existingError);
    }
    if (submitBtn) {
        submitBtn.disabled = !!error;
    }
    if (error) {
        (_c = submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.parentNode) === null || _c === void 0 ? void 0 : _c.appendChild(getErrorElement(error));
    }
}
function onSubmit(event) {
    event.preventDefault();
    gameModel.addEvent(eventForm.toEvent());
    formEl === null || formEl === void 0 ? void 0 : formEl.reset();
}
function getErrorElement(error) {
    const el = document.createElement('div');
    el.classList.add('error-msg');
    el.innerText = error;
    return el;
}
// GAME LOOP
function gameLoop(timestamp) {
    elapsedTime = timestamp - prevTime;
    update(elapsedTime);
    render();
    prevTime = timestamp;
    requestAnimationFrame(gameLoop);
}
function update(elapsedTime) {
    gameModel.update(elapsedTime);
}
function render() {
    const elements = gameModel.getEventsToRender();
    for (let i = 0; i < elements.length; i++) {
        eventContainer.appendChild(elements[i]);
        eventContainer.scrollTop = eventContainer.scrollHeight;
    }
}
