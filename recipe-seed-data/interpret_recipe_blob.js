"use strict";
const fs = require('fs');
const path = require('path');
const request = require('request');

let unitConversions = {
  't': "tsp",
  't.': "tsp",
  'T': "Tbsp",
  'T.': "Tbsp",
  'c': "cups",
  'c.': "cups",
  'cup': "cups",
  'oz.': 'oz',
  'pinch': 'dash',
  'pkg.': 'package',
  'lb.': 'lb',
  'qt.': 'qt',
  'pt.': 'pt'
};
let mutations = [
  recipe => recipe.ingredients.forEach(ingredient => ingredient.ingredient = ingredient.ingredient.toLowerCase()),
  recipe => recipe.ingredients.forEach(ingredient => ingredient.unit = ingredient.unit.split('_').join(' ')),
  recipe => recipe.ingredients.forEach(ingredient => ingredient.unit = unitConversions[ ingredient.unit ] || ingredient.unit),
  recipe => recipe.steps = recipe.steps.filter(step => step.length > 0)
];

let files = [ 'appetizers', 'bread' ];
let textBlobs = { };
files.forEach(file => {
  textBlobs[ file ] = fs.readFileSync(path.join(__dirname, `./${file}.txt`), "utf8");
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
      let unit = parts.shift();
      let ingredient = parts.join(' ');

      return { quantity, unit, ingredient };
    })
  });

  allRecipes = allRecipes.concat(recipes);
});

// sequentially apply all the mutation functions to each recipe in turn
mutations.forEach(muteFn =>
  allRecipes.forEach(muteFn));


// --- VALIDATION METRICS --- //
let quantities = { };
let ingredients = { };
let units = { };

allRecipes.forEach(recipe => recipe.ingredients.forEach(ingredient => {
  let quantity = ingredient.quantity;
  let unit = ingredient.unit;
  let ingredientName = ingredient.ingredient;

  if (!quantities[ quantity ]) quantities[ quantity ] = 0;
  if (!ingredients[ ingredientName ]) ingredients[ ingredientName ] = 0;
  if (!units[ unit ]) units[ unit ] = 0;

  quantities[ quantity ]++;
  ingredients[ ingredientName ]++;
  units[ unit ]++;
}));

//console.log(JSON.stringify(allRecipes, null, '  '));

request.post({
  /** This is ONLY meant to work on localhost, the signup key will be different in "prod" preventing this script from running **/
  url: "http://localhost:1337/register",
  form: {
    username: "db_access_user",
    password: "test1234",
    signupKey: "abc123"
  }
}, function (error, response, body) {
  console.log(body);
});

//request({
//  method: "POST",
//  uri: "http://localhost:1337/ingredients",
//  data: JSON.stringify({name:"test_post_ingredient"})
//}, function (error, response, body) {
//  console.log(arguments);
//});
