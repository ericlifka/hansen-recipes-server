/**
 * Measurement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    quantity: {
      type: 'float',
      required: true
    },

    unit: {
      type: 'string'
    },

    ingredient: {
      model: 'ingredient'
    },

    recipe: {
      model: 'recipe'
    }
  }
};

