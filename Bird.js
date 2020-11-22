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
    const { primary, secondary } = BODY_COLORS[
      randBetween(1, BODY_COLORS.length) - 1
    ];
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
    this.beakColor =
      opts.beakColor ||
      BEAK_COLORS[randBetween(1, BEAK_COLORS.length) - 1];
    this.eyeColor =
      opts.eyeColor ||
      EYE_COLORS[randBetween(1, EYE_COLORS.length) - 1];
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
      this.DOMRef.classList.remove('flipYAxis');
    } else {
      this.DOMRef.classList.add('flipYAxis');
    }

    // update feet visibility
    if (this.showFeet) {
      this.$feet.classList.remove('hide');
    } else {
      this.$feet.classList.add('hide');
    }

    // update wing action
    if (this.wingUp) {
      this.$wingUp.classList.remove('hide');
      this.$wingDown.classList.add('hide');
    } else {
      this.$wingUp.classList.add('hide');
      this.$wingDown.classList.remove('hide');
    }

    // flit head
    if (this.flit) {
      this.$head.classList.add('flit-40');
    } else {
      this.$head.classList.remove('flit-40');
    }

    // blink
    if (this.blink) {
      this.$eye.classList.add('hide');
      this.$blink.classList.remove('hide');
    } else {
      this.$eye.classList.remove('hide');
      this.$blink.classList.add('hide');
    }

    // peck
    if (this.peck) {
      this.$head.classList.add('peck');
    } else {
      this.$head.classList.remove('peck');
    }

    // got worm?
    if (this.gotWorm) {
      this.$worm.classList.remove('hide');
    } else {
      this.$worm.classList.add('hide');
    }

    // is worm champ?
    if (this.isWormChamp) {
      this.$crown.classList.remove('hide');
    } else {
      this.$crown.classList.add('hide');
    }
  }

  updateModelForTick(boundsHeight, boundsWidth) {
    if (
      this.x + this.horizontalChange > boundsWidth ||
      this.x + this.horizontalChange < 0
    ) {
      this.x -= this.horizontalChange;
    } else {
      this.x += this.horizontalChange;
    }

    if (
      this.y + this.verticalChange > boundsHeight ||
      this.y + this.verticalChange < 60
    ) {
      this.y -= this.verticalChange;
    } else {
      this.y += this.verticalChange;
    }

    if (this.state === STATE.MOVE) {
      this.flit = false;
      this.peck = false;
      this.gotWorm = false;
      this.wingUp = this.currentTicksElapsed % 3 === 0;
      this.direction =
        this.horizontalChange > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
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
    this.state = randBetween(0, 1) === 1 ? STATE.MOVE : STATE.PAUSE;
    if (this.state === STATE.PAUSE) {
      this.horizontalChange = 0;
      this.verticalChange = 0;
      this.duration = randBetween(10, 20);
      this.showFeet = true;
    }

    if (this.state === STATE.MOVE) {
      this.horizontalChange = randBetween(-10, 10);
      this.verticalChange = randBetween(-10, 10);
      this.duration = randBetween(10, 20);
      this.showFeet = false;
    }
  }

  createBirdSpriteSVG(index) {
    const spriteContainer = document.createElement('div');
    spriteContainer.id = 'bird-sprite-' + index;
    spriteContainer.classList.add('bird-sprite');

    const spriteSVG = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    spriteSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    spriteSVG.setAttribute('viewBox', '0 0 100 100');
    spriteSVG.setAttribute('data-id', this.id);

    const bird = this.createSVGElement('g', 'bird');
    const body = this.createSVGElement('g', 'body');
    const head = this.createSVGElement('g', 'head');
    const feet = this.createSVGElement('g', 'feet');

    const bodyShape = this.createSVGElement('circle', 'bodyShape', {
      cx: '50',
      cy: '50',
      r: '30',
      fill: this.primary,
    });

    const wingUp = this.createSVGElement('polygon', 'wingUp', {
      points: '25 50 65 50 35 20',
      fill: this.secondary,
    });

    const wingDown = this.createSVGElement('polygon', 'wingDown', {
      points: '25 50 65 50 35 80',
      fill: this.secondary,
    });

    const crown = this.createSVGElement('polygon', 'crown', {
      points: '59 0 66 5 71 0 76 5 83 0 80 10 62 10',
      fill: 'yellow',
    });

    const skull = this.createSVGElement('circle', 'skull', {
      cx: 70,
      cy: 30,
      r: 16,
      fill: this.primary,
    });

    const eye = this.createSVGElement('circle', 'eye', {
      cx: 70,
      cy: 30,
      r: 6,
      fill: this.eyeColor,
    });

    const blink = this.createSVGElement('line', 'blink', {
      x1: 78,
      x2: 62,
      y1: 30,
      y2: 30,
      stroke: '#333',
      'stroke-width': 2,
    });

    const beak = this.createSVGElement('polygon', 'beak', {
      points: '85 22 95 30 85 38',
      fill: this.beakColor,
    });

    const worm = this.createSVGElement('line', 'worm', {
      x1: 95,
      x2: 95,
      y1: 16,
      y2: 34,
      stroke: '#333',
      'stroke-width': 2,
    });

    const leftFoot = this.createSVGElement('line', 'leftFoot', {
      x1: 45,
      x2: 43,
      y1: 80,
      y2: 100,
      stroke: 'orange',
      'stroke-width': 3,
    });

    const rightFoot = this.createSVGElement('line', 'rightFoot', {
      x1: 55,
      x2: 57,
      y1: 80,
      y2: 100,
      stroke: 'orange',
      'stroke-width': 3,
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
    const element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      type,
    );
    element.classList.add(name);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    return element;
  }
}
