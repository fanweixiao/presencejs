function randomAccess(min: number, max: number) {
  return Math.floor(Math.random() * (min - max) + max);
}

function decodeUnicode(str: string) {
  str = '\\u' + str;
  str = str.replace(/\\/g, '%');
  str = unescape(str);
  str = str.replace(/%/g, '\\');
  return str;
}

export function getRandomName(NameLength: number) {
  let name = '';
  for (let i = 0; i < NameLength; i++) {
    let unicodeNum = '';
    unicodeNum = randomAccess(0x4e00, 0x9fa5).toString(16);
    name += decodeUnicode(unicodeNum);
  }
  return name;
}
