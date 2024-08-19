let { init, Sprite, GameLoop } = kontra

let { canvas } = init();

const card_colours = ['heart', 'diamond', 'club', 'spade'];

let full_deck = {};

let generate_full_deck = (data) => {
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
full_deck = generate_full_deck(full_deck)
console.log(full_deck);

let cards = [];
let generate_four_random = function(data){
  for (let i = 1; i <= 4; i++) {
    data.push(Math.floor(Math.random() * 13))
  }
  return data;
}


let fill_the_cardslist = function(data){
  for (let current_color in cards){

  }
}


let sprite = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 80,
  color: 'red',  // fill color of the sprite rectangle
  width: 20,     // width and height of the sprite rectangle
  height: 40,
  dx: 2          // move the sprite 2px to the right every frame
});

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    sprite.update();

    // wrap the sprites position when it reaches
    // the edge of the screen
    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function() { // render the game state
    sprite.render();
  }
});

loop.start();    // start the game