const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Twitter = require('twitter');

const keys = require("./keys.js");
const twitterKeys = keys.twitterKeys;
const spotifyKeys = keys.spotifyKeys;
const omdb_key = keys.omdb_key;

const router = [
    {name: 'my-tweets', fn: get_tweets},
    {name: 'spotify-this-song', fn: get_spotify_song, params:{}},
    {name: 'movie-this', fn: get_movie},
    {name: 'do-what-it-says', fn: get_text_from_file},
  ]

function list_routes(){
  router.forEach(function(route,i){
    console.log(i+1+". "+route.name);
  });
};

//SOURCE: https://jttan.com/2016/06/node-js-basic-command-line-interactive-loop/
function startReadline(){
    list_routes();
    rl.question("Input one of the numbers above... ", function (answer) {
      if(answer){
        route = router[answer-1]
        input_handler(route)
        rl.close();
      }
      //console.log("Hi");
      //startReadline();
    });
};


function input_handler(route){
  let response;
  if(route){
    switch(route.name){
      case "my-tweets":
        response = route.fn(25, "whatsupguy1", twitterKeys);
        break;
      case "spotify-this-song":
        response = route.fn();
        break;
      case "movie-this":
        response = route.fn();
        break;
      case "do-what-it-says":
        response = route.fn();
        break;
    }
  }else{
    console.log("Sorry, that input is not valide. Try again.");
    startReadline();
  }
};



//show tweets - 'my-tweets'
function get_tweets(count, screen_name, keys){
  let client = new Twitter(keys);
  client.get('statuses/user_timeline', screen_name, function(error, tweets, response){
    if(!error){
      console.log("**** Here are the Tweets you requested ****");
      console.log("** Screen name: "+screen_name);
      console.log("** Count: "+tweets.length);
      console.log("///////////////////////////////////////////");
      tweets.forEach((tweet, i) => console.log(i+1+". "+tweet.text+"\n"));
      console.log("///////////////////////////////////////////");
    }else{
      console.log("Here is the error: ", error);
    }
  });
};


//'spotify-this-song'
//https://www.npmjs.com/package/node-spotify-api
function get_spotify_song(name){

  // * The song's name
  // * A preview link of the song from Spotify
  // * The album that the song is from

   //* If no song is provided then your program will default to "The Sign" by Ace of Base.

};


//'movie-this'
function get_movie(movie){
  // * Title of the movie.
  // * Year the movie came out.
  // * IMDB Rating of the movie.
  // * Rotten Tomatoes Rating of the movie.
  // * Country where the movie was produced.
  // * Language of the movie.
  // * Plot of the movie.
  // * Actors in the movie.

  //* If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'

};


//'do-what-it-says'
function get_text_from_file(file){
   
  // * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
  // * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
  // * Feel free to change the text in that document to test out the feature for other commands.

};


function log(file="log.txt"){

};


//Start the app
console.log("What would you like to do?");
startReadline();