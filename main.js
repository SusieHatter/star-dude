var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  audio: {
    disableWebAudio: true,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.audio("song", "assets/song.ogg");
  this.load.audio("death", "assets/death.wav");
  this.load.audio("pop", "assets/pop.ogg");
  this.load.audio("levelUp", "assets/spell2.wav");

  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");

  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

var player;
var platforms;
var cursors;
var stars;
var score;
var scoreText;
var topScore = 0;
var topScoreText;
var bombs;
var music;
var deathSound;
var pop;
var levelUp;

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  music = this.sound.add("song");
  music.loop = true;
  music.play();

  pop = this.sound.add("pop");
  levelUp = this.sound.add("levelUp");
  deathSound = this.sound.add("death");

  this.add.image(400, 300, "sky");
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(300);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  bombs = this.physics.add.group();

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  score = 0;
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  topScoreText = this.add.text(16, 64, "Top Score: " + topScore, {
    fontSize: "32px",
    fill: "#000",
  });
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

function collectStar(player, star) {
  pop.play();
  star.disableBody(true, true);

  score += 10;
  scoreText.setText("Score: " + score);
  if (score >= topScore) {
    topScore = score;
    topScoreText.setText("Top Score: " + topScore);
  }

  if (stars.countActive(true) === 0) {
    levelUp.play();
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  music.stop();
  deathSound.play();
  player.setVelocityY(-100);
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  this.cameras.main.shake(2000, 0.005);

  setTimeout(() => {
    this.scene.restart();
  }, 2000);
}
