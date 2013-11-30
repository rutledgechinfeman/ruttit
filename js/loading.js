var msgs = [
  "Some things are really slow.",
  "Websites with mean x-frame-options will never load.",
  "How many pages of reddit have you viewed today?",
  "When was the last time you went outside?",
  "Should you be doing work right now?",
  "A goldfish's attention span is 3 seconds--how do you compare?",
  "I bet your cat can get you some karma.",
  "Don't forget to hydrate!",
  "cowsay `fortune -o`",
  "Explore a new subreddit today.",
  "You should buy a boat.",
  "&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;&#9731;",
  "Treat yourself to some new socks.",
  "Sleep makes you happier and healthier.",
  "If you lived here, you would be home right now!",
  "Yes, you can!"
];
var idx = Math.floor(Math.random() * msgs.length);
$("p").html(msgs[idx]);
