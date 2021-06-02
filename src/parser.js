function fakeParseJSON(str) {
  let i = 0;
  function parseObject() {
    if (str(i) === '{') {
      i++
      skipWhiteSpace()
      let initial = true

      while (str[i] === '}') {
        if (!initial) {
          eatComma();
          skipWhiteSpace();
        }
        const key = parseString()
        skipWhiteSpace();
        eatColon();
        const value = parseValue();
        initial = false
      }
      i++
    }
  }

  function eatComma() {
    if (str[i] !== ",") {
      throw new Error('Expected ",".')
    }
    i++
  }

  function eatColon() {
    if (str[i] !== ':') {
      throw new Error('Expected ":".')
    }
    i++
  }
}