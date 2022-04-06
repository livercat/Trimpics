// ==UserScript==
// @name         Trimpictionary
// @version      0.1
// @namespace    https://github.com/livercat/Trimpictionary
// @downloadURL  https://github-cdn.vercel.app/livercat/Trimpictionary/trimpictionary.user.js
// @updateURL    https://github-cdn.vercel.app/livercat/Trimpictionary/trimpictionary.user.js
// @description  Pictographic and more compact UI for the game Trimps
// @author       livercat
// @match        *trimps.github.io*
// @resource     RPGAwesome_woff https://github.com/nagoshiashumari/Rpg-Awesome/raw/master/fonts/rpgawesome-webfont.woff
// @grant        GM_getResourceURL
// ==/UserScript==

'use strict';

function getTrimpictionaryStyle() {
   const head = document.getElementsByTagName('head')[0];
   if (!head) {
       return false;
   }
   if (document.getElementById('trimpictionary')) {
       return false;
   }
   const style = document.createElement('style');
   style.id = 'trimpictionary';
   style.type = 'text/css';
   head.appendChild(style);
   return style;
}

function compileStyles() {
    const styles = [];
    // https://nagoshiashumari.github.io/Rpg-Awesome/
    const fontUrl = GM_getResourceURL("RPGAwesome_woff").replace('data:application', 'data:font/opentype');
    styles.push('@font-face { font-family: "RPGAwesome"; ' +
                `src: url(${fontUrl}) format("woff"); ` +
                'font-weight: normal; font-style: normal; }');

    // reduce font size on most buttons
    styles.push('.fightBtn { padding-top: 0.05vw !important; }');
    styles.push('.workBtn { padding-top: 0.2vw !important; }');
    styles.push('.workBtn, .fightBtn, #autoMapLabel, .tabSelected a, .tabNotSelected a, #battleSideTitle, #autoMapStatus { font-size: 0.8vw !important; }');

    // make alerts scale with their text size, not tab space
    styles.push('#voidAlert { top: -2px !important; padding: 0.3em 0.55em 0.1em 0.55em !important; }');
    styles.push('#talentsAlert { padding: 0.4em 0.7em 0.1em 0.7em !important; min-width: 1em !important; margin-right: 0.2em !important; }');

    // reduce map title font size
    styles.push('.titleDiv { font-size: 1.1em !important; padding: 0.1em 0 0.1em 0 !important}');

    // reduce font size for breeding info & trapping bar
    styles.push('#empHide, #unempHide { font-size: 1vw !important; }');
    styles.push('#trappingBar { line-height: 1em; }');
    styles.push('#trappingProgress { margin: 0.1em; }');

    // reduce font size for He/Hr and map status from AutoTrimps, and remove linebreaks from it
    styles.push('#hiderStatus { font-size: 0.6vw !important; }');
    styles.push('#hiderStatus br { display: none !important; }');

    // fix weird gaps between map cells
    styles.push('#grid, #mapGrid { overflow: hidden; }');
    styles.push('.battleRow { margin-bottom: -0.55em; }');
    styles.push('.battleCell { height: 2.3em; overflow: hidden; padding-top: 0.8vh !important; }');

    // replace text with icons on some buttons
    const iconProps = 'font-style: normal; font-weight: normal; font-variant: normal; text-transform: none; ' +
                      'line-height: 1; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;';
    const icomoonClass = `font-family: "icomoon"; ${iconProps}`;
    const glyphiconClass = `font-family: "Glyphicons Halflings"; ${iconProps}`;
    const rpgClass = `font-family: "RPGAwesome"; ${iconProps}`;

    const buildings = {
        'Trap': {rpg: 'e904'},
        'Barn': {glyphicon: 'f8ff'},
        'Shed': {glyphicon: 'e200'},
        'Forge': {icomoon: 'f1b3'},
        'Hut': {glyphicon: '26fa'},
        'House': {glyphicon: 'e021'},
        'Mansion': {icomoon: 'e783'},
        'Hotel': {icomoon: 'e784'},
        'Resort': {rpg: 'ea56'},
        'Gateway': {icomoon: 'e894'},
        'Wormhole': {rpg: 'ea6d'},
        'Collector': {icomoon: 'e8da'},
        'Warpstation': {icomoon: 'e8d9'},
        'Gym': {rpg: 'ea48'},
        'Tribute': {glyphicon: 'e225'},
        'Nursery': {icomoon: 'e6b5'},
    };

    const jobs = {
        'Farmer': {glyphicon: 'f8ff'},
        'Lumberjack': {glyphicon: 'e200'},
        'Miner': {icomoon: 'f1b3'},
        'Scientist': {icomoon: 'e82b'},
        'Trainer': {icomoon: 'e70f'},
        'Explorer': {icomoon: 'e806'},
        'Geneticist': {icomoon: 'e819'},
        'Magmamancer': {glyphicon: 'e104'},
    };

    const equipment = {
        'Shield': {rpg: 'e9fd'},
        'Dagger': {rpg: 'ea65'},
        'Boots': {rpg: 'e93c'},
        'Mace': {rpg: 'ea1d'},
        'Helmet': {rpg: 'e9fe'},
        'Polearm': {rpg: 'eaac'},
        'Pants': {rpg: 'e944'},
        'Battleaxe': {rpg: 'e917'},
        'Shoulderguards': {rpg: 'e9a1'},
        'Greatsword': {rpg: 'ea7e'},
        'Breastplate': {rpg: 'eae0'},
        'Arbalest': {rpg: 'eac3'},
        'Gambeson': {rpg: 'e90f'},
    };

    for (const [type, collection] of Object.entries({buildings: buildings, jobs: jobs, equipment: equipment})) {
        styles.push(`#${type}Here { margin-top: 0.5em !important; margin-bottom: 0.5em !important; }`);
        styles.push(`#${type}Here > div:not(#generatorWindow):not(#GeneticistassistContainer) ` +
                    '{ width: 14% !important; padding-top: 0.5em !important; height: 3em; overflow: hidden; margin-bottom: -0.4em; }');
        for (const [item, icon] of Object.entries(collection)) {
            let iconClass, iconContent;
            if (icon.glyphicon !== undefined) {
                iconClass = glyphiconClass;
                iconContent = icon.glyphicon;
            } else if (icon.icomoon !== undefined) {
                iconClass = icomoonClass;
                iconContent = icon.icomoon;
            } else {
                iconClass = rpgClass;
                iconContent = icon.rpg;
            }
            // remove <br>
            styles.push(`#${type}Here #${item} > br { display: none !important; }`);
            // hide original text
            styles.push(`#${type}Here #${item} > .thingName { ${iconClass}; visibility: hidden !important; font-size: 0.001em; }`);
            // insert icon
            styles.push(`#${type}Here #${item} > .thingName:before { content: "\\${iconContent}"; visibility: visible !important; font-size: 1500em; }`);
            // set quantity font size
            styles.push(`#${type}Here #${item} > .thingOwned { margin-left: 0.4em; font-size: 1.1em; }`);

            if (type === 'equipment') {
                // restore equipment tier
                styles.push(`#${type}Here #${item} > .thingName > #${item}Numeral { visibility: visible !important; margin-left: 0.2em; font-size: 1000em; }`);
                // make level more compact
                styles.push(`#${type}Here #${item} > .thingOwned { visibility: hidden; font-size: 0.001em; }`);
                styles.push(`#${type}Here #${item} > .thingOwned:before { content: "x"; visibility: visible !important; font-size: 1200em; margin-left: 0.5em }`);
                styles.push(`#${type}Here #${item} > .thingOwned > #${item}Owned { visibility: visible !important; font-size: 1200em !important; }`);
            }
        }
    }

    // special handling for Geneticistassist buttons
    const GAContainer = '#jobsHere > #GeneticistassistContainer';
    const GAButton = `${GAContainer} > #Geneticistassist`;
    styles.push(`${GAContainer} { width: 28.1% !important; }`);
    styles.push(`${GAContainer} > #Geneticist, ${GAContainer} > #Geneticistassist { width: 50% !important; padding-top: 0.5em !important; height: 3em; overflow: hidden; margin-bottom: -0.4em !important; }`);
    // hide the "Geneticistassist" text
    styles.push(`${GAButton} { text-indent: -9999px; line-height: 0;}`);
    // restore the rest of the GA button
    styles.push(`${GAButton} > #GAIndicator::before { content: ""; text-indent: 0; display: block; line-height: initial; padding-top: 0.4em;}`);
    styles.push(`${GAButton} > #GeneticistassistSetting { line-height: initial; }`);

    return styles;
}

function main() {
    const styleElement = getTrimpictionaryStyle();
    if (styleElement) {
        const styles = compileStyles();
        styleElement.innerHTML = styles.join('\n');
    }
}

main();