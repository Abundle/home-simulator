import tv from '../../assets/img/tv.jpg';
import tvCabinet from '../../assets/img/tv_cabinet.jpg';
import couch from '../../assets/img/couch.jpg';
import table from '../../assets/img/table.jpg';
import kitchen from '../../assets/img/kitchen.jpg';
import stairs from '../../assets/img/stairs.jpeg';
import bed from '../../assets/img/bed.jpg';
import placeholder from '../../assets/img/placeholder.jpg';

/* For debugging */
const WEBPACK_MODE = process.env.NODE_ENV;
const isDev = WEBPACK_MODE !== 'production';
const isMobile = window.screen.width <= 900;

const levels = [
    'Basement',
    'Ground floor',
    'Upper floor',
    'House'
];

const controls = [
    'reset',
    'front',
    'top',
    'back'
];

// TODO: set correct camera & blur values
const contents = {
    Living_Room: {
        icon: 'local_cafe',
        content: [
            {
                id      : 1,
                name    : 'S_Living_Room_1_-_Sofa',
                title   : 'Couch',
                subtitle: 'Meubella',
                text    : '',
                image   : couch,
                icon    : 'weekend',
                url     : 'https://www.meubella.nl/hoekbank-nicoreta-zwart-rechts-10523.html',
                camera  : {
                    // Position of object is already retrieved from the model, but this
                    // allows for tweaking the camera for every object individually
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            },
            {
                id      : 2,
                name    : 'S_Living_Room_2_-_TV',
                title   : 'TV',
                subtitle: 'Pinterest',
                text    : 'Cable management inspiration.',
                image   : tv,
                icon    : 'tv',
                url     : 'https://nl.pinterest.com/pin/313492824044646031/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 27, aperture: 0.003 },
                }
            },
            {
                id      : 3,
                name    : 'S_Living_Room_3_-_TV_Cabinet',
                title   : 'TV Cabinet',
                subtitle: 'Meubella',
                text    : '',
                image   : tvCabinet,
                icon    : 'search',
                url     : 'https://www.meubella.nl/tv-meubel-flame-wit-320-cm.html',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            },
            {
                id      : 4,
                name    : 'S_Living_Room_4_-_Stairs',
                title   : 'Floating Staircase',
                subtitle: 'Guido Ciompi',
                text    : 'Great design, maybe a bit dangerous.',
                image   : stairs,
                icon    : 'search',
                url     : 'https://inspirationfeed.com/20-innovative-staircase-designs/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            }
        ]
    },
    Kitchen: {
        icon: 'kitchen',
        content:  [
            {
                id      : 1,
                name    : 'S_Kitchen_1_-_Kitchen_Block',
                title   : 'Lorem ipsum',
                subtitle: 'Snaidero & Pininfarina',
                text    : 'Design on point 👌.',
                image   : kitchen,
                icon    : 'kitchen',
                url     : 'https://example.com/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            },
            {
                id      : 2,
                name    : 'S_Kitchen_2_-_Dining_Table',
                title   : 'Dining Table',
                subtitle: 'YouTube',
                text    : '',
                image   : table,
                icon    : 'restaurant',
                url     : 'https://www.wharfside.co.uk/dining-furniture/detail/modern-designer-dining-tables-dm7700',
                camera  : {
                    position_offset: { x:15, y:15, z:15 },
                    zoom    : 0,
                    blur    : { focus: 27, aperture: 0.003 },
                }
            }
        ],
    },
    Bedroom: {
        icon: 'hotel',
        content: [
            {
                id      : 1,
                name    : 'S_Default_2_-_Bed_Bedroom',
                title   : 'Bed Master Bedroom',
                subtitle: 'Swiss Sense',
                text    : 'A bed like this would be epic.',
                image   : bed,
                icon    : 'king_bed',
                url     : 'https://www.retailing.nl/blog/interview-joey-janssen-swiss-sense/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            },
            {
                id      : 2,
                name    : 'S_Kitchen_2_-_TV',
                title   : 'Dining Table',
                subtitle: 'YouTube',
                text    : 'Lorem ipsum',
                image   : placeholder,
                icon    : 'restaurant',
                url     : 'https://example.com/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            }
        ]
    },
    Study: {
        icon: 'book',
        content: [
            {
                id      : 1,
                name    : 'S_Default_1_-_Bed_Master_Bedroom',
                title   : 'Bed Master Bedroom',
                subtitle: 'Swiss Sense',
                text    : 'A bed like this would be epic.',
                image   : bed,
                icon    : 'king_bed',
                url     : 'https://www.retailing.nl/blog/interview-joey-janssen-swiss-sense/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            }
        ]
    },
    Miscellaneous: {
        icon: 'category',
        content: [
            {
                id      : 1,
                name    : 'S_Miscellaneous_1_-_Bed_Master_Bedroom',
                title   : 'Bed Master Bedroom',
                subtitle: 'Swiss Sense',
                text    : 'Lorem ipsum',
                image   : placeholder,
                icon    : 'king_bed',
                url     : 'https://example.com/',
                camera  : {
                    position_offset: { x:0, y:0, z:0 },
                    zoom    : 0,
                    blur    : { focus: 0, aperture: 10 },
                }
            },
        ]
    },
};

const cameraViews = {
    front: { x: 0, y: 150, z: 300 },
    top: { x: 0, y: 300, z: 1 },
    back: { x: 0, y: 150, z: -300 },
}

const outlinePassParameters = {
    edgeStrength: 3,
    edgeGlow: 0.0,
    edgeThickness: 1,
    pulsePeriod: 0,
    rotate: false,
    usePatternTexture: false,
};

const saoParameters = {
    output: 0,
    saoBias: 1,
    saoIntensity: 0.01,
    saoScale: 10,
    saoKernelRadius: 75,
    saoMinResolution: 0,
    saoBlur: true,
    saoBlurRadius: 4,
    saoBlurStdDev: 7,
    saoBlurDepthCutoff: 0.0008
};

const bokehParameters = {
    focus: 0,
    aperture: 0,
    maxblur: 0.01
};

const timeHandle = {
    cssVar: '--time-bg-color',
    activeColor: '#f15b27',
    inActiveColor: '#6691fa',
};

export default {
    isDev,
    isMobile,
    levels,
    controls,
    contents,
    cameraViews,
    outlinePassParameters,
    saoParameters,
    bokehParameters,
    timeHandle,
};
