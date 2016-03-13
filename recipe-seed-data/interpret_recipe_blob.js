"use strict";
const fs = require('fs');

let textblob = fs.readFileSync('./appetizers.txt', "utf8");
let sections = textblob.split('***');
sections.shift(); // first section is empty

sections = sections.map(s => s.split('\n\n'));

sections.forEach(s => { // remove empty sections
  if (!s[ s.length - 1 ].length) {
    s.pop();
  }
});

sections = sections.map(s => ({
  section: s[0],
  recipes: s.slice(1)
}));

sections.forEach(s => {
  s.recipes = s.recipes.map(r => {
    let lines = r.split('\n');

    return {
      name: lines[0],
      blob: lines.slice(1)
    };
  });
});


//sections.forEach(function (s) {
//  //s.forEach(function (r) {
//  //  console.log(r.length);
//  //});
//  //console.log('-');
//});

console.log(sections[0 ].recipes[0]);
