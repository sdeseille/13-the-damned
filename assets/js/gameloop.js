let { init, Sprite, Text, GameLoop } = kontra
let { canvas } = init();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let full_deck = {};

let gameboard_height = 3;
let gameboard_width  = 4;


let card_figures = {
  heart: '♥️',
  spade: '♠️',
  diamond: '♦️',
  club: '♣️',
  jocker: '🃏'
};
let heart   = '♥️';
let spade   = '♠️';
let diamond = '♦️';
let club    = '♣️';
let jocker  = '🃏';

function capitalizeFirstLetter(string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

let generate_full_deck = function(){
  let data = {};
  for (let colorname of card_colours) {
    // console.log("type de la variable data: ",typeof data);
    // console.log(colorname);
    // console.log("type de la variable colorname: ",typeof colorname);
    if (! data.hasOwnProperty(colorname)){
      data[colorname] = ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'];
      // console.log(colorname, " ajouté dans l'object");
    }
  };
  return data;
};
full_deck = generate_full_deck();
game_deck = JSON.parse(JSON.stringify(full_deck))
console.log(game_deck);

let generate_four_random = function(){
  let random_cards = {};
  for (let i = 1; i <= 4; i++) {
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
let first_line_cards = generate_four_random();
console.log(first_line_cards);
let second_line_cards = generate_four_random();
let third_line_cards  = generate_four_random();
let fourth_line_cards = generate_four_random();
console.log(game_deck);

let game_cards = [];
let card_pos_x = 10;
let card_pos_y = 10;
let card_width = (canvas.width / gameboard_width) - 20;
let card_height = (canvas.height / gameboard_height) - 20;

class Card {
  constructor(x, y, width, height, color, card_color, text) {
    this.sprite = Sprite({
      x: x,
      y: y,
      width: width,
      height: height,
      color: color
    });

    this.text = Text({
      text: capitalizeFirstLetter(text) + '\n\n' + card_color,
      font: '18px Arial',
      color: 'black',
      x: x + width / 2,
      y: y + height / 2,
      anchor: { x: 0.5, y: 0.5 },
      textAlign: 'center'
    });
  }

  render() {
    this.sprite.render();
    this.text.render();
  }
}


for (let card_color in first_line_cards){
  console.log(card_color);
  console.log(first_line_cards[card_color]);
  for (let card in first_line_cards[card_color]){
    console.log(first_line_cards[card_color][card]);
    let card_symbol = new Card(card_pos_x, card_pos_y, card_width, card_height, 'white', card_figures[card_color], first_line_cards[card_color][card]);
    game_cards.push(card_symbol);
    card_pos_x += card_width + 10;
  }
}
console.log(game_cards)

let text = Text({
  text: jocker,
  font: '52px Arial',
  color: 'white',
  x: 180,
  y: 42,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let text2 = Text({
  text: club,
  font: '24px Arial',
  color: 'white',
  x: 250,
  y: 40,
  anchor: {x: 0.5, y: 0.5},
  textAlign: 'center'
});

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
/*     for (card in game_cards){
      console.log(card);
      //game_cards[card].update();
    } */
  },
  render: function() { // render the game state
    for (card in game_cards){
      //console.log(card);
      game_cards[card].render();
    }
    // text.render();
    // text2.render();
  }
});

loop.start();    // start the game