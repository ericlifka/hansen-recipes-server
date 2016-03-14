"use strict";
const fs = require('fs');

let mutations = [
  recipe => recipe.ingredients.forEach(ingredient => ingredient.ingredient = ingredient.ingredient.toLowerCase())
];

let files = [ 'appetizers', 'bread' ];
let textBlobs = { };
files.forEach(file => {
  textBlobs[ file ] = fs.readFileSync(`./${file}.txt`, "utf8");
});
let allRecipes = [ ];

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

  allRecipes = allRecipes.concat(recipes);
});

// sequentially apply all the mutation functions to each recipe in turn
mutations.forEach(muteFn =>
  allRecipes.forEach(muteFn));

let ingredients = { };
let measurements = { };

allRecipes.forEach(recipe => recipe.ingredients.forEach(ingredient => {
  let unit = ingredient.unit;
  let ingredientName = ingredient.ingredient;

  if (!ingredients[ ingredientName ]) ingredients[ ingredientName ] = 0;
  if (!measurements[ unit ]) measurements[ unit ] = 0;

  ingredients[ ingredientName ]++;
  measurements[ unit ]++;
}));

console.log(ingredients);

//console.log(JSON.stringify(allRecipes, null, '    '));

/**
 * mutations that need to happen:
 *  - normalize measurement names
 *  - see if normalization of ingredients is plausible
 *
 *  - remove empty steps on recipes
 */

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
