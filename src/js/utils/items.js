import placeholder from '../../assets/img/placeholder.jpg';

import tv from '../../assets/img/tv.jpg';
import tvCabinet from '../../assets/img/tv_cabinet.jpg';
import couch from '../../assets/img/couch.jpg';
import table from '../../assets/img/table.gif';
import kitchen from '../../assets/img/kitchen.jpg';
import stairs from '../../assets/img/stairs.jpeg';
import bed from '../../assets/img/bed.jpg';

const categoryIcons = {
    Living_Room: 'local_cafe',
    Kitchen: 'kitchen',
    Miscellaneous: 'category',
    // 'Bedroom': 'search'
};

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

const cardContents = { // Needs to be in the same order as categoryIcons
    'Living_Room': [
        {
            id      : 1,
            name    : 'S_Living_Room_1_-_Sofa',
            title   : 'Couch',
            subtitle: 'Meubella',
            content : '',
            image   : couch,
            icon    : 'search',
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
            title   : 'Kitchen Block',
            subtitle: 'Snaidero & Pininfarina',
            content : 'Design on point 👌.',
            image   : kitchen,
            icon    : 'kitchen',
            url     : 'https://www.snaidero-usa.com/modern-design-blog/eurocucina-2018-snaidero-and-pininfarina-bring-new-vision-modern-kitchen-design',
        },
        {
            id      : 2,
            name    : 'S_Kitchen_2_-_TV',
            title   : 'Dining Table',
            subtitle: 'YouTube',
            content : '',
            image   : table,
            icon    : 'restaurant',
            url     : 'https://www.youtube.com/watch?v=Epv2AYSrEhc',
        }
    ],
    'Miscellaneous': [
        {
            id      : 1,
            name    : 'S_Miscellaneous_1_-_Bed_Master_Bedroom', // TODO: check name
            title   : 'Bed Master Bedroom',
            subtitle: 'Swiss Sense',
            content : 'A bed like this would be epic.',
            image   : bed,
            icon    : 'king_bed',
            url     : 'https://www.retailing.nl/blog/interview-joey-janssen-swiss-sense/',
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
