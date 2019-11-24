// TODO: fill with Scene helper functions

let selectedObject;

export const removeLoadingScreen = () => {
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

/*export const setSelectedObject = object => {
    selectedObject = object;
};

export const getSelectedObjectPosition = () => {
    return selectedObject.position;
};

export const sigmoid = x => {
    return 1 / (1 + Math.pow(Math.E, -x));
    // return 1 / (1 + Math.pow(Math.E, -x));
};*/

