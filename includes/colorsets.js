

var diceTextures = {};

function ImageLoader(sources, callback) {
    let images = {};
    let loadedImages = 0;

    let itemprops = Object.entries(sources);
    let numImages = itemprops.length;
    for (const [key, value] of itemprops) {

    //for (var src in sources) {

        if(value.source == '') {
            ++loadedImages
            continue;
        }

        images[key] = new Image();
        images[key].onload = function() {

            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[key].src = value.source;
    }
}

const TEXTURELIST = {
    'cloudy': {
        name: 'Clouds',
        source: './textures/cloudy.png'
    },
    'fire': {
        name: 'Fire',
        source: './textures/fire.png'
    },
    'marble': {
        name: 'Marble',
        source: './textures/marble.png'
    },
    'water': {
        name: 'Water',
        source: './textures/water.png'
    },
    'ice': {
        name: 'Ice',
        source: './textures/ice.png'
    },
    'paper': {
        name: 'Paper',
        source: './textures/paper.png'
    },
    'speckles': {
        name: 'Speckles',
        source: './textures/speckles.png'
    },
    'glitter': {
        name: 'Glitter',
        source: './textures/glitter.png'
    },
    'stars': {
        name: 'Stars',
        source: './textures/stars.png'
    },
    'stainedglass': {
        name: 'Stained Glass',
        source: './textures/stainedglass.png'
    },
    'skulls': {
        name: 'Skulls',
        source: './textures/skulls.png'
    },
    'leopard': {
        name: 'Leopard',
        source: './textures/leopard.png'
    },
    'tiger': {
        name: 'Tiger',
        source: './textures/tiger.png'
    },
    'cheetah': {
        name: 'Cheetah',
        source: './textures/cheetah.png'
    },
    'astral': {
        name: 'Astral Sea',
        source: './textures/astral.png'
    },
    'acleaf': {
        name: 'AC Leaf',
        source: './textures/acleaf.png'
    },
    'thecage': {
        name: 'Nicholas Cage',
        source: './textures/thecage.png'
    },
    'isabelle': {
        name: 'Isabelle',
        source: './textures/isabelle.png'
    },
    'none': {
        name: 'None',
        source: ''
    },
    '': {
        name: '~ Preset ~',
        source: ''
    }
};

function getTexture(texturename) {

    if (Array.isArray(texturename)) {

        let textures = [];
        for(let i = 0, l = texturename.length; i < l; i++){
            if (typeof texturename[i] == 'string') {
                textures.push(getTexture(texturename[i]));
            }
        }
        return textures;
    }

    if (!texturename || texturename == '') {
        return {name:'',texture:''};
    }

    if (texturename == 'none') {
        return {name:'none',texture:''};
    }

    if(texturename == 'random') {
        let names = Object.keys(diceTextures);
        // add 'none' for possibility of no texture
        names.pop(); //remove 'random' from this list

        return getTexture(names[Math.floor(Math.random() * names.length)]);
    }

    if (diceTextures[texturename] != null) {
        return { name: texturename, texture: diceTextures[texturename] };
    }
    return {name:'',texture:''};
}

var COLORSETS = {
    'radiant': {
        name: 'Radiant',
        category: 'Damage Types',
        foreground: '#F9B333',
        background: '#FFFFFF',
        outline: '',
        texture: 'paper',
        description: 'Radiant'
    },
    'fire': {
        name: 'Fire',
        category: 'Damage Types',
        foreground: '#f8d84f',
        background: ['#f8d84f','#f9b02d','#f43c04','#910200','#4c1009'],
        outline: 'black',
        texture: 'fire',
        description: 'Fire'
    },
    'ice': {
        name: 'Ice',
        category: 'Damage Types',
        foreground: '#60E9FF',
        background: ['#214fa3','#3c6ac1','#253f70','#0b56e2','#09317a'],
        outline: 'black',
        texture: 'ice',
        description: 'Ice'
    },
    'poison': {
        name: 'Poison',
        category: 'Damage Types',
        foreground: '#D6A8FF',
        background: ['#313866','#504099','#66409e','#934fc3','#c949fc'],
        outline: 'black',
        texture: 'cloudy',
        description: 'Poison'
    },
    'acid': {
        name: 'Acid',
        category: 'Damage Types',
        foreground: '#A9FF70',
        background: ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25'],
        outline: 'black',
        texture: 'marble',
        description: 'Acid'
    },
    'thunder': {
        name: 'Thunder',
        category: 'Damage Types',
        foreground: '#FFC500',
        background: '#7D7D7D',
        outline: 'black',
        texture: 'cloudy',
        description: 'Thunder'
    },
    'lightning': {
        name: 'Lightning',
        category: 'Damage Types',
        foreground: '#FFC500',
        background: ['#f17105', '#f3ca40','#eddea4','#df9a57','#dea54b'],
        outline: '#7D7D7D',
        texture: 'ice',
        description: 'Lightning'
    },
    'air': {
        name: 'Air',
        category: 'Damage Types',
        foreground: '#ffffff',
        background: ['#d0e5ea', '#c3dee5','#a4ccd6','#8dafb7','#80a4ad'],
        outline: 'black',
        texture: 'cloudy',
        description: 'Air'
    },
    'water': {
        name: 'Water',
        category: 'Damage Types',
        foreground: '#60E9FF',
        background: ['#87b8c4', '#77a6b2','#6b98a3','#5b8691','#4b757f'],
        outline: 'black',
        texture: 'water',
        description: 'Water'
    },
    'earth': {
        name: 'Earth',
        category: 'Damage Types',
        foreground: '#6C9943',
        background: ['#346804', '#184200','#527f22', '#3a1d04', '#56341a','#331c17','#5a352a','#302210'],
        outline: 'black',
        texture: 'speckles',
        description: 'Earth'
    },
    'force': {
        name: 'Force',
        category: 'Damage Types',
        foreground: 'white',
        background: ['#FF97FF', '#FF68FF','#C651C6'],
        outline: '#570000',
        texture: 'stars',
        description: 'Force'
    },
    'psychic': {
        name: 'Psychic',
        category: 'Damage Types',
        foreground: '#D6A8FF',
        background: ['#313866','#504099','#66409E','#934FC3','#C949FC','#313866'],
        outline: 'black',
        texture: 'speckles',
        description: 'Psychic'
    },
    'necrotic': {
        name: 'Necrotic',
        category: 'Damage Types',
        foreground: '#ffffff',
        background: '#6F0000',
        outline: 'black',
        texture: 'skulls',
        description: 'Necrotic'
    },
    'breebaby': {
        name: 'Pastel Sunset',
        category: 'Custom Sets',
        foreground: ['#5E175E', '#564A5E','#45455E','#3D5A5E','#1E595E','#5E3F3D','#5E1E29','#283C5E','#25295E'],
        background: ['#FE89CF', '#DFD4F2','#C2C2E8','#CCE7FA','#A1D9FC','#F3C3C2','#EB8993','#8EA1D2','#7477AD'],
        outline: 'white',
        texture: 'marble',
        description: 'Pastel Sunset, for Breyanna'
    },
    'pinkdreams': {
        name: 'Pink Dreams',
        category: 'Custom Sets',
        foreground: 'white',
        background: ['#ff007c', '#df73ff','#f400a1','#df00ff','#ff33cc'],
        outline: '#570000',
        texture: 'skulls',
        description: 'Pink Dreams, for Ethan'
    },
    'inspired': {
        name: 'Inspired',
        category: 'Custom Sets',
        foreground: '#FFD800',
        background: '#C4C4B6',
        outline: '#8E8E86',
        texture: 'none',
        description: 'Inspired, for Austin'
    },
    'bloodmoon': {
        name: 'Blood Moon',
        category: 'Custom Sets',
        foreground: '#CDB800',
        background: '#6F0000',
        outline: 'black',
        texture: 'marble',
        description: 'Blood Moon, for Jared'
    },
    'starynight': {
        name: 'Stary Night',
        category: 'Custom Sets',
        foreground: '#4F708F',
        background: ['#091636','#233660','#4F708F','#8597AD','#E2E2E2'],
        outline: 'white',
        texture: 'speckles',
        description: 'Stary Night, for Mai'
    },
    'glitterparty': {
        name: 'Glitter Party',
        category: 'Custom Sets',
        foreground: 'white',
        background: ['#FFB5F5','#7FC9FF','#A17FFF'],
        outline: 'none',
        texture: 'glitter',
        description: 'Glitter Party, for Austin'
    },
    'astralsea': {
        name: 'Astral Sea',
        category: 'Custom Sets',
        foreground: '#565656',
        background: 'white',
        outline: 'none',
        texture: 'astral',
        description: 'The Astral Sea, for Austin'
    },
    'tigerking': {
        name: 'Tiger King',
        category: 'Other',
        foreground: '#ffffff',
        background: '#FFCC40',
        outline: 'black',
        texture: ['leopard', 'tiger', 'cheetah'],
        description: 'Leopard Print'
    },
    'covid': {
        name: 'COViD',
        category: 'Other',
        foreground: '#A9FF70',
        background: ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25'],
        outline: 'black',
        texture: 'fire',
        description: 'Covid-19'
    },
    'acleaf': {
        name: 'Animal Crossing',
        category: 'Other',
        foreground: '#00FF00',
        background: '#07540A',
        outline: 'black',
        texture: 'acleaf',
        description: 'Animal Crossing Leaf'
    },
    'isabelle': {
        name: 'Isabelle',
        category: 'Other',
        foreground: 'white',
        background: '#FEE5CC',
        outline: 'black',
        texture: 'isabelle',
        description: 'Isabelle'
    },
    'thecage': {
        name: 'Nicholas Cage',
        category: 'Other',
        foreground: '#ffffff',
        background: '#ffffff',
        outline: 'black',
        texture: 'thecage',
        description: 'Nicholas Cage'
    },
    'test': {
        name: 'Test',
        category: 'Colors',
        foreground: ['#00FF00','#0000FF','#FF0000'],
        background: ['#FF0000','#00FF00','#0000FF'],
        outline: 'black',
        texture: 'none',
        description: 'Test'
    },
    'rainbow': {
        name: 'Rainblow',
        category: 'Colors',
        foreground: ['#FF5959','#FFA74F','#FFFF56','#59FF59','#2374FF','#00FFFF','#FF59FF'],
        background: ['#900000','#CE3900','#BCBC00','#00B500','#00008E','#008282','#A500A5'],
        outline: 'black',
        texture: 'none',
        description: 'Rainblow'
    },
    'random': {
        name: 'RaNdOm',
        category: 'Colors',
        foreground: [],
        outline: [],
        background: [],
        texture: [],
        description: 'RaNdOm'
    },
    'black': {
        name: 'Black',
        category: 'Colors',
        foreground: '#ffffff',
        background: '#000000',
        outline: 'black',
        texture: 'none',
        description: 'Black',
    },
    'white': {
        name: 'White',
        category: 'Colors',
        foreground: '#000000',
        background: '#FFFFFF',
        outline: '#FFFFFF',
        texture: 'none',
        description: 'White'
    },


    'swrpg_abi': {
        name: 'Star Wars RPG - Ability',
        category: 'Star Wars™ RPG',
        foreground: '#000000',
        background: ['#3D9238','#52B848','#5EAC56','#9ECB9A'],
        outline: 'none',
        texture: 'cloudy',
        description: 'Star Wars™ RPG Ability Dice'
    },
    'swrpg_pro': {
        name: 'Star Wars RPG - Proficiency',
        category: 'Star Wars™ RPG',
        foreground: '#000000',
        background: ['#CABB1C','#F9E33B','#FFE900','#F0E49D'],
        outline: 'none',
        texture: 'paper',
        description: 'Star Wars™ RPG Proficiency Dice'
    },
    'swrpg_dif': {
        name: 'Star Wars RPG - Difficulty',
        category: 'Star Wars™ RPG',
        foreground: '#ffffff',
        background: ['#39165F','#664B84','#50247E','#745F88'],
        outline: 'none',
        texture: 'speckles',
        description: 'Star Wars™ RPG Difficulty Dice'
    },
    'swrpg_cha': {
        name: 'Star Wars RPG - Challenge',
        category: 'Star Wars™ RPG',
        foreground: '#ffffff',
        background: ['#A91F32','#EB4254','#E51836','#BA3645'],
        outline: 'none',
        texture: 'stainedglass',
        description: 'Star Wars™ RPG Challenge Dice'
    },
    'swrpg_boo': {
        name: 'Star Wars RPG - Boost',
        category: 'Star Wars™ RPG',
        foreground: '#000000',
        background: ['#4B9DC6','#689FC4','#85CFF2','#8FC0D8'],
        outline: 'none',
        texture: 'stars',
        description: 'Star Wars™ RPG Boost Dice'
    },
    'swrpg_set': {
        name: 'Star Wars RPG - Setback',
        category: 'Star Wars™ RPG',
        foreground: '#ffffff',
        background: ['#252223','#241F21','#282828','#111111'],
        outline: 'none',
        texture: 'glitter',
        description: 'Star Wars™ RPG Setback Dice'
    },
    'swrpg_for': {
        name: 'Star Wars RPG - Force',
        category: 'Star Wars™ RPG',
        foreground: '#000000',
        background: ['#F3F3F3','#D3D3D3','#BABABA','#FFFFFF'],
        outline: 'none',
        texture: 'stars',
        description: 'Star Wars™ RPG Force Dice'
    },


    'swa_red': {
        name: 'Armada Attack - Red',
        category: 'Star Wars™ Armada',
        foreground: '#ffffff',
        background: ['#440D19','#8A1425','#C72336','#C04551'],
        outline: 'none',
        texture: 'stainedglass',
        description: 'Star Wars™ Armada Red Attack Dice'
    },
    'swa_blue': {
        name: 'Armada Attack - Blue',
        category: 'Star Wars™ Armada',
        foreground: '#ffffff',
        background: ['#212642','#28286E','#2B348C','#3D4BB5','#5D64AB'],
        outline: 'none',
        texture: 'stainedglass',
        description: 'Star Wars™ Armada Blue Attack Dice'
    },
    'swa_black': {
        name: 'Armada Attack - Black',
        category: 'Star Wars™ Armada',
        foreground: '#ffffff',
        background: ['#252223','#241F21','#282828','#111111'],
        outline: 'none',
        texture: 'stainedglass',
        description: 'Star Wars™ Armada Black Attack Dice'
    },


    'xwing_red': {
        name: 'X-Wing Attack - Red',
        category: 'Star Wars™ X-Wing',
        foreground: '#ffffff',
        background: ['#440D19','#8A1425','#C72336','#C04551'],
        outline: 'none',
        texture: 'stars',
        description: 'Star Wars™ X-Wing Red Attack Dice'
    },
    'xwing_green': {
        name: 'X-Wing Attack - Green',
        category: 'Star Wars™ X-Wing',
        foreground: '#ffffff',
        background: ['#3D9238','#52B848','#5EAC56','#9ECB9A'],
        outline: 'none',
        texture: 'stars',
        description: 'Star Wars™ X-Wing Green Attack Dice'
    },


    'swl_atkred': {
        name: 'Legion Attack - Red',
        category: 'Star Wars™ Legion',
        foreground: '#ffffff',
        background: ['#440D19','#8A1425','#C72336','#C04551'],
        outline: 'none',
        texture: 'fire',
        description: 'Star Wars™ Legion Red Attack Dice'
    },
    'swl_atkblack': {
        name: 'Legion Attack - Black',
        category: 'Star Wars™ Legion',
        foreground: '#ffffff',
        background: ['#252223','#241F21','#282828','#111111'],
        outline: 'none',
        texture: 'fire',
        description: 'Star Wars™ Legion Black Attack Dice'
    },
    'swl_atkwhite': {
        name: 'Legion Attack - White',
        category: 'Star Wars™ Legion',
        foreground: '#000000',
        background: ['#ffffff','#DFF4FA','#BCBCBC','#F1EDE2','#F2ECE0'],
        outline: 'none',
        texture: 'fire',
        description: 'Star Wars™ Legion White Attack Dice'
    },
    'swl_defred': {
        name: 'Legion Defense - Red',
        category: 'Star Wars™ Legion',
        foreground: '#ffffff',
        background: ['#440D19','#8A1425','#C72336','#C04551'],
        outline: 'none',
        texture: 'fire',
        description: 'Star Wars™ Legion Red Defense Dice'
    },
    'swl_defwhite': {
        name: 'Legion Defense - White',
        category: 'Star Wars™ Legion',
        foreground: '#000000',
        background: ['#ffffff','#DFF4FA','#BCBCBC','#F1EDE2','#F2ECE0'],
        outline: 'none',
        texture: 'fire',
        description: 'Star Wars™ Legion White Defense Dice'
    }

};

const COLORCATEGORIES = [
    'Custom Sets',
    'Damage Types',
    'Colors',
    'Other',
    'Star Wars™ RPG',
    'Star Wars™ Armada',
    'Star Wars™ X-Wing',
    'Star Wars™ Legion',
];

function randomColor() {
    // random colors
    let rgb=[];
    rgb[0] = Math.floor(Math.random() * 254);
    rgb[1] = Math.floor(Math.random() * 254);
    rgb[2] = Math.floor(Math.random() * 254);

    // this is an attempt to make the foregroudn color stand out from the background color
    // it sometimes produces ok results
    let brightness = ((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) +  (parseInt(rgb[2]) * 114)) / 1000;
    let foreground = (brightness > 126) ? 'rgb(30,30,30)' : 'rgb(230,230,230)'; // high brightness = dark text, else bright text
    let background = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';

    return {background: background, foreground: foreground };
}

function initColorSets() {

    let sets = Object.entries(COLORSETS);
    for (const [name, data] of sets) {
        COLORSETS[name].id = name;
        COLORSETS[name].texture = getTexture(data.texture);
    }

    // generate the colors and textures for the random set
    for (let i = 0; i < 10; i++) {
        let randcolor = randomColor();
        let randtex = getTexture('random');

        if (randtex.name != '') {
            COLORSETS['random'].foreground.push(randcolor.foreground); 
            COLORSETS['random'].background.push(randcolor.background);
            COLORSETS['random'].outline.push(randcolor.background);
            COLORSETS['random'].texture.push(randtex);
        } else {
            COLORSETS['random'].foreground.push(randcolor.foreground); 
            COLORSETS['random'].background.push(randcolor.background);
            COLORSETS['random'].outline.push('black');
            COLORSETS['random'].texture.push('');
        }
    }
}

function getColorSet(colorsetname) {
    let colorset = COLORSETS[colorsetname] || COLORSETS['random'];
    return colorset;
}

function applyColorSet(colorset, texture = null, update = true) {

    var urlargs = [];
    var colordata = getColorSet(colorset);

    if (colorset && colorset.length > 0) {

        $t.DiceFactory.applyColorSet(colordata);

        urlargs.push('colorset='+colorset);

	    if (update) {
		    $t.selectByValue($t.id('color'), colorset);
            $t.DiceFavorites.settings['colorset'] = colorset;
	    }
    }

    if (texture || (colordata.texture && !Array.isArray(colordata.texture))) {

        var texturedata = getTexture((texture || colordata.texture.name));

        let tex = Array.isArray(texturedata) ? '' : texturedata;

        if (texturedata.name) {
            $t.DiceFactory.applyTexture(texturedata);
        }

        urlargs.push('texture='+tex.name);

        if (update) {
            $t.selectByValue($t.id('texture'), tex.name);
            $t.DiceFavorites.settings['texture'] = tex.name;
        }
    } else {
        if (update) {
            $t.selectByValue($t.id('texture'), '');
            $t.DiceFavorites.settings['texture'] = '';
        }
    }

    if (update && urlargs.length > 0) {
        $t.empty($t.id('colorname'));
        $t.id('colorname').innerHTML = 'Dice Theme: '+colordata.description+' - <a href="?'+urlargs.join('&')+'">🔗</a>';
        $t.DiceFavorites.storeSettings();
    }
}