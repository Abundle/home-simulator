import tv from '../../assets/img/tv.jpg';
import tvCabinet from '../../assets/img/tv_cabinet.jpg';
import couch from '../../assets/img/couch.jpg';
import table from '../../assets/img/table.gif';
import kitchen from '../../assets/img/kitchen.jpg';
import stairs from '../../assets/img/stairs.jpeg';
import bed from '../../assets/img/bed.jpg';
import placeholder from '../../assets/img/placeholder.jpg';

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

const categoryIcons = {
    Living_Room: 'local_cafe',
    Kitchen: 'kitchen',
    Bedroom: 'hotel',
    Study: 'book',
    Miscellaneous: 'category',
};

// TODO: add custom camera properties (zoom, blur, etc.) for each object
const cardContents = { // Needs to be in the same order as categoryIcons
    'Living_Room': [
        {
            id      : 1,
            name    : 'S_Living_Room_1_-_Sofa',
            title   : 'Couch',
            subtitle: 'Meubella',
            content : '',
            image   : couch,
            icon    : 'weekend',
            url     : 'https://www.meubella.nl/hoekbank-nicoreta-zwart-rechts-10523.html',
        },
        {
            id      : 2,
            name    : 'S_Living_Room_2_-_TV',
            title   : 'TV',
            subtitle: 'Pinterest',
            content : 'Cable management inspiration.',
            image   : tv,
            icon    : 'tv',
            url     : 'https://nl.pinterest.com/pin/313492824044646031/',
        },
        {
            id      : 3,
            name    : 'S_Living_Room_3_-_TV_Cabinet',
            title   : 'TV Cabinet',
            subtitle: 'Meubella',
            content : '',
            image   : tvCabinet,
            icon    : 'search',
            url     : 'https://www.meubella.nl/tv-meubel-flame-wit-320-cm.html',
        },
        {
            id      : 4,
            name    : 'S_Living_Room_4_-_Stairs',
            title   : 'Floating Staircase',
            subtitle: 'Guido Ciompi',
            content : 'Great design, maybe a bit dangerous.',
            image   : stairs,
            icon    : 'search',
            url     : 'https://inspirationfeed.com/20-innovative-staircase-designs/',
        }
    ],
    'Kitchen': [
        {
            id      : 1,
            name    : 'S_Kitchen_1_-_Kitchen_Block',
            title   : 'Lorem ipsum',
            subtitle: 'Snaidero & Pininfarina',
            content : 'Design on point 👌.',
            image   : kitchen,
            icon    : 'kitchen',
            url     : 'https://example.com/',
        },
        {
            id      : 2,
            name    : 'S_Kitchen_2_-_Dining_Table',
            title   : 'Dining Table',
            subtitle: 'YouTube',
            content : '',
            image   : table,
            icon    : 'restaurant',
            url     : 'https://example.com/',
        }
    ],
    'Bedroom': [
        {
            id      : 1,
            name    : 'S_Default_2_-_Bed_Bedroom',
            title   : 'Bed Master Bedroom',
            subtitle: 'Swiss Sense',
            content : 'A bed like this would be epic.',
            image   : bed,
            icon    : 'king_bed',
            url     : 'https://www.retailing.nl/blog/interview-joey-janssen-swiss-sense/',
        },
        {
            id      : 2,
            name    : 'S_Kitchen_2_-_TV',
            title   : 'Dining Table',
            subtitle: 'YouTube',
            content : 'Lorem ipsum',
            image   : placeholder,
            icon    : 'restaurant',
            url     : 'https://example.com/',
        }
    ],
    'Study': [
        {
            id      : 1,
            name    : 'S_Default_1_-_Bed_Master_Bedroom',
            title   : 'Bed Master Bedroom',
            subtitle: 'Swiss Sense',
            content : 'A bed like this would be epic.',
            image   : bed,
            icon    : 'king_bed',
            url     : 'https://www.retailing.nl/blog/interview-joey-janssen-swiss-sense/',
        }
    ],
    'Miscellaneous': [
        {
            id      : 1,
            name    : 'S_Miscellaneous_1_-_Bed_Master_Bedroom',
            title   : 'Bed Master Bedroom',
            subtitle: 'Swiss Sense',
            content : 'Lorem ipsum',
            image   : placeholder,
            icon    : 'king_bed',
            url     : 'https://example.com/',
        },
        /*{
            id      : 2,
            name    : 'S_Miscellaneous_2_-_Lorem_Ipsum',
            title   : 'Bed Bedroom',
            subtitle: 'Hello World',
            content : 'Lorem ipsum roof.',
            image   : placeholder,
            icon    : 'single_bed',
            url     : 'http://example.com/',
        }*/
    ],
};

export default {
    categoryIcons,
    levels,
    controls,
    cardContents,
};
