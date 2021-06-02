function fakeParseJSON(str) {
  let i = 0;

  const value = parseValue();
  expectEndOfInput();
  return value;

  function parseObject() {
    if (str[i] === "{") {
      i++;
      skipWhitespace();

      const result = {};

      let initial = true;
      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      while (i < str.length && str[i] !== "}") {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }
        const key = parseString();
        if (key === undefined) {
          expectObjectKey();
        }
        skipWhitespace();
        eatColon();
        const value = parseValue();
        result[key] = value;
        initial = false;
      }
      expectNotEndOfInput("}");
      // move to the next character of '}'
      i++;

      return result;
    }
  }

  function parseArray() {
    if (str[i] === "[") {
      i++;
      skipWhitespace();

      const result = [];
      let initial = true;
      while (i < str.length && str[i] !== "]") {
        if (!initial) {
          eatComma();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }
      expectNotEndOfInput("]");
      // move to the next character of ']'
      i++;
      return result;
    }
  }

  function parseValue() {
    skipWhitespace();
    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword("true", true) ??
      parseKeyword("false", false) ??
      parseKeyword("null", null);
    skipWhitespace();
    return value;
  }

  function parseKeyword(name, value) {
    if (str.slice(i, i + name.length) === name) {
      i += name.length;
      return value;
    }
  }

  function skipWhitespace() {
    while (
      str[i] === " " ||
      str[i] === "\n" ||
      str[i] === "\t" ||
      str[i] === "\r"
    ) {
      i++;
    }
  }

  function parseString() {
    if (str[i] === '"') {
      i++;
      let result = "";
      while (i < str.length && str[i] !== '"') {
        if (str[i] === "\\") {
          const char = str[i + 1];
          if (
            char === '"' ||
            char === "\\" ||
            char === "/" ||
            char === "b" ||
            char === "f" ||
            char === "n" ||
            char === "r" ||
            char === "t"
          ) {
            result += char;
            i++;
          } else if (char === "u") {
            if (
              isHexadecimal(str[i + 2]) &&
              isHexadecimal(str[i + 3]) &&
              isHexadecimal(str[i + 4]) &&
              isHexadecimal(str[i + 5])
            ) {
              result += String.fromCharCode(
                parseInt(str.slice(i + 2, i + 6), 16)
              );
              i += 5;
            } else {
              i += 2;
              expectEscapeUnicode(result);
            }
          } else {
            expectEscapeCharacter(result);
          }
        } else {
          result += str[i];
        }
        i++;
      }
      expectNotEndOfInput('"');
      i++;
      return result;
    }
  }

  function isHexadecimal(char) {
    return (
      (char >= "0" && char <= "9") ||
      (char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
    );
  }

  function parseNumber() {
    let start = i;
    if (str[i] === "-") {
      i++;
      expectDigit(str.slice(start, i));
    }
    if (str[i] === "0") {
      i++;
    } else if (str[i] >= "1" && str[i] <= "9") {
      i++;
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }

    if (str[i] === ".") {
      i++;
      expectDigit(str.slice(start, i));
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }
    if (str[i] === "e" || str[i] === "E") {
      i++;
      if (str[i] === "-" || str[i] === "+") {
        i++;
      }
      expectDigit(str.slice(start, i));
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }
    if (i > start) {
      return Number(str.slice(start, i));
    }
  }

  function eatComma() {
    expectCharacter(",");
    i++;
  }

  function eatColon() {
    expectCharacter(":");
    i++;
  }

  // error handling
  function expectNotEndOfInput(expected) {
    if (i === str.length) {
      printCodeSnippet(`Expecting a \`${expected}\` here`);
      throw new Error("JSON_ERROR_0001 Unexpected End of Input");
    }
  }

  function expectEndOfInput() {
    if (i < str.length) {
      printCodeSnippet("Expecting to end here");
      throw new Error("JSON_ERROR_0002 Expected End of Input");
    }
  }

  function expectObjectKey() {
    printCodeSnippet(`Expecting object key here

For example:
{ "foo": "bar" }
  ^^^^^`);
    throw new Error("JSON_ERROR_0003 Expecting JSON Key");
  }

  function expectCharacter(expected) {
    if (str[i] !== expected) {
      printCodeSnippet(`Expecting a \`${expected}\` here`);
      throw new Error("JSON_ERROR_0004 Unexpected token");
    }
  }

  function expectDigit(numSoFar) {
    if (!(str[i] >= "0" && str[i] <= "9")) {
      printCodeSnippet(`JSON_ERROR_0005 Expecting a digit here

For example:
${numSoFar}5
${" ".repeat(numSoFar.length)}^`);
      throw new Error("JSON_ERROR_0006 Expecting a digit");
    }
  }

  function expectEscapeCharacter(strSoFar) {
    printCodeSnippet(`JSON_ERROR_0007 Expecting escape character

For example:
"${strSoFar}\\n"
${" ".repeat(strSoFar.length + 1)}^^
List of escape characters are: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u`);
    throw new Error("JSON_ERROR_0008 Expecting an escape character");
  }

  function expectEscapeUnicode(strSoFar) {
    printCodeSnippet(`Expect escape unicode

For example:
"${strSoFar}\\u0123
${" ".repeat(strSoFar.length + 1)}^^^^^^`);
    throw new Error("JSON_ERROR_0009 Expecting an escape unicode");
  }

  function printCodeSnippet(message) {
    const from = Math.max(0, i - 10);
    const trimmed = from > 0;
    const padding = (trimmed ? 4 : 0) + (i - from);
    const snippet = [
      (trimmed ? "... " : "") + str.slice(from, i + 1),
      " ".repeat(padding) + "^",
      " ".repeat(padding) + message
    ].join("\n");
    console.log(snippet);
  }
}

function printFailCase(json) {
  try {
    console.log(`fakeParseJSON('${json}')`);
    fakeParseJSON(json);
  } catch (error) {
    console.error(error);
  }
}

function printSuccessCase(json) {
  try {
    const result = fakeParseJSON(json)
    console.log(result)
  } catch(error) {
    console.error(error)
  }
}

const packageJsonSample = `{
  "name": "next-jamstack-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "run-s build:posts build:next",
    "build:posts": "ts-node --project tsconfig.builder.json ./src/builder/posts.ts",
    "build:next": "next build",
    "start": "next start",
    "test": "jest",
    "test:coverage": "jest --collect-coverage",
    "api:build": "aspida",
    "bundle:analyze": "ANALYZE=true yarn build"
  },
  "dependencies": {
    "@aspida/fetch": "^1.7.0",
    "@aspida/node-fetch": "^1.7.0",
    "@types/enzyme-adapter-react-16": "^1.0.6",
    "@types/jest": "^26.0.22",
    "@types/react-test-renderer": "^17.0.1",
    "babel-plugin-prismjs": "^2.0.1",
    "enzyme": "^3.11.0",
    "enzyme-adapter-react-16": "^1.15.6",
    "enzyme-to-json": "^3.6.2",
    "jest": "^26.6.3",
    "marked": "^2.0.3",
    "next": "^10.2.0",
    "node-fetch": "^2.6.1",
    "prismjs": "^1.23.0",
    "react": "17.0.1",
    "react-dom": "17.0.1",
    "react-test-renderer": "^17.0.2",
    "react-twemoji": "^0.3.0",
    "sass": "^1.32.8",
    "ts-jest": "^26.5.5"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^10.2.2",
    "@types/node": "^14.14.31",
    "@types/node-fetch": "^2.5.10",
    "@types/react": "^17.0.2",
    "babel-plugin-inline-react-svg": "^2.0.1",
    "npm-run-all": "^4.1.5",
    "rss-parser": "^3.12.0",
    "styled-components": "^5.2.1",
    "ts-node": "^10.0.0",
    "typescript": "^4.2.2"
  }
}`
printSuccessCase(packageJsonSample)