class A {
    a;
    b;
    constructor(a, b) {}
}

export function isSameType(obj, C) {
    const objKeys = Object.getOwnPropertyNames(obj).sort();
    const cKeys = Object.getOwnPropertyNames(new A()).sort();
    console.log(cKeys)

    const o = new C();
    console.log(Object.getOwnPropertyNames(o))

    if(objKeys.length !== cKeys.length) {
        return false;
    }

    for(let i = 0; i < objKeys.length; i++) {
        if(!obj[objKeys[i]] || objKeys[i] !== cKeys[i]) {
            return false;
        }
    }
    
    return true;
}