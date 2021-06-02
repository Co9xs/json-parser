function fakeParseJSON(str) {
  let i = 0;
  function parseValue() {
    skipWhiteSpace()
    const value = 
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword('true', true) ?? 
      parseKeyword('false', false) ?? 
      parseKeyword('null', null);
    skipWhiteSpace()
    return value;
  }
  
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