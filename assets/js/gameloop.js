let { init, Sprite, Text, Grid, GameLoop, track, initPointer, initKeys, onKey, initInput, Button } = kontra;

let { canvas, context } = init();
initPointer();
initKeys();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let gameboard_height = 3;
let gameboard_width  = 4;
let game_state = 'menu';
let game_points_multiplier = 0;
let current_picked_cards = [];
let cards_sum = 0;
let final_score = 0;
const THIRTEEN = 13;

onKey('q', function(e) {
  // return to the game menu
  console.log("q key pressed ! ");
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

let game_title = Text({
  text: '🎭 13 The Damned 🎭',
  font: '58px Arial',
  color: 'yellow',
  x: 300,
  y: 75,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let game_over = Text({
  text: '13 The Damned\nGame Over',
  font: 'italic 58px Arial',
  color: 'red',
  x: 300,
  y: 75,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let start_again = Text({
  text: 'Press [q] to restart',
  font: 'bold 16px Arial',
  color: 'white',
  x: 300,
  y: 200,
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
  text: 'Score : ' + final_score,
  font: 'bold 20px Arial',
  color: 'white',
  x: 500,
  y: 100,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'left',
  update: function () {
    this.text = 'Score: ' + final_score,
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

let quit = Text({
  text: 'Quit',
  onDown: function() {
    // handle on down events on the sprite
    console.log("Clicked on Quit");
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
  y: 200,
  anchor: {x: 0.5, y: 0.5},

  // add 15 pixels of space between each row
  rowGap: 15,

  // center the children
  justify: 'center',

  children: [start, options, quit]
});
track(start,options,quit);

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
    final_score += cards_sum * game_points_multiplier;
    cards_sum = 0;
    game_points_multiplier = 0;
    current_picked_cards = [];
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
    this.is_pick();
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

function init_gameboard(){
  game_cards = [];
  cards_sum = 0;
  final_score = 0;
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

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
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
    }
  }
});

loop.start();    // start the game