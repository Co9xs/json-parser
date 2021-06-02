function fakeParseJSON(str) {
  let i = 0;
  function parseArray() {
    if (str[i] === '[') {
      i++
      skipWhiteSpace();

      const result = []
      let initial = true
      while (str[i] !== ']') {
        if (!initial) {
          eatComma()
        }
        const value = parseValue()
        result.push(value)
        initial = false
      }
      i++
      return result
    }
  }

  function parseObject() {
    if (str(i) === '{') {
      i++
      skipWhiteSpace()
      const result = {}
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
        result[key] = value
        initial = false
      }
      i++
      return result
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

  function skipWhiteSpace() {
    if (str[i] !== ' ') {
      throw new Error('Expected "whitespace".')
    }
    i++
  }
}