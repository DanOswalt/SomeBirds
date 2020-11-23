class AnimationController {
  scheduler = new Scheduler();
  birds = [];
  numBirds = 7;
  $statsMsg = document.getElementsByClassName('stats-msg')[0];
  $birdName = document.getElementsByClassName('birdName')[0];
  $restartBtn = document.getElementsByClassName('restart-btn')[0];
  SPRITE_SIZE = 50;
  currentBest = null;
  currentBestAmount = 0;
  bounds = {
    width:
      Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      ) - this.SPRITE_SIZE,
    height:
      Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      ) - this.SPRITE_SIZE,
  };

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
    birds.forEach((bird) => {
      this.birds.push(new Bird(bird));
    });
  }

  getABunchOfBirds(n) {
    for (let i = 0; i < n; i++) {
      this.birds.push(
        new Bird({
          id: i,
          x: randBetween(0, this.bounds.width),
          y: randBetween(60, this.bounds.height),
        }),
      );
    }
  }

  registerListeners() {
    this.birds.forEach((bird) => {
      bird.DOMRef.addEventListener('mouseover', (e) => {
        this.updateStatsDisplay(bird);
      });
      bird.DOMRef.addEventListener('click', (e) => {
        this.updateStatsDisplay(bird);
      });
    });

    this.$restartBtn.addEventListener('click', (e) => {
      e.preventDefault();

      localStorage.removeItem('birds');
      window.location.reload();
    });

    this.$birdName.addEventListener('blur', (e) => {
      this.validateAndUpdateName();
    });
  }

  validateAndUpdateName() {
    const regex = /^[a-zA-Z0-9 ]+$/;
    const newName = this.$birdName.value.trim();
    if (newName.match(regex)) {
      this.activeStatsDisplayBird.name = newName;
    } else {
      this.$birdName.value = this.activeStatsDisplayBird.name;
    }
  }

  updateStatsDisplay(bird) {
    this.$birdName.classList.remove('hide');
    this.$birdName.value = bird.name;
    this.$statsMsg.innerHTML = `Bugs eaten: ${bird.bugsEaten}.`;
    this.activeStatsDisplayBird = bird;
  }

  findBugChamp() {
    this.birds.forEach((bird) => {
      bird.isBugChamp = false;
      if (bird.bugsEaten > this.currentBestAmount) {
        this.currentBest = bird;
        this.currentBestAmount = bird.bugsEaten;
      }
    });

    if (this.currentBest) {
      this.currentBest.isBugChamp = true;
    }
  }

  animateNextTick() {
    let doBugChampCheck = false;

    this.birds.forEach((bird) => {
      bird.updateModelForTick(this.bounds.height, this.bounds.width);
      bird.draw();
      if (!doBugChampCheck) {
        doBugChampCheck = bird.gotBug;
      }
    });

    if (doBugChampCheck) {
      this.findBugChamp();
    }

    localStorage.setItem('birds', JSON.stringify(this.birds));
    // this.updateDebugger();
  }

  updateDebugger() {
    const $debug = document.getElementsByClassName('debug')[0];
    const json = JSON.stringify(
      {
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        viewportWidth: this.viewport.width,
        viewportHeight: this.viewport.height,
      },
      undefined,
      2,
    );
    $debug.innerHTML = json;
  }
}
