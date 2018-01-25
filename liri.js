const keys = require("./keys.js");
const twitterKeys = keys.twitterKeys;
const spotifyKeys = keys.spotifyKeys;
const omdb_key = keys.omdbKey;

const Twitter = require('twitter');
const twitter = new Twitter(twitterKeys);
const Spotify = require('node-spotify-api');
const spotify = new Spotify(spotifyKeys);
const request = require('request');


const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const router = [
    {name: 'my-tweets', fn: get_tweets},
    {name: 'spotify-this-song', fn: spotify_song_prompt, params:{}},
    {name: 'movie-this', fn: movie_prompt},
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
    route = router[answer-1];
    input_handler(route);
  });
};


function input_handler(route){
  let response;
  if(route){
    switch(route.name){
      case "my-tweets":
        response = route.fn(25, "whatsupguy1");
        break;
      case "spotify-this-song":
        response = route.fn('All the Small Things');
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
function get_tweets(count, screen_name){
  twitter.get('statuses/user_timeline', screen_name, function(error, tweets, response){
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

function spotify_song_prompt(){
  rl.question("Enter a song name or leave blank for default (The Sign, Ace of Base): ", function (song_name) {
    song_name = song_name.trim();
    get_spotify_song(song_name);
  });
};

function get_spotify_song(song_name){
  //* If no song is provided then your program will default to "The Sign" by Ace of Base.
  //'spotify-this-song'
  //https://www.npmjs.com/package/node-spotify-api
  song_name = song_name || "The Sign, Ace of Base"; 
  spotify.search({ type: 'track', query: song_name }, function(err, data) {
    if(err) throw err;
    let item_count = data.tracks.items.length;
    console.log("///////////////////* Search results for: '"+song_name+"' ("+item_count+") *//////////////////////// \n");
    if(item_count > 0){
      
      data.tracks.items.forEach(function(item, i){
        console.log(i+1+". \t Artist: ", item.artists[0].name);
        console.log(" \t Album: ", item.album.name);
        console.log(" \t Song Name: ", item.name);
        console.log(" \t Spotify Link: ", item.external_urls.spotify, "\n");
      })
      console.log("///////////////////////////////////////////");
    }else{
      //do something else...
      console.log("No Songs found. Please try again.")
      console.log("///////////////////////////////////////////");
      spotify_song_prompt();
    }
    
  });
};


function movie_prompt(){
  rl.question("Enter a move name or leave blank for default (Mr. Nobody): ", function (movie_name) {
    movie_name = movie_name.trim();
    get_movie(movie_name);
  });
};


//'movie-this'
function get_movie(movie_name){
  //* If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
  movie_name = movie_name || "Mr. Nobody";
  let url = "http://www.omdbapi.com/?apikey="+omdb_key+"&t="+movie_name;
  request(url, function (error, response, body) {
    if(error) throw error;
    if(response && response.statusCode===200){
      console.log("Here is the body: ", body);
      var data = JSON.parse(body);
      console.log("Title:\t\t", data.Title); 
      console.log("Year:\t\t", data.Year); 
      console.log("IMDB Rating:\t", data.imdbRating);
      let rt_rating = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")
      console.log("RT Rating:\t", rt_rating && rt_rating.Value || "NA");
      console.log("Produced in:\t", data.Country);
      console.log("Language: \t", data.Language);
      console.log("Plot: \t\t", data.Plot);
      console.log("Actors: \t", data.Actors);

    }else{
      console.log("We could not find anything. Please try again.");
      imdb_prompt();
    } 
  });
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