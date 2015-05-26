# Provenance-Threads

Inspired by XKCD's storyline plots of Lord of the Rings, Jurassic Park, and Primer, I'm excited to try out a new art project:
tracing the history of several artworks before they arrived in the MoMA collection.

# Components

* D3.js by Mike Bostock
* <a href="https://github.com/d3/d3-plugins/tree/master/sankey">Sankey plugin</a> for D3

# How To

* Install mongodb and nodejs
* Run ```mongod``` to initialize MongoDB
* Download all of the artworks ```npm run scrape```
* Parse all of the years and locales ```npm run divide```
* Run the server ```npm start```
* Go to localhost:3000

# What it looks like

<img src="http://i.imgur.com/Exh6tQM.png" width="600"/>

# License

MIT License
