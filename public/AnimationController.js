class AnimationController {
  scheduler = new Scheduler();
  birds = [];
  numBirds = 7;
  $statsMsg = document.getElementsByClassName('stats-msg')[0];
  $birdName = document.getElementsByClassName('birdName')[0];
  $restartBtn = document.getElementsByClassName('restart-btn')[0];
  $nightOverlay = document.getElementsByClassName('body::before')[0];
  SPRITE_SIZE = 50;
  currentBest = null;
  currentBestAmount = 0;
  isNight = false;
  dayCount = 0;
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
    this.load();
    this.registerListeners();
    this.scheduler.start(this.animateNextTick.bind(this));
  }

  load() {
    const data = JSON.parse(localStorage.getItem('data'));

    if (data && data.birds) {
      this.rehydrateSavedBirds(data.birds);
    } else {
      this.getABunchOfBirds(this.numBirds);
    }

    if (data && data.dayCount) {
      this.dayCount = data.dayCount;
    }
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
        bird.DOMRef.classList.add('active-halo');
      });

      bird.DOMRef.addEventListener('mouseout', (e) => {
        bird.DOMRef.classList.remove('active-halo');
      });

      bird.DOMRef.addEventListener('click', (e) => {
        this.updateStatsDisplay(bird);
      });
    });

    this.$restartBtn.addEventListener('click', (e) => {
      e.preventDefault();

      localStorage.removeItem('data');
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
    doBugChampCheck = this.updateBirds(doBugChampCheck);

    if (doBugChampCheck) {
      this.findBugChamp();
    }

    this.updateTimes();
    this.save();
    // this.updateDebugger();
  }

  updateBirds(doBugChampCheck) {
    this.birds.forEach((bird) => {
      bird.updateModelForTick(
        this.bounds.height,
        this.bounds.width,
        this.isNight,
      );
      bird.draw();
      if (!doBugChampCheck) {
        doBugChampCheck = bird.gotBug;
      }
    });
    return doBugChampCheck;
  }

  updateTimes() {
    if (!this.isNight && this.scheduler.currentTime() === NIGHT_BEGINS) {
      this.isNight = true;
    }

    if (this.isNight && this.scheduler.currentTime() === NIGHT_ENDS) {
      this.isNight = false;
    }

    if (this.scheduler.currentTime() === DAY_LENGTH) {
      this.dayCount += 1;
      this.birds.forEach((bird) => (bird.age += 1));
      this.scheduler.reset();
    }
  }

  save() {
    localStorage.setItem(
      'data',
      JSON.stringify({
        birds: this.birds,
        dayCount: this.dayCount,
      }),
    );
  }

  updateDebugger() {
    const $debug = document.getElementsByClassName('debug')[0];
    const json = JSON.stringify(
      {
        bird: this.birds[0],
        meta: {
          night: this.isNight,
          ticks: this.scheduler.currentTime(),
        },
      },
      undefined,
      2,
    );
    $debug.innerHTML = json;
  }
}
