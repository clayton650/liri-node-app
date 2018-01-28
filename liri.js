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

const fs = require('fs');

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
    var done = false;
    if(!error){
      console.log("**** Here are the Tweets you requested ****");
      console.log("** Screen name: "+screen_name);
      console.log("** Count: "+tweets.length);
      console.log("///////////////////////////////////////////");
      tweets.forEach((tweet, i) => console.log(i+1+". "+tweet.text+"\n"));
      console.log("///////////////////////////////////////////");
      done = true;
    }else{
      console.log("Here is the error: ", error);
      done = true;
    }
    if(done){
      log("my-tweets", screen_name, tweets, function(){
        console.log("**** Try another... ****");
        startReadline();
      });
      
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
    var done = false;
    if(item_count > 0){
      
      data.tracks.items.forEach(function(item, i){
        console.log(i+1+". \t Artist: ", item.artists[0].name);
        console.log(" \t Album: ", item.album.name);
        console.log(" \t Song Name: ", item.name);
        console.log(" \t Spotify Link: ", item.external_urls.spotify, "\n");
      })
      console.log("///////////////////////////////////////////");
      done = true;
    }else{
      //do something else...
      console.log("No Songs found. Please try again.")
      console.log("///////////////////////////////////////////");
      spotify_song_prompt();
    }
    if(done){
      log("spotify-this-song", song_name, data.tracks.items, function(){
        console.log("**** Try another... ****");
        startReadline();
      });
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
    var done = false;
    if(error) throw error;
    if(response && response.statusCode===200){
      var data = JSON.parse(body);
      console.log("///////////////////////////////////////////");
      console.log("Title:\t\t", data.Title); 
      console.log("Year:\t\t", data.Year); 
      console.log("IMDB Rating:\t", data.imdbRating);
      let rt_rating = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")
      console.log("RT Rating:\t", rt_rating && rt_rating.Value || "NA");
      console.log("Produced in:\t", data.Country);
      console.log("Language: \t", data.Language);
      console.log("Plot: \t\t", data.Plot);
      console.log("Actors: \t", data.Actors);
      console.log("///////////////////////////////////////////");
      done = true;
    }else{
      console.log("We could not find anything. Please try again.");
      imdb_prompt();
    }
    if(done){
      log("movie-this", movie_name, data, function(){
        console.log("**** Try another... ****");
        startReadline();
      });
    }
  });
};

//'do-what-it-says'
function get_text_from_file(file){
   
  // * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
  // * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
  // * Feel free to change the text in that document to test out the feature for other commands.
  fs.readFile("random.txt", "utf8", (err, data) =>{
    if(err) throw err;
    const file_array = data.split(",");
    const route_name = file_array[0].trim();
    const value = file_array[1].trim();
    switch(route_name){
      case "my-tweets":
        response = get_tweets(25, "whatsupguy1");
        break;
      case "spotify-this-song":
        response = get_spotify_song(value);
        break;
      case "movie-this":
        response = get_movie(value);
        break;
    }    
  });
};

function log(search, value, data, callback_fn, file="log.txt"){

  var data_to_log = {
    search,
    value,
    data
  }

  fs.readFile(file, "utf8", function(err, res){
    if(err) throw err;

    let json_data;
    //for new/empty log files the res will be undefined
    if(!res){
      json_data = [];
    }else{
      json_data = JSON.parse(res);
    }
    
    json_data.push(data_to_log);
    let string_data = JSON.stringify(json_data);
    fs.writeFile(file, string_data, "utf8", function(err){
      if(err) throw err;
      console.log("\n[ --> Your search was logged to "+file+" <-- ]\n");
      if(callback_fn && typeof callback_fn === "function"){
        callback_fn();
      }
    });
  });

};


//Start the app
console.log("What would you like to do?");
startReadline();