"use strict";
const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');
const request = require('request').defaults({ jar: true });

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

let files = [ 'appetizers', 'bread', 'breakfast-for-dinner' ];
let textBlobs = {};
files.forEach(file => {
  textBlobs[ file ] = fs.readFileSync(path.join(__dirname, `./${file}.txt`), "utf8");
});
let allRecipes = [];

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

let quantities = {};
let ingredients = {};
let units = {};

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

const endpoint = target => `http://localhost:1337/${target}`;
const post = Promise.promisify(request.post);
const entities = {
  ingredients: { },
  recipes: { },
  tags: { }
};

post({
  url: endpoint("register"),
  form: {
    username: "db_access_user",
    password: "test1234",
    signupKey: "abc123"
  }
}).then(() => post({
  url: endpoint("login"),
  form: {
    username: "db_access_user",
    password: "test1234"
  }
}))
  .then(createTags)
  .then(createIngredients)
  .then(createRecipes)
  .then(createMeasurements)
  .then(tagRecipes)
  .then(createSteps)
  .then(() => console.log('done!'))
  .catch(error => console.log('blew up: ', error));

function createTags() {
  console.log('Creating Tags...');
  let url = endpoint("tags");
  let defer = Promise.defer();
  let promise = defer.promise;

  files.forEach(tag => {
    promise = promise.then(() =>
      post({ url, form: { name: tag } })
        .then(result => {
          let entity = JSON.parse(result.body);
          entities.tags[ entity.name ] = entity.id;
        }));
  });

  defer.resolve('kick off the chain');
  return promise;
}

function createIngredients() {
  console.log('Creating Ingredient entities...');
  let url = endpoint("ingredients");
  let defer = Promise.defer();
  let promise = defer.promise;

  Object.keys(ingredients).forEach(name => {
    promise = promise.then(() =>
      post({ url, form: { name } })
        .then(result => {
          let entity = JSON.parse(result.body);
          entities.ingredients[ entity.name ] = entity.id;
        }));
  });

  defer.resolve('kick off the chain');
  return promise;
}

function createRecipes() {
  console.log('Creating Recipe entities...');
  let url = endpoint('recipes');
  let defer = Promise.defer();
  let promise = defer.promise;

  allRecipes.forEach(recipe => {
    promise = promise.then(() =>
      post({ url, form: { name: recipe.name } })
        .then(result => {
          let entity = JSON.parse(result.body);
          entities.recipes[ entity.name ] = entity.id;
        }));
  });

  defer.resolve('kick off the chain');
  return promise;
}

function createMeasurements() {
  console.log('Creating Measurements to link ingredients to recipes...');
  let url = endpoint('measurements');
  let defer = Promise.defer();
  let promise = defer.promise;

  allRecipes.forEach(recipe => {

    let recipeId = entities.recipes[ recipe.name ];
    recipe.ingredients.forEach(ingredient => {

      let ingredientId = entities.ingredients[ ingredient.ingredient ];
      promise = promise.then(() => post({
        url, form: {
          recipe: recipeId,
          ingredient: ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        }
      }));
    })
  });

  defer.resolve('kick off the chain');
  return promise;
}

function tagRecipes() {
  console.log('Associating Recipes and Tags...');
  let defer = Promise.defer();
  let promise = defer.promise;

  allRecipes.forEach(recipe => {
    let recipeId = entities.recipes[ recipe.name ];
    let tagId = entities.tags[ recipe.tags[ 0 ] ];

    promise = promise.then(() => post(endpoint(`recipes/${recipeId}/tags/${tagId}`)));
  });

  defer.resolve('kick off the chain');
  return promise;
}

function createSteps() {
  console.log('Adding Steps to recipes...');
  let url = endpoint('steps');
  let defer = Promise.defer();
  let promise = defer.promise;

  allRecipes.forEach(recipe => {
    let recipeId = entities.recipes[ recipe.name ];

    recipe.steps.forEach((text, ordinal) => {
      promise = promise.then(() =>
        post({ url, form: { text, ordinal, recipe: recipeId } }));
    });
  });

  defer.resolve('kick off the chain');
  return promise;
}
