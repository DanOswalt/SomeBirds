/*
Todos:
- Draw Tail
- Head flit while standing, rotate transform on head?
- Eating STATE
- Rotate entire body downward.
- Random chance of worm
- Eye blink?

- Once bird is done, generate lots of 'em
- Dynamic color, position, possibly size of parts.
- Name, click for name and number of worms consumed?
*/

const STATE = {
  MOVE: "move",
  PAUSE: "pause"
};
  
const DIRECTION = {
  LEFT: "left",
  RIGHT: "right"
}

// clock, use ticks to schedule animations
class Scheduler { 
  _tick = 0;
  _nextTimeToTick = 0;
  TICK_RATE = 100;
  scheduledFunction = null;
  
  tick() {
    this._tick += 1;
  }

  currentTime() {
    return this._tick;
  }
  
  start(fn) {
    this._nextTimeToTick = Date.now();
    this.scheduledFunction = fn;
    this.checkForNextFrame();
  }
  
  checkForNextFrame() {
    const now = Date.now();
    if (this._nextTimeToTick <= now) {
      this.tick();
      this._nextTimeToTick = now + this.TICK_RATE;
      this.scheduledFunction();
    }
    requestAnimationFrame(() => { this.checkForNextFrame() });
  }

}

//logic for animation
class AnimationController {
  scheduler = new Scheduler();
  sprites = [
    new Sprite({ id: 0, x: 500, y: 500 }),
    new Sprite({ id: 1, x: 600, y: 600 })
  ]
  // sprite = new Sprite({ id: 0, x: 500, y: 500 });
  
  init() {
    this.scheduler.start(this.animateNextTick.bind(this));
    this.sprites.forEach(sprite => {
      sprite.init();
      sprite.createBirdSpriteSVG(2);
    })
    // this.sprite.init();
  }
  
  animateNextTick() {
    this.sprites.forEach(sprite => {
      sprite.updateForTick();
      sprite.draw();  
    })
    
    this.updateDebugger();
  }
  
  updateDebugger() {
    const $debug = document.getElementsByClassName('debug')[0];
    const json = JSON.stringify(this.sprites[0], undefined, 2)
    $debug.innerHTML = json;
  }
}

class Sprite {
  state = STATE.PAUSE;
  direction = DIRECTION.LEFT;
  showFeet = true;
  wingUp = false;
  flit = false;
  blink = false;
  peck = false;
  gotWorm = false;
  wormsEaten = 0;
  horizontalChange = 0; // move this number of pixels x axis
  verticalChange = 0; // move this number of pixels y axis
  x = 0; // current x coordinate
  y = 0; // current y coordinate
  duration = 0; // number of ticks to hold state
  currentTicksElapsed = 0; // count of current ticks for current state
  id = null;
  DOMRef = null;
  
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.id = opts.id;
    this.init();
  }
  
  init() {
    this.getElementRefs();
    this.draw();
    this.getNextState();
  }
  
  getElementRefs() {
    this.DOMRef = document.getElementById('sprite-' + this.id);
    console.log(this.DOMRef)
    // this.$svg = this.DOMRef.firstElementChild;
    this.$bird = this.DOMRef.getElementsByClassName('bird')[0];
    this.$body = this.$bird.firstElementChild;
    this.$wingUp = this.$body.getElementsByClassName('wingUp')[0];
    this.$wingDown = this.$body.getElementsByClassName('wingDown')[0];
    this.$head = this.$bird.getElementsByClassName('head')[0];
    this.$eye = this.$bird.getElementsByClassName('eye')[0];
    this.$blink = this.$bird.getElementsByClassName('blink')[0];
    this.$worm = this.$bird.getElementsByClassName('worm')[0];
    this.$feet = this.$bird.lastElementChild;
  }
  
  draw() {
    // movement
    this.DOMRef.style.left = this.x + 'px';
    this.DOMRef.style.top = this.y + 'px';
    
    // update direction
    if (this.direction === DIRECTION.RIGHT) {
      this.DOMRef.classList.remove("flipYAxis");
    } else {
      this.DOMRef.classList.add("flipYAxis");
    }
    
    // update feet visibility
    if (this.showFeet) {
      this.$feet.classList.remove("hide");
    } else {
      this.$feet.classList.add("hide");
    }
    
    // update wing action
    if (this.wingUp) {
      this.$wingUp.classList.remove("hide");
      this.$wingDown.classList.add("hide");
    } else {
      this.$wingUp.classList.add("hide")
      this.$wingDown.classList.remove("hide");
    }
    
    // flit head
    if (this.flit) {
      this.$head.classList.add("flit-40");
    } else {
      this.$head.classList.remove("flit-40");
    }
    
    // blink
    if (this.blink) {
      this.$eye.classList.add("hide");
      this.$blink.classList.remove("hide");
    } else {
      this.$eye.classList.remove("hide");
      this.$blink.classList.add("hide");
    }
    
    // peck
    if (this.peck) {
      this.$head.classList.add("peck");
    } else {
      this.$head.classList.remove("peck");
    }
    
    // got worm?
    if (this.gotWorm) {
      this.$worm.classList.remove("hide");
    } else {
      this.$worm.classList.add("hide");
    }
  }
  
  updateForTick() {
    this.x += this.horizontalChange;
    this.y += this.verticalChange;
    
    if (this.state === STATE.MOVE) {
      this.flit = false;
      this.peck = false;
      this.gotWorm = false;
      this.wingUp = this.currentTicksElapsed % 3 === 0;
      this.direction = this.horizontalChange > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    }
    
    if (this.state === STATE.PAUSE) {
      this.wingUp = false;
      
      // random blink
      this.blink = this.randBetween(1, 20) === 20;
 
      // randomly look up and around
      if (!this.flit && this.randBetween(1, 40) === 40) {
        this.flit = true;
      } else if (this.flit && this.randBetween(1, 10) === 10) {
        this.flit = false;
      }
      
      // peck
      if (!this.flit) {
        if (!this.peck && this.randBetween(1, 40) === 40) {
          this.peck = true;
          this.gotWorm = false;
      } else if (this.peck && this.randBetween(1, 10) === 10) {
        const hadWorm = this.gotWorm;
        this.peck = false;
        this.gotWorm = this.randBetween(1, 5) === 5;
        if (!hadWorm && this.gotWorm) {
          this.wormsEaten += 1;
        }
      }
      }
    }

    this.currentTicksElapsed += 1;
    if (this.currentTicksElapsed === this.duration) {
      this.currentTicksElapsed = 0;
      this.getNextState();
    }
  }
  
  getNextState() {
    this.state = this.randBetween(0,1) === 1 ? STATE.MOVE : STATE.PAUSE;
    if (this.state === STATE.PAUSE) {
      this.horizontalChange = 0;
      this.verticalChange = 0;
      this.duration = this.randBetween(10, 15);
      this.showFeet = true;
    }
    
    if (this.state === STATE.MOVE) {
      this.horizontalChange = this.randBetween(-10, 10) ;
      this.verticalChange = this.randBetween(-10, 10) ;
      this.duration = this.randBetween(10, 15);
      this.showFeet = false;
    }    
  }
    
  randBetween(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  createBirdSpriteSVG(index) {
    const spriteContainer = document.createElement('div');
    spriteContainer.id = "sprite-" + index;
    spriteContainer.classList.add('sprite');
    
    const spriteSVG = document.createElement('svg');
    spriteSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    spriteSVG.setAttribute("viewBox", "0 0 100 100");
 
    // just try adding any basic thing right now
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", 10);
    circle.setAttribute("cy", 10);
    circle.setAttribute("r", 4);
    circle.setAttribute("fill", "pink");
    
    spriteSVG.appendChild(circle);
    spriteContainer.appendChild(spriteSVG);
    
    const view = document.getElementsByClassName('view')[0];
    view.appendChild(spriteContainer);
  }
}

// create app and start it up
new AnimationController().init();