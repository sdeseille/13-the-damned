let { init, Sprite, Text, Grid, GameLoop, track, initPointer, initKeys, onKey, initInput } = kontra;

let { canvas, context } = init();
initPointer();
initKeys();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let gameboard_height = 3;
let gameboard_width  = 4;
let game_state = 'menu';
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

let game_title = Text({
  text: '13 The Damned',
  font: '58px Arial',
  color: 'yellow',
  x: 300,
  y: 75,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});


let textOptions = {
  color: 'white',
  font: '20px Arial, sans-serif'
};

let start = Text({
  text: 'Start',
  onDown: function() {
    // handle on down events on the sprite
    console.log("Clicked on Start");
    game_state = 'play';
    init_gameboard();
  },
  onOver: function() {
    this.font = 'bold 20px Arial, sans-serif';
  },
  onOut: function() {
    this.font = '20px Arial, sans-serif';
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
    this.font = 'bold 20px Arial, sans-serif';
  },
  onOut: function() {
    this.font = '20px Arial, sans-serif';
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
    this.font = 'bold 20px Arial, sans-serif';
  },
  onOut: function() {
    this.font = '20px Arial, sans-serif';
  },
  ...textOptions
});

let menu = Grid({
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
      text: capitalize_first_letter(card_figure) + '\n\n' + card_color,
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
    this.returned   = true;
  }

  update(){
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
    console.log(game_cards)
  }

  // Check if the card was clicked
  checkForClick() {
    if (this.sprite.collidesWithPointer()) {
      this.onPointerDown();
    }
  }

}

function init_gameboard(){
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
  console.log(game_deck);
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
      let card_symbol = new Card(card_X, card_Y, card_width, card_height, 'blue', card_figures[card_color], picked_cards[card_color][card]);
      game_cards.push(card_symbol);
      cards_by_line += 1;
    }
  }
  console.log(game_cards)
}

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    for (card in game_cards){
      //console.log(card);
      game_cards[card].update();
    }
  },
  render: function() { // render the game state
    if (game_state == 'menu'){
      game_title.render();
      menu.render();
    } else if (game_state == 'play'){
      for (card in game_cards){
        //console.log(card);
        game_cards[card].render();
      }
    }
  }
});

loop.start();    // start the game