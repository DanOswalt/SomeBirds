/*
Todos:
- Squiggly worm
- Size of elements?
- bounce off boundaries?
- generate in window bounds
- bird sounds (mutable)
*/

const randBetween = (min, max) => { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const getColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const STATE = {
  MOVE: "move",
  PAUSE: "pause"
};
  
const DIRECTION = {
  LEFT: "left",
  RIGHT: "right"
}

const BODY_COLORS = [
  { primary: '#000', secondary: '#222' },
  { primary: 'coral', secondary: 'tomato' },
  { primary: 'DARKTURQUOISE', secondary: 'TEAL' },
]

const EYE_COLORS = [
  'black',
  'black',
  'black',
  'black',
  'black',
  'black',
  'TEAL',
  'TEAL',
  'TEAL',
  'TAN',
  'red'
]

const BEAK_COLORS = [
  'gold',
  'gold',
  'gold',
  'PERU',
  'PERU',
  'PERU',
  'black',
  'black',
  'black',
  'pink'
]

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
  birds = [];
  numBirds = 7;
  $stats = document.getElementsByClassName('stats')[0];
  $restartBtn = document.getElementsByClassName('restart-btn')[0];
  SPRITE_SIZE = 50;
  currentBest = null;
  currentBestAmount = 0;
  bounds = {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - this.SPRITE_SIZE,
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - this.SPRITE_SIZE
  }

  init() {
    const savedBirds = JSON.parse(localStorage.getItem('birds'));
    if (savedBirds) {
      this.rehydrateSavedBirds(savedBirds);
    } else {
      this.getABunchOfBirds(this.numBirds);
    }
    this.registerListeners();
    this.scheduler.start(this.animateNextTick.bind(this));
  }

  rehydrateSavedBirds(birds) {
    birds.forEach(bird => {
      this.birds.push(new Bird(bird))
    })
  }
  
  getABunchOfBirds(n) {
    for (let i = 0; i < n; i++) {
      this.birds.push(new Bird({
        id: i,
        x: randBetween(0, this.bounds.width),
        y: randBetween(60, this.bounds.height) 
      }))
    }
  }
  
  registerListeners() {
    this.birds.forEach(bird => {
      bird.DOMRef.addEventListener("mouseover", (e) => {
        this.updateStatsDisplay(bird);
      });
      bird.DOMRef.addEventListener("click", (e) => {
        this.updateStatsDisplay(bird);
      })
    })

    this.$restartBtn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem('birds');
      this.init();
    });
  }
  
  updateStatsDisplay(bird) {
    this.$stats.innerHTML = `${bird.name}. Worms eaten: ${bird.wormsEaten}.`
  }

  findWormChamp() {
    // this.currentBest = null;
    // this.currentBestAmount = 0;

    this.birds.forEach(bird => {
      bird.isWormChamp = false;
      if (bird.wormsEaten > this.currentBestAmount) {
        this.currentBest = bird;
        this.currentBestAmount = bird.wormsEaten;
      }
    })

    if (this.currentBest) {
      this.currentBest.isWormChamp = true;
    }
  }

  animateNextTick() {
    this.findWormChamp();

    this.birds.forEach(bird => {
      bird.updateForTick(this.bounds.height, this.bounds.width);
      bird.draw();  
    })

    localStorage.setItem('birds', JSON.stringify(this.birds));
    // this.updateDebugger();
  }
  
  updateDebugger() {
    const $debug = document.getElementsByClassName('debug')[0];
    const json = JSON.stringify({ 
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      viewportWidth: this.viewport.width,
      viewportHeight: this.viewport.height
    }, undefined, 2)
    $debug.innerHTML = json;
  }
}

class Bird {
  id;
  name;
  state;
  direction;
  showFeet;
  wingUp;
  flit;
  blink;
  peck;
  gotWorm;
  wormsEaten;
  isWormChamp;
  primary;
  secondary;
  beakColor;
  eyeColor;
  horizontalChange = 0; // move this number of pixels x axis
  verticalChange = 0; // move this number of pixels y axis
  x = 0; // current x coordinate
  y = 0; // current y coordinate
  duration = 0; // number of ticks to hold state
  currentTicksElapsed = 0; // count of current ticks for current state
  DOMRef = null;
  
  constructor(opts) {
    const { primary, secondary } = BODY_COLORS[randBetween(1, BODY_COLORS.length) - 1];
    this.x = opts.x;
    this.y = opts.y;
    this.id = opts.id;
    this.name = opts.name || chance.first();
    this.state = opts.state || STATE.PAUSE;
    this.direction = opts.direction || DIRECTION.LEFT;
    this.showFeet = !!opts.showFeet;
    this.wingUp = !!opts.wingUp;
    this.flit = !!opts.flit;
    this.blink = !!opts.blink;
    this.peck = !!opts.peck;
    this.gotWorm = !!opts.gotWorm;
    this.wormsEaten = opts.wormsEaten || 0;
    this.isWormChamp = !!opts.isWormChamp;
    this.primary = opts.primary || primary;
    this.secondary = opts.secondary || secondary;
    this.beakColor = opts.beakColor || BEAK_COLORS[randBetween(1, BEAK_COLORS.length) - 1];
    this.eyeColor = opts.eyeColor || EYE_COLORS[randBetween(1, EYE_COLORS.length) - 1];
    this.init();
  }
  
  init() {
    this.createBirdSpriteSVG(this.id);
    this.getElementRefs();
    this.draw();
    this.getNextState();
  }
  
  getElementRefs() {
    this.DOMRef = document.getElementById('bird-sprite-' + this.id);
    this.$bird = this.DOMRef.getElementsByClassName('bird')[0];
    this.$body = this.$bird.getElementsByClassName('body')[0];
    this.$wingUp = this.$body.getElementsByClassName('wingUp')[0];
    this.$wingDown = this.$body.getElementsByClassName('wingDown')[0];
    this.$head = this.$bird.getElementsByClassName('head')[0];
    this.$crown = this.$head.getElementsByClassName('crown')[0];
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

    // is worm champ?
    if (this.isWormChamp) {
      this.$crown.classList.remove("hide");
    } else {
      this.$crown.classList.add("hide");
    }

  }
  
  updateForTick(boundsHeight, boundsWidth) {
    if (this.x + this.horizontalChange > boundsWidth || this.x + this.horizontalChange < 0) {
      this.x -= this.horizontalChange;
    } else {
      this.x += this.horizontalChange;
    }

    if (this.y + this.verticalChange > boundsHeight || this.y + this.verticalChange < 60) {
      this.y -= this.verticalChange;
    } else {
      this.y += this.verticalChange;
    }
    
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
      this.blink = randBetween(1, 20) === 20;
 
      // randomly look up and around
      if (!this.flit && randBetween(1, 40) === 40) {
        this.flit = true;
      } else if (this.flit && randBetween(1, 10) === 10) {
        this.flit = false;
      }
      
      // peck
      if (!this.flit) {
        if (!this.peck && randBetween(1, 40) === 40) {
          this.peck = true;
          this.gotWorm = false;
        } else if (this.peck && randBetween(1, 10) === 10) {
          const hadWorm = this.gotWorm;
          this.peck = false;
          this.gotWorm = randBetween(1, 5) === 5;
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
    this.state = randBetween(0,1) === 1 ? STATE.MOVE : STATE.PAUSE;
    if (this.state === STATE.PAUSE) {
      this.horizontalChange = 0;
      this.verticalChange = 0;
      this.duration = randBetween(10, 20);
      this.showFeet = true;
    }
    
    if (this.state === STATE.MOVE) {
      this.horizontalChange = randBetween(-10, 10) ;
      this.verticalChange = randBetween(-10, 10) ;
      this.duration = randBetween(10, 20);
      this.showFeet = false;
    }    
  }
  
  createBirdSpriteSVG(index) {
    const spriteContainer = document.createElement('div');
    spriteContainer.id = "bird-sprite-" + index;
    spriteContainer.classList.add('bird-sprite');
    
    const spriteSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    spriteSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    spriteSVG.setAttribute("viewBox", "0 0 100 100");
    spriteSVG.setAttribute("data-id", this.id)
 
    const bird = this.createSVGElement('g', 'bird');
    const body = this.createSVGElement('g', 'body');
    const head = this.createSVGElement('g', 'head'); 
    const feet = this.createSVGElement('g', 'feet');
    
    const bodyShape = this.createSVGElement('circle', 'bodyShape', {
      cx: '50',
      cy: '50',
      r: '30',
      fill: this.primary
    });
    
    const wingUp = this.createSVGElement('polygon', 'wingUp', {
      points: "25 50 65 50 35 20",
      fill: this.secondary
    });
    
    const wingDown = this.createSVGElement('polygon', 'wingDown', {
      points: "25 50 65 50 35 80",
      fill: this.secondary
    });

    const crown = this.createSVGElement('polygon', 'crown', {
      points: "59 0 66 5 71 0 76 5 83 0 80 10 62 10",
      fill: 'yellow'
    });
    
    const skull = this.createSVGElement('circle', 'skull', {
      cx: 70,
      cy: 30,
      r: 16,
      fill: this.primary
    });
    
    const eye = this.createSVGElement('circle', 'eye', {
      cx: 70,
      cy: 30,
      r: 6,
      fill: this.eyeColor
    });
    
    const blink = this.createSVGElement('line', 'blink', {
      x1: 78,
      x2: 62,
      y1: 30,
      y2: 30,
      stroke: "#333",
      'stroke-width': 2
    });
    
    const beak = this.createSVGElement('polygon', 'beak', {
      points: "85 22 95 30 85 38",
      fill: this.beakColor
    })
    
    const worm = this.createSVGElement('line', 'worm', {
      x1: 95,
      x2: 95,
      y1: 16,
      y2: 34,
      stroke: "#333",
      'stroke-width': 2
    });
    
    const leftFoot = this.createSVGElement('line', 'leftFoot', {
      x1: 45,
      x2: 43,
      y1: 80,
      y2: 100,
      stroke: "orange",
      'stroke-width': 3
    });
    
    const rightFoot = this.createSVGElement('line', 'rightFoot', {
      x1: 55,
      x2: 57,
      y1: 80,
      y2: 100,
      stroke: "orange",
      'stroke-width': 3
    });
    
    body.appendChild(bodyShape);
    body.appendChild(wingUp);
    body.appendChild(wingDown);
    
    head.appendChild(skull);
    head.appendChild(eye);
    head.appendChild(blink);
    head.appendChild(beak);
    head.appendChild(worm);
    head.appendChild(crown);
    
    feet.appendChild(leftFoot);
    feet.appendChild(rightFoot);
    
    bird.appendChild(body);
    bird.appendChild(head);
    bird.appendChild(feet);
    spriteSVG.appendChild(bird);
    spriteContainer.appendChild(spriteSVG);
    
    const view = document.getElementsByClassName('view')[0];
    view.appendChild(spriteContainer);
  }
  
  createSVGElement(type, name, attributes) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    element.classList.add(name);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key])
    }
    return element;
  }
}

// create app and start it up
new AnimationController().init();