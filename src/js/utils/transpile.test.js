
const component = () => {
    let element = document.createElement('div');
    const obj = { a: 'alpha', b: 'bravo' };

    // ES7 Object spread test
    const newObj = { ...obj, c: 'charlie' };
    console.log('ES7 Object spread example: newObj');
    console.log(newObj);

    // ES8 Object.values test
    // Will not transpile without babel polyfills because it is a new method
    console.log(' — — — — — — — — — -');
    console.log('ES8 Object.values example: Object.values(newObj)');
    console.log(Object.values(newObj));
    console.log(' — — — — — — — — — -');

    // ES Array.includes test
    console.log("ES7 Array.includes example: ['a', 'b', 'c'].includes('b')")
    console.log(['a', 'b', 'c'].includes('b'));
    console.log(' — — — — — — — — — -');

    // ES dotAll operator
    console.log("ES8 dotAll: /^.$/s.test('😁')")
    console.log(/^.$/s.test('😁')); // Prints true
    console.log(/^.$/s.test('\n')); // Prints true

    // ES named capture groups
    console.log("ES8 named capture groups");
    const eventDate = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/;
    const matchedObject = eventDate.exec('2019-04-03');
    console.log(matchedObject.groups.year); // Prints 2019
    console.log(matchedObject.groups.month); // Prints 04
    console.log(matchedObject.groups.day); // Prints 03

    // ES finally
    console.log('ES8 finally Promise')
    fetch('https://www.google.com/')
        .then()
        .catch()
        .finally(() => console.log(`I'm always called!`));

    // ES template literals
    function specByYear(strings, specExpression) {
        const str0 = strings[0];
        const str1 = strings[1];
        const currentYear = new Date().getFullYear();;

        return str0 + specExpression + currentYear + str1;
    }

    const spec = 'ECMAScript ';
    const output = specByYear`The ${ spec } spec is awesome! \u2665`;

    console.log(output);

    return element;
};
// Event queue block scoping test
for (let i = 0; i < 10; i++) {
    setTimeout(function() {
        console.log(i);
    }, 1);
}
document.body.appendChild(component());
