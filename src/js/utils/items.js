const categoryIcons = { // TODO: move to other file and delete this one
    Miscellaneous: 'category',
    Kitchen: 'kitchen',
    Living_Room: 'local_cafe',
    // 'Bedroom': 'search'
};

const cardContents = {
    'Miscellaneous': [
        {
            id      : 1,
            name    : 'S_Miscellaneous_1_-_Lorem_Ipsum',
            title   : 'Bed Master Bedroom',
            subtitle: 'by Kurt Wagner',
            content : 'Visit ten places on our planet that are undergoing the biggest changes today.',
            image   : 'placeholder.jpg',
            icon    : 'king_bed',
            url     : 'https://www.google.com/',
        },
        {
            id      : 2,
            name    : 'S_Miscellaneous_2_-_Lorem_Ipsum',
            title   : 'Bed Bedroom',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum roof.',
            image   : 'fallback.jpg',
            icon    : 'single_bed',
            url     : 'http://example.com/',
        }
    ],
    'Kitchen': [
        {
            id      : 1,
            name    : 'S_Kitchen_1_-_Kitchen_Block',
            title   : 'Kitchen Block',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'placeholder.jpg',
            icon    : 'kitchen',
            url     : 'http://example.com/',
        },
        {
            id      : 2,
            name    : 'S_Kitchen_2_-_TV',
            title   : 'Dining Table',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'fallback.jpg',
            icon    : 'restaurant',
            url     : 'http://example.com/',
        }
    ],
    'Living_Room': [
        {
            id      : 1,
            name    : 'S_Living_Room_1_-_Sofa',
            title   : 'Sofa',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'placeholder.jpg',
            icon    : 'search',
            url     : 'https://www.google.com/',
        },
        {
            id      : 2,
            name    : 'S_Living_Room_2_-_TV',
            title   : 'TV',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'fallback.jpg',
            icon    : 'tv',
            url     : 'https://www.google.com/',
        },
        {
            id      : 3,
            name    : 'S_Living_Room_3_-_TV_Cabinet',
            title   : 'TV Cabinet',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'placeholder.jpg',
            icon    : 'search',
            url     : 'https://www.google.com/',
        },
        {
            id      : 4,
            name    : 'S_Living_Room_4_-_Stairs',
            title   : 'Stairs',
            subtitle: 'by Hello World',
            content : 'Lorem ipsum.',
            image   : 'fallback.jpg',
            icon    : 'search',
            url     : 'https://www.google.com/',
        }
    ]
};

export default {
    categoryIcons,
    cardContents,
};
