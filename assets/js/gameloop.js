let { init, Sprite, Text, Grid, GameLoop, track, initPointer, initKeys, onKey, Button } = kontra;

let { canvas, context } = init();
initPointer();
initKeys();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let gameboard_height = 3;
let gameboard_width  = 4;
let game_state = 'menu';
let game_points_multiplier = 0;
let number_of_returned_cards = 0;
let current_picked_cards = [];
let cards_sum = 0;
let player_score = 0;
let player_name = '';
let is_name_entered = false;
const MAXCARDS = gameboard_height * gameboard_width;
const THIRTEEN = 13;
const MAX_HIGH_SCORES = 5;

onKey('r', function(e) {
  // return to the game menu
  console.log("r key pressed ! ");
  game_state = 'menu';
});

let card_figures = {
  heart: '♥️',
  spade: '♠️',
  diamond: '♦️',
  club: '♣️',
  jocker: '🃏'
};

function capitalize_first_letter(string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

let generate_full_deck = function(){
  let data = {};
  for (let colorname of card_colours) {
    if (! data.hasOwnProperty(colorname)){
      data[colorname] = ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'];
    }
  };
  return data;
};
let full_deck = generate_full_deck();

let retrieve_card_value = function(cards_deck,card_color,card_figure){
  let card_index = cards_deck[card_color].indexOf(card_figure);
  let card_value = card_index + 1;
  return card_value;
}

function get_highscores() {
  // Retrieve scores from localStorage or return an empty array if not present
  return JSON.parse(localStorage.getItem('13_the_damned_highscores')) || [];
}

function save_highscore(newScore, playerName) {
  const highScores = get_highscores();
  const newHighScore = { score: newScore, name: playerName };

  // Add new score and sort the array in descending order
  highScores.push(newHighScore);
  highScores.sort((a, b) => b.score - a.score);

  // Limit the array to top MAX_HIGH_SCORES scores
  highScores.splice(MAX_HIGH_SCORES);

  // Save back to localStorage
  localStorage.setItem('13_the_damned_highscores', JSON.stringify(highScores));
}

// Function to generate table rows
function generateScoreTable(highScores) {
  let textObjects = [];
  let startY = 160; // Starting Y position for the first row
  let rowHeight = 40; // Space between each row
  let last_y_pos = startY; // Used by text message proposing to restart a game

  // Column x positions for rank, name, and score
  const rankX = 200;
  const nameX = 300;
  const scoreX = 400;

  // Header row
  textObjects.push(Text({
    text: 'Rank',
    font: '20px Arial',
    color: 'white',
    x: rankX,
    y: startY - 40,
    anchor: {x: 0.5, y: 0.5},
    textAlign: 'center'
  }));
  textObjects.push(Text({
    text: 'Name',
    font: '20px Arial',
    color: 'white',
    x: nameX,
    y: startY - 40,
    anchor: {x: 0.5, y: 0.5},
    textAlign: 'center'
  }));
  textObjects.push(Text({
    text: 'Score',
    font: '20px Arial',
    color: 'white',
    x: scoreX,
    y: startY - 40,
    anchor: {x: 0.5, y: 0.5},
    textAlign: 'center'
  }));

  // Loop through high scores and create Text objects for each entry
  highScores.forEach((entry, index) => {
    let yPos = startY + (index * rowHeight);
    last_y_pos = yPos;

    textObjects.push(Text({
      text: `${index + 1}`.padStart(3,'0'),  // Rank
      font: '20px Arial',
      color: 'white',
      x: rankX,
      y: yPos,
      anchor: {x: 0.5, y: 0.5},
      textAlign: 'center'
    }));

    textObjects.push(Text({
      text: entry.name,  // Player Name
      font: '20px Arial',
      color: 'white',
      x: nameX,
      y: yPos,
      anchor: {x: 0.5, y: 0.5},
      textAlign: 'center'
    }));

    textObjects.push(Text({
      text: entry.score.toString().padStart(3,'0'),  // Player Score
      font: '20px Arial',
      color: 'white',
      x: scoreX,
      y: yPos,
      anchor: {x: 0.5, y: 0.5},
      textAlign: 'center'
    }));
  });

  // Add a message to restart a game
  textObjects.push(Text({
    text: 'Press [r] to restart',
    font: 'bold 16px Arial',
    color: 'white',
    x: 300,
    y: last_y_pos + (rowHeight * 1.5),
    anchor: {x: 0.5, y: 0.5},
    textAlign: 'center'
  }));

  return textObjects;
}

let game_title = Text({
  text: '🎭 13 The Damned 🎭',
  font: '58px Arial',
  color: 'yellow',
  x: 300,
  y: 75,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let highscores_title = Text({
  text: '🏆 === High Scores === 🏆',
  font: '48px Arial',
  color: 'gold',
  x: 300,
  y: 75,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});


let game_over = Text({
  text: 'Game Over\n\nYour score: ' + player_score,
  font: 'italic 58px Arial',
  color: 'red',
  x: 300,
  y: 100,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center',
  update: function () {
    this.text = 'Game Over\nYour score: ' + player_score
  }
});


let game_won = Text({
  text: '🎉Congratulation🎉\n\nYour score: ' + player_score,
  font: 'italic 58px Arial',
  color: 'blue',
  x: 300,
  y: 100,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center',
  update: function () {
    this.text = '🎉Congratulation🎉\nYour score: ' + player_score
  }
});

let start_again = Text({
  text: 'Press [r] to restart',
  font: 'bold 16px Arial',
  color: 'white',
  x: 300,
  y: 225,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let cards_sum_widget = Text({
  text: 'Cards sum: ' + cards_sum,
  font: 'bold 20px Arial',
  color: 'white',
  x: 500,
  y: 50,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'left',
  update: function () {
    this.text = 'Cards sum: ' + cards_sum,
    this.textAlign = 'left'
  }
});

let score_widget = Text({
  text: 'Score : ' + player_score,
  font: 'bold 20px Arial',
  color: 'white',
  x: 500,
  y: 100,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'left',
  update: function () {
    this.text = 'Score: ' + player_score,
    this.textAlign = 'left'
  }
});

let bonus_widget = Text({
  text: 'Bonus \nX ' + game_points_multiplier,
  font: 'bold 20px Arial',
  color: 'white',
  x: 500,
  y: 150,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center',
  update: function () {
    this.text = 'Bonus \nX ' + game_points_multiplier
  }
});

bold_font = 'bold 20px Arial, sans-serif';
normal_font = '20px Arial, sans-serif';

let textOptions = {
  color: 'white',
  font: normal_font
};

let start = Text({
  text: 'Start',
  onDown: function() {
    // handle on down events on the sprite
    console.log("Clicked on Start");
    game_state = 'play';
    game_points_multiplier = 0;
    init_gameboard();
  },
  onOver: function() {
    this.font = bold_font;
  },
  onOut: function() {
    this.font = normal_font;
  },
  ...textOptions
});

let options = Text({
  text: 'Difficulty',
  onDown: function() {
    // handle on down events on the sprite
    console.log("Clicked on Difficulty");
  },
  onOver: function() {
    this.font = bold_font;
  },
  onOut: function() {
    this.font = normal_font;
  },
  ...textOptions
});

let highscore = Text({
  text: 'High Scores',
  onDown: function() {
    // handle on down events on the sprite
    console.log("Clicked on High Score");
    game_state = 'highscores';
  },
  onOver: function() {
    this.font = bold_font;
  },
  onOut: function() {
    this.font = normal_font;
  },
  ...textOptions
});

let start_menu = Grid({
  x: 300,
  y: 250,
  anchor: {x: 0.5, y: 0.5},

  // add 15 pixels of space between each row
  rowGap: 15,

  // center the children
  justify: 'center',

  children: [start, options, highscore]
});
track(start,options,highscore);

let keep_button = Button({
  // sprite properties
  x: 500,
  y: 300,
  anchor: {x: 0.5, y: 0.5},

  // text properties
  text: {
    text: 'Keep Cards',
    color: 'white',
    font: '20px Arial, sans-serif',
    anchor: {x: 0.5, y: 0.5}
  },

  // button properties
  padX: 20,
  padY: 10,

  sprite: Sprite({
    x: this.x,
    y: this.y,
    width: 150,
    height: 40,
    color: 'blue',
    //onDown: this.onPointerDown.bind(this),
    radius: 5,
    render: function() {
      this.context.fillStyle = this.color;
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 3;
      this.context.beginPath();
      this.context.roundRect(0, 0, this.width, this.height, this.radius);
      this.context.fill();
      this.context.stroke();
    }
  }),
  onDown: function() {
    console.log('final score: ' + cards_sum * game_points_multiplier);
    player_score += cards_sum * game_points_multiplier;
    cards_sum = 0;
    game_points_multiplier = 0;
    current_picked_cards = [];
    if (is_game_ended(number_of_returned_cards)){
      game_state = 'gamewon';
    }
  },
  render() {
    this.sprite.render();
    // focused by keyboard
    if (this.focused) {
      this.context.setLineDash([8,10]);
      this.context.lineWidth = 3;
      this.context.strokeStyle = 'red';
      this.context.strokeRect(0, 0, this.width, this.height);
    }

    // pressed by mouse, touch, or enter/space on keyboard
    if (this.pressed) {
      this.textNode.color = 'yellow';
    }
    // hovered by mouse
    else if (this.hovered) {
      this.textNode.color = 'white';
      this.textNode.font = bold_font;
      canvas.style.cursor = 'pointer';
    }
    else  {
      this.textNode.color = 'white';
      this.textNode.font = normal_font;
      canvas.style.cursor = 'initial';
    }
  }
});

let game_cards = [];
let card_pos_x = 10;
let card_pos_y = 10;
let card_width = (canvas.width / gameboard_width) - 60;
let card_height = card_width * 1.3;

class Card {
  constructor(x, y, width, height, color, card_color, card_figure) {
    this.card_color = card_color;
    this.card_figure = card_figure;
    this.color = color;
    this.returned = false;
    this.kept = false;
    this.lost = false;
    this.sprite = Sprite({
      x: x,
      y: y,
      width: width,
      height: height,
      color: this.color,
      onDown: this.onPointerDown.bind(this),
      radius: 5,
      render: function() {
        this.context.fillStyle = this.color;
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;
        this.context.beginPath();
        this.context.roundRect(0, 0, this.width, this.height, this.radius);
        this.context.fill();
        this.context.stroke();
      }
    });

    this.text = Text({
      text: capitalize_first_letter(card_figure) + '\n\n' + this.card_icon(),
      font: '16px Arial',
      color: 'black',
      x: x + width / 2,
      y: y + height / 2,
      anchor: { x: 0.5, y: 0.5 },
      textAlign: 'center',
      onDown: this.onPointerDown.bind(this)
    });
    // Track pointer events on this sprite
    track(this.sprite, this.text);
  }

  show_card(){
    this.sprite.color = 'white';
    this.returned     = true;
  }

  is_pick(){
    return this.kept;
  }


  is_lost(){
    return this.lost;
  }

  pick_card(){
    this.kept = true;
  }

  add_card_value(){
    let card_value = retrieve_card_value(full_deck,this.card_color,this.card_figure);
    console.log('Card value = ' + card_value);
    cards_sum += card_value;
  }

  card_icon(){
    return card_figures[this.card_color];
  }

  is_damned(){
    let card_value = retrieve_card_value(full_deck,this.card_color,this.card_figure);
    if (this.returned && (card_value == THIRTEEN)){
      return true;
    } else {
      return false;
    }
  }

  discard_card(){
    this.kept = false;
    this.lost = true;
  }

  update(){
    if (this.is_lost()){
      this.sprite.color = 'gray';
    }
    this.sprite.update();
    this.text.update();
  }

  render(){
    if (this.returned){
      this.sprite.render();
      this.text.render();
    } else {
      this.text.render();
      this.sprite.render();
    }
  }

  // Handle the pointer down event
  onPointerDown() {
    console.log(`Card with text "${this.text.text}" clicked!`);
    // Additional actions on click can be added here
    this.show_card();
    number_of_returned_cards += 1;
    this.add_card_value();
    current_picked_cards.push(this);
    game_points_multiplier += 1;
    console.log(game_cards)
    console.log('Current multiplier: ' + game_points_multiplier);
  }

  // Check if the card was clicked
  checkForClick() {
    if (this.sprite.collidesWithPointer()) {
      this.onPointerDown();
    }
  }

}

function is_game_ended(returned_cards){
  if (returned_cards == MAXCARDS){
    return true;
  } else {
    return false;
  }
}

function init_gameboard(){
  game_cards = [];
  cards_sum = 0;
  player_score = 0;
  number_of_returned_cards = 0;
  let generate_random = function(){
    game_deck = JSON.parse(JSON.stringify(full_deck))
    console.log(game_deck);
    let random_cards = {};
    for (let i = 1; i <= gameboard_height * gameboard_width; i++) {
      let card_color=card_colours[Math.floor(Math.random() * 4)]
      if (! random_cards.hasOwnProperty(card_color)){
        random_cards[card_color] = [];
      }
      card_idx=Math.floor(Math.random() * game_deck[card_color].length);
      random_cards[card_color].push(game_deck[card_color][card_idx]);
      game_deck[card_color].splice(card_idx,1);
    }
    return random_cards;
  }
  let picked_cards = generate_random();
  console.log(picked_cards);
  //console.log(game_deck);
  let cards_by_line_limit = gameboard_width;
  let cards_by_line = 0;
  let card_X = card_pos_x;
  let card_Y = card_pos_y;
  for (let card_color in picked_cards){
    console.log(card_color);
    console.log(picked_cards[card_color]);
    for (let card in picked_cards[card_color]){
      console.log(picked_cards[card_color][card]);
      if (cards_by_line < cards_by_line_limit){
        if (cards_by_line){
          card_X += card_width + 10;
        }
      } else {
        card_X = card_pos_x;
        card_Y += card_height + 10;
        cards_by_line = 0;
      }
      let card_symbol = new Card(card_X, card_Y, card_width, card_height, 'blue', card_color, picked_cards[card_color][card]);
      game_cards.push(card_symbol);
      cards_by_line += 1;
    }
  }
  console.log(game_cards)
}

function have_you_been_cursed(current_card){
  if (current_card.is_damned()){
    game_state = 'gameover'
  }
}

function check_cards_sum(){
  if (cards_sum >= THIRTEEN){
    console.log('You reached damned number');
    for (let card of current_picked_cards){
      card.discard_card();
      console.log(card.card_figure + ' - ' + card.is_lost());
    }
    cards_sum = 0;
    game_points_multiplier = 0;
    current_picked_cards = [];
  }
}
let scoreTable = [];
let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    let highScores = [];
    // Generate the high score table
    switch (game_state) {
      case 'menu':
        break;
      case 'play':
        for (card in game_cards){
          //console.log(card);
          game_cards[card].update();
          have_you_been_cursed(game_cards[card]);
          cards_sum_widget.update();
          bonus_widget.update();
          score_widget.update();
        }
        console.log('Current sum of selected cards: ' + cards_sum)
        check_cards_sum();
        break;
      case 'gameover':
        game_over.update();
        // Check if player made a high score
        highScores = get_highscores();
        break;
      case 'gamewon':
        game_won.update();
        // Check if player made a high score
        highScores = get_highscores();
        if (player_score > highScores[highScores.length - 1]?.score || highScores.length < MAX_HIGH_SCORES) {
          // Player has a high score, ask for their name
          let playerName = prompt('New High Score! Enter your nickname:');
          console.log('playerName: ['+playerName+']');
          let trimmed_playerName = playerName.substring(0, 3);
          console.log('trimmed_playerName: ['+trimmed_playerName+']');
          save_highscore(player_score, trimmed_playerName);
        }
        scoreTable = generateScoreTable(get_highscores());
        game_state = 'highscores';
        break;
      case 'highscores':
        scoreTable = generateScoreTable(get_highscores());
        break;
    }
  },
  render: function() { // render the game state
    switch (game_state) {
      case 'menu':
        game_title.render();
        start_menu.render();
        break;
      case 'play':
        for (card in game_cards){
          //console.log(card);
          game_cards[card].render();
          cards_sum_widget.render();
          bonus_widget.render();
          score_widget.render();
          keep_button.render();
        }
        break;
      case 'gameover':
        game_over.render();
        start_again.render();
        break;
      case 'gamewon':
        game_won.render();
        start_again.render();
        break;
      case 'highscores':
        highscores_title.render()
        // Render the high score table
        scoreTable.forEach(row => row.render());
        break;
    }
  }
});

loop.start();    // start the game