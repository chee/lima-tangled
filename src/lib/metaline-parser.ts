type Metaline = {[property: string]: boolean|string}
enum MetalineParserState {
  begin,
  property,
  value,
  end
}
export default class MetalineParser {
  state: MetalineParserState = MetalineParserState.begin
  source = ""
  property = ""
  result: Metaline = {}
  parse(source: string): Metaline {
    this.state = MetalineParserState.begin
    this.result = {}
    this.property = ""
    this.source = source
    while (this.source.length) {
      this.next()
    }
    return this.result
  }
  next() {
    switch (this.state) {
      case MetalineParserState.begin: {
        this.source = this.source.replace(/^\s+/, "")
        let f = this.source[0]
        if (f == "=" || f == '"' || f == ",") {
          throw new Error(`invalid char at 0: ${f}`)
        } else {
          this.state = MetalineParserState.property
        }
        break;
      }
      case MetalineParserState.property: {
        let match = this.source.match(/^[^=]+/)
        if (!match) {
          throw new Error("i don't know")
        }
        this.property = match[0]
        this.source = this.source.slice(this.property.length + 1)
        this.state = MetalineParserState.value
        break
      }
      case MetalineParserState.value: {
        if (this.source[0] == '"') {
          let string = this.source.match(/^"((?:\\"|[^"])*)/)
          if (!string) {
            throw new Error("couldn't find closing quote")
          }
          let value = string[1]
          this.result[this.property] = value
          this.source = this.source.slice(2 + value.length)
        } else if (this.source.match(/^false\b/)) {
          this.result[this.property] = false
          this.source = this.source.slice(5)
        } else if (this.source.match(/^true\b/)) {
          this.result[this.property] = true
          this.source = this.source.slice(4)
        } else if (this.source.match(/^yes\b/)) {
          this.result[this.property] = true
          this.source = this.source.slice(3)
        } else if (this.source.match(/^no\b/)) {
          this.result[this.property] = false
          this.source = this.source.slice(2)
        } else {
          throw new Error(`bad value for ${this.property}`)
        }
        let commaetc = this.source.match(/^,\s*/)
        if (commaetc) {
          this.state = MetalineParserState.property
          this.source = this.source.slice(commaetc[0].length)
        } else if (this.source.match(/\s*$/)) {
          this.state = MetalineParserState.end
          this.source = ""
        }
      }
    }
  }
}
