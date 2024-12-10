const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

const dataPath = '../../../game/data.js';
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Create a wrapper that will attach the object to window
const wrappedContent = `
    window.fetishTagsObj = {};  
    window.reputObject = {};  
    window.skillTagsArray = [];  
    window.locationsObject = {};
    ${dataContent}
    window.fetishTagsObj = fetishTagsObj;  
    window.reputObject = reputObject;  
    window.skillTagsArray = skillTagsArray;  
    window.locationsObject = locationsObject;
`;

const dom = new JSDOM('<!DOCTYPE html><html><body><script>' + wrappedContent + '</script></body></html>', {
    runScripts: "dangerously",
    resources: "usable"
});


// Read the existing grammar file
const grammarPath = './syntaxes/dgg.tmLanguage.json';
const dataObject = require('../../../../game/data.js');

let grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));

// Example of your source data - replace with actual import
let sourceData = {
  functions: ['changeSchedule', 'breakUpOthers', 'showmap', 'lootbox', 'getchanged', 'lootback', 'shop', 'input', 'wear', 'hide', 'addStat', 'addModEff', 'addOneTimeEff', 'addDecEff', 'addOtherEff', 'addReput', 'delStat', 'addFading', 'addNotice', 'addNPC', 'addNPCtoList', 'populClear', 'populate', 'updateTime', 'getStats', 'getTattoo', 'reRoll', 'submiss', 'quest', 'changeMascFemNPC', 'end', 'endSex', 'endHookUp', 'moveStep', 'htmlBack', 'sex', 'social', 'clean', 'checkNPCcheating', 'fetishNPC', 'trust', 'obedience', 'useSkill', 'levelSkill', 'vacate', 'baseMascFem', 'hosted', 'tenant', 'getPierced', 'takeOffPiercings', 'clearPiercings', 'breakCheck', 'updateNpcList', 'undress', 'unbind', 'wallet', 'goHomeNPC', 'goHome', 'switchNPC', 'generateRelArray', 'loc', 'clearDungeon', 'oleclean', 'npcAttributeChange', 'pcAttributeChange', 'reputFaction', 'fetish', 'sleep', 'saveoutfit', 'putOnPiercing', 'saveL', 'stand', 'shower', 'setFeatures', 'step', 'restock', 'violationCheck'],
  tags: ['flag', 'gameplay', 'ppc', 'npc', 'world','quests','factions','config'],
  specialKeys: ['value', 'options'],
  fetKeys: Object.keys(dom.window.fetishTagsObj),
  skillKeys: dom.window.skillTagsArray,
  reputKeys: Object.keys(dom.window.reputObject),
  locationKeys: Object.keys(dom.window.locationsObject)
};

function createLocationPattern(locationKeys) {
  return {    
    comment: "Match location tag",
    match: `\\b(${locationKeys.join('|')})\\b`,
    name: "variable.key.location.dgg"
  };
}

function createSkillPattern(skillKeys) {
  return {    
    comment: "Match skill tag",
    match: `\\b(${skillKeys.join('|')})\\b`,
    name: "variable.key.skill.dgg"
  };
}

function createReputPattern(reputKeys) {
  return {    
    comment: "Match reput tag",
    match: `\\b(${reputKeys.join('|')})\\b`,
    name: "variable.key.reput.dgg"
  };
}

function createFetPattern(fetKeys) {
  return {    
    comment: "Match fet tag",
    match: `\\b(${fetKeys.join('|')})\\b`,
    name: "variable.key.fet.dgg"
  };
}

function createFunctionPattern(functions) {
  return {
    comment: "Match function",
    match: `\\b(${functions.join('|')})\\b`,
    name: "constant.language.keyword.dgg"
  };
}

function createTagPattern(tags) {
  return {
    comment: "Match tag",
    match: `\\b(${tags.join('|')})\\b`,
    name: "constant.language.value.dgg"
  };
}

function createSpecialKeysPattern(keys) {
  return {
    comment: "Match special keys",
    match: `\\b(${keys.join('|')})(?=":)`,
    name: "variable.key.special.dgg"
  };
}

function updatePattern(patterns, newPattern, commentToMatch) {
  const index = patterns.findIndex(p => p.comment === commentToMatch);
  if (index !== -1) {
      // Replace the existing pattern while preserving its position
      patterns[index] = newPattern;
  } else {
      patterns.push(newPattern);
  }
  return patterns; // Return the modified array
}

updatePattern(
  grammar.patterns, 
  createLocationPattern(sourceData.locationKeys), 
  "Match location tag"
);

updatePattern(
  grammar.patterns, 
  createSkillPattern(sourceData.skillKeys), 
  "Match skill tag"
);

updatePattern(
  grammar.patterns, 
  createReputPattern(sourceData.reputKeys), 
  "Match reput tag"
);

updatePattern(
  grammar.patterns, 
  createFetPattern(sourceData.fetKeys), 
  "Match fet tag"
);

updatePattern(
  grammar.patterns, 
  createFunctionPattern(sourceData.functions), 
  "Match function"
);

updatePattern(
  grammar.patterns, 
  createTagPattern(sourceData.tags), 
  "Match tag"
);

updatePattern(
  grammar.patterns, 
  createSpecialKeysPattern(sourceData.specialKeys), 
  "Match special keys"
);

// Write the updated grammar back to file
console.log("DONE")
fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2));
