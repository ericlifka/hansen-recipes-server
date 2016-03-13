"use strict";
const fs = require('fs');

let files = [ 'appetizers' ];
let textBlobs = { };
files.forEach(file => {
  textBlobs[ file ] = fs.readFileSync(`./${file}.txt`, "utf8");
});

Object.keys(textBlobs).forEach(file => {
  let textBlob = textBlobs[ file ];
  let recipes = textBlob.split('\n\n');       // blank lines denote recipe blobs
  recipes = recipes.map(r => r.split('\n'));  // turn each blob into an array of lines
  recipes = recipes.map(recipeLines => {
    let name = recipeLines.shift();
    let ingredients = [];
    let steps = recipeLines;
    let tags = [ file ];
    while (recipeLines.length > 0) {
      // Each ingredient line starts with a number, once we hit the first non number we've reached the steps and we can
      // stop pulling the lines into the ingredients array.
      if (!isNaN(parseInt(recipeLines[ 0 ][ 0 ], 10))) {
        ingredients.push(recipeLines.shift());
      }
      else {
        break;
      }
    }

    return { name, ingredients, steps, tags };
  });

  recipes.forEach(recipe => {
    recipe.ingredients = recipe.ingredients.map(ingredientString => {
      // expecting ingredients to be strings of the form '2/3 cups unbleached baking flour'
      let parts = ingredientString.split(' ');

      let quantity = parts.shift();
      let unit = parts.shift().split('_').join(' ');
      let ingredient = parts.join(' ');

      return { quantity, unit, ingredient };
    })
  });

  console.log(recipes[0]);

});

//recipes = recipes.map(s => ({
//  section: s[0],
//  recipes: s.slice(1)
//}));
//
//recipes.forEach(s => {
//  s.recipes = s.recipes.map(r => {
//    let lines = r.split('\n');
//
//    return {
//      name: lines[0],
//      blob: lines.slice(1)
//    };
//  });
//});


//sections.forEach(function (s) {
//  //s.forEach(function (r) {
//  //  console.log(r.length);
//  //});
//  //console.log('-');
//});

//console.log(recipes[0 ].recipes[0]);
