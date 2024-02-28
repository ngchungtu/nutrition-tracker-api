export function isEmptyOrNil(value) {
    return ['', [], null, undefined].indexOf(value) !== -1;
}