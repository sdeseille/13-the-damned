let { init, Sprite, GameLoop } = kontra
let { canvas } = init();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let full_deck = {};

let gameboard_height = 3;
let gameboard_width  = 4;

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
console.log('🃏');


let game_cards = [];
let card_pos_x = 10;
let card_pos_y = 10;
let card_width = (canvas.width / gameboard_width) - 20;
let card_height = (canvas.height / gameboard_height) - 20;

for (let card_color in first_line_cards){
  console.log(card_color);
  console.log(first_line_cards[card_color]);
  for (let card in first_line_cards[card_color]){
    let card_symbol = Sprite({
      x: card_pos_x + 10,        // starting x,y position of the sprite
      y: card_pos_y,
      color: 'red',  // fill color of the sprite rectangle
      width: card_width,     // width and height of the sprite rectangle
      height: card_height,
      dx: 0          // move the sprite 0px to the right every frame
    });
    game_cards.push(card_symbol);
    card_pos_x += card_width + 10;
  }
}
console.log(game_cards)

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    for (card in game_cards){
      //console.log(card);
      game_cards[card].update();
    }
  },
  render: function() { // render the game state
    for (card in game_cards){
      //console.log(card);
      game_cards[card].render();
    }
  }
});

loop.start();    // start the game