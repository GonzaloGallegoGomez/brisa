'use strict';
// Read only the chosen palette. Legal pages do not change planner data or record acceptance.
try{const saved=JSON.parse(localStorage.getItem('brisa-v2'));const theme=saved?.preferences?.theme;if(['green','blue','orange','violet','rose'].includes(theme))document.documentElement.setAttribute('data-theme',theme)}catch{}
